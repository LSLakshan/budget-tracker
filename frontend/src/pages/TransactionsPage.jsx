import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  getTransactions,
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/api';
import { Plus, Pencil, Trash2, Filter, X, Loader2, ChevronDown } from 'lucide-react';

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(val ?? 0);

// ── Modal ─────────────────────────────────────────────────────────────────────
function TransactionModal({ onClose, onSaved, initial, categories }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? {
        title: initial.title,
        amount: String(initial.amount),
        date: initial.date,
        note: initial.note ?? '',
        transactionType: initial.transactionType,
        categoryId: String(initial.categoryId),
      }
      : { title: '', amount: '', date: new Date().toISOString().slice(0, 10), note: '', transactionType: 'EXPENSE', categoryId: '' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCats = categories.filter((c) => c.type === form.transactionType);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.categoryId) { setError('Please select a category.'); return; }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        amount: parseFloat(form.amount),
        date: form.date,
        note: form.note || null,
        transactionType: form.transactionType,
        categoryId: parseInt(form.categoryId),
      };
      if (isEdit) await updateTransaction(initial.id, payload);
      else await createTransaction(payload);
      onSaved();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message ?? 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 animate-scaleIn shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{isEdit ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {['INCOME', 'EXPENSE'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { set('transactionType', t); set('categoryId', ''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${form.transactionType === t
                    ? t === 'INCOME'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                {t === 'INCOME' ? '+ Income' : '− Expense'}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            required
            maxLength={150}
            placeholder="Title *"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all"
          />

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount *"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all"
            />
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all"
            >
              <option value="">Select category *</option>
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Note */}
          <textarea
            maxLength={500}
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all resize-none"
          />

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ tx, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await deleteTransaction(tx.id); onDeleted(); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 animate-scaleIn">
        <h2 className="text-base font-bold text-white mb-2">Delete Transaction</h2>
        <p className="text-sm text-slate-400 mb-5">
          Are you sure you want to delete <strong className="text-white">{tx.title}</strong>? This action cannot be undone.
        </p>
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
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode:'add'|'edit'|'delete', tx?:object }

  // Filters
  const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '', type: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.type) params.type = filters.type;

      const [txRes, catRes] = await Promise.all([
        getTransactions(params),
        getCategories(),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const clearFilters = () => setFilters({ startDate: '', endDate: '', categoryId: '', type: '' });
  const hasFilters = filters.startDate || filters.endDate || filters.categoryId || filters.type;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-sm text-slate-400 mt-0.5">{transactions.length} record{transactions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${showFilters || hasFilters
                  ? 'bg-violet-600/20 border-violet-500/40 text-violet-400'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
            >
              <Filter size={15} /> Filters {hasFilters && '(active)'}
            </button>
            <button
              id="add-transaction-btn"
              onClick={() => setModal({ mode: 'add' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <div className="relative">
                <select
                  value={filters.categoryId}
                  onChange={(e) => setFilters((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
                >
                  <option value="">All</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <div className="relative">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
                >
                  <option value="">All</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="col-span-2 sm:col-span-4 text-xs text-slate-400 hover:text-red-400 transition-colors text-left flex items-center gap-1 mt-1">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={32} className="animate-spin text-violet-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">No transactions found. Add one!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-semibold">Title</th>
                    <th className="px-5 py-3 text-left font-semibold">Category</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Amount</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white">{tx.title}</p>
                        {tx.note && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{tx.note}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${tx.transactionType === 'INCOME'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                          }`}>
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{tx.date}</td>
                      <td className={`px-5 py-3.5 text-right font-semibold ${tx.transactionType === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                        {tx.transactionType === 'INCOME' ? '+' : '−'}{fmt(tx.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ mode: 'edit', tx })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setModal({ mode: 'delete', tx })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.mode === 'add' && (
        <TransactionModal
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchData(); }}
        />
      )}
      {modal?.mode === 'edit' && (
        <TransactionModal
          initial={modal.tx}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchData(); }}
        />
      )}
      {modal?.mode === 'delete' && (
        <DeleteConfirm
          tx={modal.tx}
          onClose={() => setModal(null)}
          onDeleted={() => { setModal(null); fetchData(); }}
        />
      )}
    </Layout>
  );
}
