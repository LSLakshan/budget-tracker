import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  getBudgets, getBudgetProgress, createBudget, updateBudget, deleteBudget, getCategories
} from '../services/api';
import { Plus, Pencil, Trash2, X, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(v ?? 0);

const PERIODS = ['MONTHLY', 'WEEKLY', 'YEARLY'];

// ── Progress bar ──────────────────────────────────────────────────────────────
function BudgetCard({ budget, progress, onEdit, onDelete }) {
  const pct = progress
    ? Math.min(100, (Number(progress.totalSpent) / Number(progress.budgetAmount)) * 100)
    : 0;
  const exceeded = progress?.exceeded;

  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 transition-all ${exceeded ? 'border-amber-500/40' : 'border-slate-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-white text-sm">{budget.categoryName}</p>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full mt-1 inline-block">
            {budget.period}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(budget)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"><Pencil size={14} /></button>
          <button onClick={() => onDelete(budget)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Spent: {progress ? fmt(progress.totalSpent) : '—'}</span>
          <span>Budget: {fmt(budget.amount)}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${exceeded ? 'bg-amber-500' : pct > 75 ? 'bg-orange-500' : 'bg-violet-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className={exceeded ? 'text-amber-400 font-semibold flex items-center gap-1' : 'text-slate-500'}>
            {exceeded && <AlertTriangle size={12} />}
            {exceeded ? 'Budget exceeded!' : `${pct.toFixed(0)}% used`}
          </span>
          {progress && (
            <span className="text-slate-500">
              {exceeded ? `Over by ${fmt(Math.abs(Number(progress.remaining)))}` : `${fmt(progress.remaining)} left`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function BudgetModal({ onClose, onSaved, initial, categories }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { amount: String(initial.amount), period: initial.period, categoryId: String(initial.categoryId) }
      : { amount: '', period: 'MONTHLY', categoryId: '' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.categoryId) { setError('Please select a category.'); return; }
    setLoading(true);
    try {
      const payload = { amount: parseFloat(form.amount), period: form.period, categoryId: parseInt(form.categoryId) };
      if (isEdit) await updateBudget(initial.id, payload);
      else await createBudget(payload);
      onSaved();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message ?? 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 animate-scaleIn shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{isEdit ? 'Edit' : 'New'} Budget</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {error && <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="relative">
            <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all">
              <option value="">Select expense category *</option>
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Amount */}
          <input required type="number" step="0.01" min="0.01" placeholder="Budget amount *"
            value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all" />

          {/* Period */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button key={p} type="button" onClick={() => setForm((prev) => ({ ...prev, period: p }))}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${form.period === p ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {p}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ budget, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await deleteBudget(budget.id); onDeleted(); } catch { /**/ } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 animate-scaleIn">
        <h2 className="text-base font-bold text-white mb-2">Delete Budget</h2>
        <p className="text-sm text-slate-400 mb-5">Delete the budget for <strong className="text-white">{budget.categoryName}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white transition-all">Cancel</button>
          <button onClick={handle} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={15} className="animate-spin" /> : null} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, catRes] = await Promise.all([getBudgets(), getCategories()]);
      setBudgets(budgetsRes.data);
      setCategories(catRes.data);

      const results = await Promise.allSettled(budgetsRes.data.map((b) => getBudgetProgress(b.id)));
      const map = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[budgetsRes.data[i].id] = r.value.data;
      });
      setProgressMap(map);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Budgets</h1>
            <p className="text-sm text-slate-400 mt-0.5">Set spending limits per category</p>
          </div>
          <button id="add-budget-btn" onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
            <Plus size={16} /> New Budget
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 size={32} className="animate-spin text-violet-500" /></div>
        ) : budgets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            No budgets set yet. Create one to track your spending limits!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                progress={progressMap[b.id]}
                onEdit={(budget) => setModal({ mode: 'edit', budget })}
                onDelete={(budget) => setModal({ mode: 'delete', budget })}
              />
            ))}
          </div>
        )}
      </div>

      {modal?.mode === 'add' && <BudgetModal categories={categories} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData(); }} />}
      {modal?.mode === 'edit' && <BudgetModal initial={modal.budget} categories={categories} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData(); }} />}
      {modal?.mode === 'delete' && <DeleteConfirm budget={modal.budget} onClose={() => setModal(null)} onDeleted={() => { setModal(null); fetchData(); }} />}
    </Layout>
  );
}
