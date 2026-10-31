import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { ModelItem } from '../types';

export const ModelRegistryPage: React.FC = () => {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');

  const [formData, setFormData] = useState({
    name: '',
    model_id: '',
    provider_id: 1,
    tier: 1,
    input_price_per_m: 0.15,
    output_price_per_m: 0.60,
    quality_score: 88.0,
    latency_p50: 240.0,
    priority: 1,
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.getModels();
      setModels(res);
    } catch (e) {
      console.error('Error fetching models', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (model: ModelItem) => {
    try {
      await api.updateModel(model.id, {
        ...model,
        is_active: !model.is_active
      });
      fetchModels();
    } catch (e) {
      console.error('Error toggling model active status', e);
    }
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await api.updateModel(editingModel.id, formData);
      } else {
        await api.createModel(formData);
      }
      setShowAddModal(false);
      setEditingModel(null);
      fetchModels();
    } catch (err: any) {
      alert(err.message || 'Failed to save model.');
    }
  };

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.model_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'all' || m.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Model Registry & Pricing Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise registry configuring token prices, tier classifications, quality benchmarks, and priority ordering.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingModel(null);
            setFormData({
              name: '',
              model_id: '',
              provider_id: 1,
              tier: 1,
              input_price_per_m: 0.15,
              output_price_per_m: 0.60,
              quality_score: 88.0,
              latency_p50: 240.0,
              priority: 1,
              description: '',
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Model</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card rounded-2xl p-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400 font-semibold">Filter Tier:</span>
          {(['all', 1, 2, 3, 4] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                selectedTier === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Tiers' : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Models Table */}
      <div className="glass-card rounded-2xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Input ($/1M)</th>
                <th className="py-3 px-4">Output ($/1M)</th>
                <th className="py-3 px-4">Quality</th>
                <th className="py-3 px-4">P50 Latency</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredModels.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">{m.model_id}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{m.provider_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      m.tier === 1 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                      m.tier === 2 ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                      m.tier === 3 ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                      'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    }`}>
                      Tier {m.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400 font-bold">${m.input_price_per_m.toFixed(3)}</td>
                  <td className="py-3 px-4 font-mono text-slate-300 font-bold">${m.output_price_per_m.toFixed(3)}</td>
                  <td className="py-3 px-4 font-mono text-purple-300">{m.quality_score.toFixed(1)}/100</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{m.latency_p50}ms</td>
                  <td className="py-3 px-4 font-mono text-amber-400">P{m.priority}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(m)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition ${
                        m.is_active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {m.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{m.is_active ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setEditingModel(m);
                        setFormData({
                          name: m.name,
                          model_id: m.model_id,
                          provider_id: m.provider_id,
                          tier: m.tier,
                          input_price_per_m: m.input_price_per_m,
                          output_price_per_m: m.output_price_per_m,
                          quality_score: m.quality_score,
                          latency_p50: m.latency_p50,
                          priority: m.priority,
                          description: m.description,
                          is_active: m.is_active
                        });
                        setShowAddModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition mr-1"
                      title="Edit Model"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-purple-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {editingModel ? 'Edit Registered Model' : 'Register New AI Model'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Model Display Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Model Identifier (API slug):</label>
                <input
                  type="text"
                  required
                  disabled={!!editingModel}
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tier Assignment:</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value={1}>Tier 1: Small & Economical</option>
                    <option value={2}>Tier 2: Balanced General</option>
                    <option value={3}>Tier 3: Flagship Reasoning</option>
                    <option value={4}>Tier 4: Enterprise Private VPC</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Routing Priority (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Input Price ($ / 1M tokens):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.input_price_per_m}
                    onChange={(e) => setFormData({ ...formData, input_price_per_m: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Output Price ($ / 1M tokens):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.output_price_per_m}
                    onChange={(e) => setFormData({ ...formData, output_price_per_m: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
