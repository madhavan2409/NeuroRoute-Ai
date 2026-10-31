"""
SmartRoute AI - Core Chat & Intelligent Pipeline Endpoint
Coordinates all 10 Stages:
1. Analyze request
2. Identify task type
3. Determine complexity
4. Detect privacy & sensitivity
5. Pre-request cost estimation
6. Select optimal AI model (or Tier 4 private / fallback)
7. Execute model request (with automatic retry/fallback if primary fails)
8. Token accounting & actual cost computation
9. Multi-dimensional quality evaluation
10. Explain Routing Decision & Log end-to-end workflow stages
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import time
import uuid
import json

from backend.app.models.database import (
    get_db, RequestRecord, RoutingDecision, Workflow, QualityEvaluation, ModelRegistry
)
from backend.app.schemas.schemas import ChatRequest, ChatResponse, RoutingExplanation, QualityScorecard
from backend.app.classifiers.classifier_service import classifier_service
from backend.app.routing.routing_engine import routing_engine
from backend.app.caching.semantic_cache import semantic_cache
from backend.app.providers.provider_adapter import provider_adapter
from backend.app.evaluation.evaluator import quality_evaluator
from backend.app.services.cost_calculator import cost_calculator
from backend.app.security.security_guard import security_guard

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def process_chat_request(req: ChatRequest, db: Session = Depends(get_db)):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    start_total_time = time.time()
    workflow_stages = []
    request_id = f"sr-{uuid.uuid4().hex[:10]}"

    # --- STAGE 1: SECURITY CHECK ---
    t0 = time.time()
    sec_result = security_guard.inspect_prompt(prompt)
    if not sec_result["is_safe"]:
        # Blocked prompt injection
        security_guard.log_security_event(
            event_type="prompt_injection",
            severity="critical",
            prompt=prompt,
            action_taken="blocked",
            details="Prompt injection pattern detected by SmartRoute Security Guard"
        )
        raise HTTPException(status_code=403, detail="Request blocked by SmartRoute AI Security: Prompt injection pattern detected.")
    
    workflow_stages.append({
        "stage": "Security Check",
        "status": "passed",
        "duration_ms": round((time.time() - t0) * 1000, 1),
        "details": f"Risk level: {sec_result['risk_level']}. PII: {sec_result['contains_pii']}"
    })

    # --- STAGE 2: CLASSIFICATION ---
    t0 = time.time()
    classification = classifier_service.classify(prompt)
    complexity = classification["complexity"]
    task_type = classification["task_type"]
    privacy = classification["privacy"]
    priority = classification["priority"]
    confidence = classification["confidence"]

    workflow_stages.append({
        "stage": "Classification",
        "status": "completed",
        "duration_ms": round((time.time() - t0) * 1000, 1),
        "details": f"{complexity.upper()} | {task_type.upper()} | {privacy.upper()} (Confidence: {confidence*100:.1f}%)"
    })

    # --- STAGE 3: SEMANTIC CACHE LOOKUP ---
    t0 = time.time()
    cache_status = "MISS"
    cache_sim = 0.0
    cached_entry = None
    if req.allow_cache:
        is_hit, cached_entry, cache_sim = semantic_cache.lookup(
            prompt=prompt,
            task_type=task_type,
            privacy=privacy,
            db=db
        )
        if is_hit and cached_entry:
            cache_status = "HIT"

    workflow_stages.append({
        "stage": "Semantic Cache",
        "status": "hit" if cache_status == "HIT" else "miss",
        "duration_ms": round((time.time() - t0) * 1000, 1),
        "details": f"Status: {cache_status} (Similarity: {cache_sim:.3f})"
    })

    # --- STAGE 4: MODEL ROUTING DECISION ---
    t0 = time.time()
    routing_result = routing_engine.route_request(
        prompt=prompt,
        complexity=complexity,
        task_type=task_type,
        privacy=privacy,
        priority=priority,
        db=db,
        force_model_id=req.force_model_id
    )
    chosen_model = routing_result["chosen_model"]
    primary_model = routing_result["primary_model"]
    fallback_model = routing_result["fallback_model"]
    pre_flight = routing_result["pre_flight"]

    workflow_stages.append({
        "stage": "Model Selection",
        "status": "routed",
        "duration_ms": round((time.time() - t0) * 1000, 1),
        "details": f"Selected {chosen_model.name} (Tier {chosen_model.tier})"
    })

    # --- STAGE 5: EXECUTION (OR CACHE RETURN) ---
    t0 = time.time()
    fallback_triggered = False

    if cache_status == "HIT" and cached_entry:
        answer = cached_entry["response_text"]
        input_tokens = cost_calculator.estimate_tokens(prompt)
        output_tokens = cost_calculator.estimate_tokens(answer)
        actual_cost = 0.0  # 100% free on cache hit!
        exec_latency = round((time.time() - t0) * 1000 + 12.0, 1)
        active_model_name = cached_entry.get("model_name", chosen_model.name)
        active_provider_name = chosen_model.provider.name
        workflow_stages.append({
            "stage": "AI Processing",
            "status": "served_from_cache",
            "duration_ms": exec_latency,
            "details": "Zero API cost. Immediate response from semantic vector cache."
        })
    else:
        # Call chosen model
        provider_slug = chosen_model.provider.slug
        exec_res = await provider_adapter.execute_request(
            model_id=chosen_model.model_id,
            provider_slug=provider_slug,
            prompt=prompt,
            task_type=task_type,
            complexity=complexity
        )

        # Automatic fallback handling if primary model fails
        if not exec_res["success"]:
            fallback_triggered = True
            fallback_provider_slug = fallback_model.provider.slug
            exec_res = await provider_adapter.execute_request(
                model_id=fallback_model.model_id,
                provider_slug=fallback_provider_slug,
                prompt=prompt,
                task_type=task_type,
                complexity=complexity
            )
            chosen_model = fallback_model

        answer = exec_res["answer"]
        input_tokens = exec_res["input_tokens"]
        output_tokens = exec_res["output_tokens"]
        exec_latency = exec_res["latency_ms"]
        actual_cost = cost_calculator.calculate_cost(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            input_price_per_m=chosen_model.input_price_per_m,
            output_price_per_m=chosen_model.output_price_per_m
        )
        active_model_name = chosen_model.name
        active_provider_name = chosen_model.provider.name

        workflow_stages.append({
            "stage": "AI Processing",
            "status": "fallback_invoked" if fallback_triggered else "completed",
            "duration_ms": exec_latency,
            "details": f"Model: {active_model_name} | Latency: {exec_latency}ms"
        })

    # --- STAGE 6: QUALITY EVALUATION ---
    t0 = time.time()
    quality_res = quality_evaluator.evaluate(
        prompt=prompt,
        response_text=answer,
        task_type=task_type,
        complexity=complexity
    )
    workflow_stages.append({
        "stage": "Quality Evaluation",
        "status": "passed" if quality_res["passes_quality"] else "warning",
        "duration_ms": round((time.time() - t0) * 1000, 1),
        "details": f"Overall Score: {quality_res['overall']}/100 ({'Passed' if quality_res['passes_quality'] else 'Sub-optimal'})"
    })

    # --- STAGE 7: RESPONSE DELIVERY & CACHING ---
    baseline_cost, dollar_savings, savings_pct = cost_calculator.calculate_savings(
        actual_cost=actual_cost,
        actual_input_tokens=input_tokens,
        actual_output_tokens=output_tokens
    )
    actual_total_tokens = input_tokens + output_tokens
    baseline_tokens, tokens_saved, tokens_saved_pct = cost_calculator.calculate_token_savings(
        actual_total_tokens=actual_total_tokens,
        complexity=complexity,
        is_cache_hit=(cache_status == "HIT")
    )
    total_latency = round((time.time() - start_total_time) * 1000, 1)

    efficiency_info = cost_calculator.calculate_model_efficiency(
        cost_savings_pct=savings_pct,
        tokens_saved_pct=tokens_saved_pct,
        quality_score=quality_res["overall"],
        latency_ms=total_latency,
        model_tier=chosen_model.tier,
        is_cache_hit=(cache_status == "HIT")
    )

    # Store in semantic cache if it was a cache miss and quality passed
    if cache_status == "MISS" and quality_res["passes_quality"]:
        semantic_cache.store(
            prompt=prompt,
            response_text=answer,
            task_type=task_type,
            complexity=complexity,
            privacy=privacy,
            model_name=active_model_name,
            tokens_saved=input_tokens + output_tokens,
            cost_saved=actual_cost,
            db=db
        )

    total_latency = round((time.time() - start_total_time) * 1000, 1)

    workflow_stages.append({
        "stage": "Response Delivery",
        "status": "delivered",
        "duration_ms": 2.0,
        "details": f"Completed in {total_latency}ms. Saved {savings_pct:.1f}% vs flagship unrouted."
    })

    # --- PERSIST TO DATABASE ---
    try:
        record = RequestRecord(
            request_id=request_id,
            prompt=prompt,
            response_text=answer,
            task_type=task_type,
            complexity=complexity,
            privacy=privacy,
            priority=priority,
            confidence=confidence,
            selected_model_id=chosen_model.id,
            selected_provider=active_provider_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            estimated_cost=pre_flight["estimated_cost"],
            actual_cost=actual_cost,
            latency_ms=total_latency,
            success=True,
            quality_score=quality_res["overall"],
            cache_hit=(cache_status == "HIT"),
            routing_reason=routing_result["reason"]
        )
        db.add(record)
        db.flush()

        routing_decision = RoutingDecision(
            request_id=record.id,
            primary_model_id=primary_model.model_id,
            fallback_model_id=fallback_model.model_id,
            chosen_model_id=chosen_model.model_id,
            rule_applied="Cost-Optimal Quality Tier",
            routing_reason=routing_result["reason"],
            fallback_triggered=fallback_triggered,
            cost_savings_pct=savings_pct
        )
        db.add(routing_decision)

        quality_eval_rec = QualityEvaluation(
            request_id=record.id,
            correctness_score=quality_res["correctness"],
            relevance_score=quality_res["relevance"],
            completeness_score=quality_res["completeness"],
            clarity_score=quality_res["clarity"],
            overall_score=quality_res["overall"],
            evaluation_notes=quality_res["notes"],
            evaluator_type="rule_and_heuristic"
        )
        db.add(quality_eval_rec)

        workflow_rec = Workflow(
            request_id=record.id,
            stages_json=json.dumps(workflow_stages),
            status="completed",
            duration_ms=total_latency
        )
        db.add(workflow_rec)

        db.commit()
    except Exception as e:
        print(f"Error persisting request record: {e}")
        db.rollback()

    explanation = RoutingExplanation(
        selected_model=active_model_name,
        provider=active_provider_name,
        tier=chosen_model.tier,
        tier_label=routing_result["tier_label"],
        reason=routing_result["reason"],
        primary_candidate=primary_model.name,
        fallback_candidate=fallback_model.name,
        fallback_triggered=fallback_triggered,
        policy_checks_passed=routing_result["policy_checks_passed"],
        cost_savings_pct=savings_pct,
        unrouted_baseline_cost=baseline_cost,
        estimated_cost=pre_flight["estimated_cost"]
    )

    scorecard = QualityScorecard(
        correctness=quality_res["correctness"],
        relevance=quality_res["relevance"],
        completeness=quality_res["completeness"],
        clarity=quality_res["clarity"],
        overall=quality_res["overall"],
        notes=quality_res["notes"]
    )

    return ChatResponse(
        request_id=request_id,
        prompt=prompt,
        answer=answer,
        task_type=task_type,
        complexity=complexity,
        privacy=privacy,
        priority=priority,
        confidence=confidence,
        selected_model=active_model_name,
        selected_provider=active_provider_name,
        model_tier=chosen_model.tier,
        cache_status=cache_status,
        cache_similarity=cache_sim if cache_status == "HIT" else None,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=input_tokens + output_tokens,
        estimated_cost=pre_flight["estimated_cost"],
        actual_cost=actual_cost,
        cost_savings=dollar_savings,
        latency_ms=total_latency,
        quality_score=quality_res["overall"],
        tokens_saved=tokens_saved,
        tokens_saved_pct=tokens_saved_pct,
        baseline_tokens=baseline_tokens,
        efficiency_score=efficiency_info["score"],
        efficiency_rating=efficiency_info["rating"],
        cost_multiplier=efficiency_info["cost_efficiency_multiplier"],
        quality_scorecard=scorecard,
        routing_explanation=explanation,
        workflow_stages=workflow_stages,
        nvidia_classification=classification.get("nvidia_classification")
    )
