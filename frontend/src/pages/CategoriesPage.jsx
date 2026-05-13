import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { Plus, Pencil, Trash2, X, Loader2, Tags } from 'lucide-react';

function CategoryModal({ onClose, onSaved, initial }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial ? { name: initial.name, type: initial.type } : { name: '', type: 'EXPENSE' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await updateCategory(initial.id, form);
      else await createCategory(form);
      onSaved();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message ?? 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 animate-scaleIn shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{isEdit ? 'Edit' : 'New'} Category</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {error && <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {['INCOME', 'EXPENSE'].map((t) => (
              <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${form.type === t ? (t === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
          <input required maxLength={100} placeholder="Category name *" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition-all" />
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

function DeleteConfirm({ cat, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await deleteCategory(cat.id); onDeleted(); } catch { /**/ } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 animate-scaleIn">
        <h2 className="text-base font-bold text-white mb-2">Delete Category</h2>
        <p className="text-sm text-slate-400 mb-5">Delete <strong className="text-white">{cat.name}</strong>? This cannot be undone.</p>
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

function CategoryCard({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 group hover:border-slate-600 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.type === 'INCOME' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
          <Tags size={14} />
        </div>
        <span className="text-sm font-medium text-white">{cat.name}</span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(cat)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"><Pencil size={14} /></button>
        <button onClick={() => onDelete(cat)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getCategories(); setCategories(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const income  = categories.filter((c) => c.type === 'INCOME');
  const expense = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Categories</h1>
            <p className="text-sm text-slate-400 mt-0.5">Organize your transactions</p>
          </div>
          <button id="add-category-btn" onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
            <Plus size={16} /> New Category
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 size={32} className="animate-spin text-violet-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Income</h2>
                <span className="ml-auto text-xs text-slate-500">{income.length}</span>
              </div>
              <div className="space-y-2">
                {income.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No income categories yet</p>
                  : income.map((c) => <CategoryCard key={c.id} cat={c} onEdit={(cat) => setModal({ mode: 'edit', cat })} onDelete={(cat) => setModal({ mode: 'delete', cat })} />)}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Expense</h2>
                <span className="ml-auto text-xs text-slate-500">{expense.length}</span>
              </div>
              <div className="space-y-2">
                {expense.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No expense categories yet</p>
                  : expense.map((c) => <CategoryCard key={c.id} cat={c} onEdit={(cat) => setModal({ mode: 'edit', cat })} onDelete={(cat) => setModal({ mode: 'delete', cat })} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal?.mode === 'add' && <CategoryModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData(); }} />}
      {modal?.mode === 'edit' && <CategoryModal initial={modal.cat} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData(); }} />}
      {modal?.mode === 'delete' && <DeleteConfirm cat={modal.cat} onClose={() => setModal(null)} onDeleted={() => { setModal(null); fetchData(); }} />}
    </Layout>
  );
}
