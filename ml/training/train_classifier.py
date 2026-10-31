"""
SmartRoute AI - Hybrid Classifier Training & Evaluation Pipeline
Trains ML models for:
1. Complexity (Simple, Medium, Advanced)
2. Task Type (Coding, Reasoning, Mathematics, General, Summarization, Creative, Data Analysis, System Architecture)
3. Privacy (Public, Confidential, Sensitive)
4. Business Priority (Normal, High, Critical)

Measures and outputs real metrics:
- Accuracy, Precision, Recall, F1-Score
- Confusion Matrices
- Saves models to ml/saved_models/classifier_bundle.joblib
"""

import json
import re
from pathlib import Path
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from ml.training.features import TextFeatureExtractor

def train_and_evaluate():
    root = Path(__file__).resolve().parent.parent
    dataset_file = root / "datasets" / "training_dataset.json"

    with open(dataset_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    prompts = [d["prompt"] for d in data]
    complexities = [d["complexity"] for d in data]
    task_types = [d["task_type"] for d in data]
    privacies = [d["privacy"] for d in data]
    priorities = [d["priority"] for d in data]

    # Split: 80% train, 10% validation, 10% test
    indices = np.arange(len(prompts))
    idx_train, idx_temp = train_test_split(indices, test_size=0.20, random_state=42, stratify=complexities)
    
    # Split temp into val (50%) and test (50%) -> 10% each of total
    temp_complexities = [complexities[i] for i in idx_temp]
    idx_val, idx_test = train_test_split(idx_temp, test_size=0.50, random_state=42, stratify=temp_complexities)

    X_train = [prompts[i] for i in idx_train]
    X_val = [prompts[i] for i in idx_val]
    X_test = [prompts[i] for i in idx_test]

    print(f"Data Split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

    # Feature extraction pipeline: Word TF-IDF + Char n-gram TF-IDF + Structural features
    feature_pipeline = FeatureUnion([
        ("word_tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=4000, sublinear_tf=True)),
        ("char_tfidf", TfidfVectorizer(ngram_range=(2, 4), analyzer="char_wb", max_features=3000)),
        ("dense_stats", TextFeatureExtractor())
    ])

    print("Fitting feature extraction pipeline...")
    X_train_feat = feature_pipeline.fit_transform(X_train)
    X_val_feat = feature_pipeline.transform(X_val)
    X_test_feat = feature_pipeline.transform(X_test)

    targets = {
        "complexity": {
            "train": [complexities[i] for i in idx_train],
            "val": [complexities[i] for i in idx_val],
            "test": [complexities[i] for i in idx_test],
            "model": LogisticRegression(max_iter=1000, C=2.0, class_weight="balanced")
        },
        "task_type": {
            "train": [task_types[i] for i in idx_train],
            "val": [task_types[i] for i in idx_val],
            "test": [task_types[i] for i in idx_test],
            "model": LogisticRegression(max_iter=1000, C=3.0, class_weight="balanced")
        },
        "privacy": {
            "train": [privacies[i] for i in idx_train],
            "val": [privacies[i] for i in idx_val],
            "test": [privacies[i] for i in idx_test],
            "model": LogisticRegression(max_iter=1000, C=5.0, class_weight="balanced")
        },
        "priority": {
            "train": [priorities[i] for i in idx_train],
            "val": [priorities[i] for i in idx_val],
            "test": [priorities[i] for i in idx_test],
            "model": LogisticRegression(max_iter=1000, C=2.0, class_weight="balanced")
        }
    }

    metrics = {}
    trained_models = {}

    for name, tdata in targets.items():
        print(f"\n--- Training Classifier for: {name.upper()} ---")
        clf = tdata["model"]
        clf.fit(X_train_feat, tdata["train"])
        trained_models[name] = clf

        # Evaluate on test set
        y_test = tdata["test"]
        y_pred = clf.predict(X_test_feat)
        classes = sorted(list(set(y_test) | set(y_pred)))

        acc = float(accuracy_score(y_test, y_pred))
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
        p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

        target_metrics = {
            "accuracy": round(acc, 4),
            "precision_macro": round(float(p_macro), 4),
            "recall_macro": round(float(r_macro), 4),
            "f1_macro": round(float(f1_macro), 4),
            "precision_weighted": round(float(p_weighted), 4),
            "recall_weighted": round(float(r_weighted), 4),
            "f1_weighted": round(float(f1_weighted), 4),
            "classes": classes,
            "confusion_matrix": cm,
            "test_samples": len(y_test)
        }
        metrics[name] = target_metrics
        print(f"Accuracy: {acc*100:.2f}% | F1-Score (weighted): {f1_weighted*100:.2f}% | F1-Score (macro): {f1_macro*100:.2f}%")

    # Save metrics JSON
    metrics_file = root / "evaluation" / "metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"\nSaved evaluation metrics to {metrics_file}")

    # Save model bundle
    bundle = {
        "feature_pipeline": feature_pipeline,
        "models": trained_models,
        "metrics": metrics,
        "version": "1.0.0"
    }
    model_file = root / "saved_models" / "classifier_bundle.joblib"
    joblib.dump(bundle, model_file)
    print(f"Saved trained classifier bundle to {model_file}")

if __name__ == "__main__":
    train_and_evaluate()
