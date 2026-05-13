import axios from 'axios';

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// ── JWT Request Interceptor ─────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor (auto-logout on 401) ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ══ Auth ════════════════════════════════════════════════════════════════════
// POST /api/auth/register  → { username, password, email }
export const register = (data) => api.post('/api/auth/register', data);

// POST /api/auth/login  → { username, password }
export const login = (data) => api.post('/api/auth/login', data);

// ══ Dashboard ═══════════════════════════════════════════════════════════════
// GET /api/dashboard/summary  → { totalIncome, totalExpenses, currentBalance }
export const getDashboardSummary = () => api.get('/api/dashboard/summary');

// ══ Transactions ═════════════════════════════════════════════════════════════
// GET /api/transactions  (optional params: startDate, endDate, categoryId, type)
export const getTransactions = (params = {}) =>
  api.get('/api/transactions', { params });

// GET /api/transactions/:id
export const getTransactionById = (id) => api.get(`/api/transactions/${id}`);

// POST /api/transactions  → { title, amount, date, note, transactionType, categoryId }
export const createTransaction = (data) => api.post('/api/transactions', data);

// PUT /api/transactions/:id
export const updateTransaction = (id, data) =>
  api.put(`/api/transactions/${id}`, data);

// DELETE /api/transactions/:id
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);

// ══ Categories ═══════════════════════════════════════════════════════════════
// GET /api/categories  (optional param: type = INCOME | EXPENSE)
export const getCategories = (type) =>
  api.get('/api/categories', { params: type ? { type } : {} });

// GET /api/categories/:id
export const getCategoryById = (id) => api.get(`/api/categories/${id}`);

// POST /api/categories  → { name, type }
export const createCategory = (data) => api.post('/api/categories', data);

// PUT /api/categories/:id
export const updateCategory = (id, data) =>
  api.put(`/api/categories/${id}`, data);

// DELETE /api/categories/:id
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

// ══ Budgets ══════════════════════════════════════════════════════════════════
// GET /api/budgets
export const getBudgets = () => api.get('/api/budgets');

// GET /api/budgets/:id
export const getBudgetById = (id) => api.get(`/api/budgets/${id}`);

// GET /api/budgets/:id/progress
export const getBudgetProgress = (id) =>
  api.get(`/api/budgets/${id}/progress`);

// POST /api/budgets  → { amount, period, categoryId }
export const createBudget = (data) => api.post('/api/budgets', data);

// PUT /api/budgets/:id
export const updateBudget = (id, data) => api.put(`/api/budgets/${id}`, data);

// DELETE /api/budgets/:id
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);

export default api;
