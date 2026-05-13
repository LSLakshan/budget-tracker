import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  getDashboardSummary,
  getTransactions,
  getBudgets,
  getBudgetProgress,
} from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Loader2 } from 'lucide-react';

// ─── Colour palette ──────────────────────────────────────────────────────────
const PIE_COLORS = [
  '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#f97316',
];

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(val ?? 0);

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, colorClass, glowClass }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg ${glowClass}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Build monthly bar data from transactions ─────────────────────────────────
function buildMonthlyData(transactions) {
  const map = {};
  transactions.forEach(({ transactionType, amount, date }) => {
    const month = date?.slice(0, 7) ?? 'Unknown'; // YYYY-MM
    if (!map[month]) map[month] = { month, Income: 0, Expense: 0 };
    if (transactionType === 'INCOME') map[month].Income += Number(amount);
    else map[month].Expense += Number(amount);
  });
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((d) => ({ ...d, month: d.month.slice(5) })); // Show MM only
}

// ─── Build pie data from transactions ────────────────────────────────────────
function buildPieData(transactions) {
  const map = {};
  transactions
    .filter((t) => t.transactionType === 'EXPENSE')
    .forEach(({ categoryName, amount }) => {
      const key = categoryName ?? 'Other';
      map[key] = (map[key] ?? 0) + Number(amount);
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, txRes, budgetsRes] = await Promise.all([
        getDashboardSummary(),
        getTransactions(),
        getBudgets(),
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data);

      // Fetch progress for each budget to detect exceeded
      const progressResults = await Promise.allSettled(
        budgetsRes.data.map((b) => getBudgetProgress(b.id))
      );
      const alerts = progressResults
        .filter((r) => r.status === 'fulfilled' && r.value.data.exceeded)
        .map((r) => r.value.data);
      setBudgetAlerts(alerts);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const recent = [...transactions]
    .sort((a, b) => b.date?.localeCompare(a.date ?? ''))
    .slice(0, 6);

  const pieData = buildPieData(transactions);
  const barData = buildMonthlyData(transactions);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Your financial overview at a glance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={36} className="animate-spin text-violet-500" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-400 text-sm">{error}</div>
        ) : (
          <>
            {/* ── Budget Alerts ─────────────────────────────────────────── */}
            {budgetAlerts.length > 0 && (
              <div className="space-y-2">
                {budgetAlerts.map((b) => (
                  <div
                    key={b.budgetId}
                    className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-400"
                  >
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>
                      Budget exceeded for <strong>{b.categoryName}</strong>: spent{' '}
                      {fmt(b.totalSpent)} of {fmt(b.budgetAmount)} ({b.period})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Stat cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total Income"
                value={fmt(summary?.totalIncome)}
                icon={TrendingUp}
                colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                glowClass=""
              />
              <StatCard
                label="Total Expenses"
                value={fmt(summary?.totalExpense)}
                icon={TrendingDown}
                colorClass="bg-gradient-to-br from-rose-500 to-pink-600"
                glowClass=""
              />
              <StatCard
                label="Current Balance"
                value={fmt(summary?.currentBalance)}
                icon={Wallet}
                colorClass="bg-gradient-to-br from-violet-500 to-indigo-600"
                glowClass=""
              />
            </div>

            {/* ── Charts row ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bar chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-white mb-4">Monthly Income vs Expenses</h2>
                {barData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                    No transaction data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs. ${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: '#e2e8f0' }}
                        formatter={(val) => [fmt(val)]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-white mb-4">Expense Distribution by Category</h2>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                    No expense data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                        formatter={(val) => [fmt(val)]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Recent Transactions ───────────────────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-sm font-semibold text-white mb-4">Recent Transactions</h2>
              {recent.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No transactions yet. Add one!</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {recent.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold
                            ${tx.transactionType === 'INCOME'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'}`}
                        >
                          {tx.transactionType === 'INCOME' ? '+' : '−'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{tx.title}</p>
                          <p className="text-xs text-slate-500">{tx.categoryName} · {tx.date}</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold shrink-0 ${tx.transactionType === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                      >
                        {tx.transactionType === 'INCOME' ? '+' : '−'}{fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
