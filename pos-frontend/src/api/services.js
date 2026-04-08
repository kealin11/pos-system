import api from './axiosInstance.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ─── Tables ───────────────────────────────────────────────────────────────────
export const tablesAPI = {
  getAll:       (status)     => api.get('/tables', { params: { status } }),
  getOne:       (id)         => api.get(`/tables/${id}`),
  create:       (data)       => api.post('/tables', data),
  update:       (id, data)   => api.put(`/tables/${id}`, data),
  delete:       (id)         => api.delete(`/tables/${id}`),
  updateStatus: (id, status) => api.patch(`/tables/${id}/status`, { status }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll:       (status)     => api.get('/orders', { params: { status } }),
  getOne:       (id)         => api.get(`/orders/${id}`),
  place:        (data)       => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete:       (id)         => api.delete(`/orders/${id}`),
  getStats:     ()           => api.get('/orders/stats'),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (orderId) => api.post('/payment/create-order', { orderId }),
  verifyPayment:       (data)    => api.post('/payment/verify', data),
  completePayment:     (data)    => api.post('/payment/complete', data),
  getInvoice:          (orderId) => api.get(`/payment/invoice/${orderId}`),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll:          (params)     => api.get('/inventory', { params }),
  getOne:          (id)         => api.get(`/inventory/${id}`),
  create:          (data)       => api.post('/inventory', data),
  update:          (id, data)   => api.put(`/inventory/${id}`, data),
  delete:          (id)         => api.delete(`/inventory/${id}`),
  addStock:        (data)       => api.post('/inventory/add-stock', data),
  reduceStock:     (data)       => api.post('/inventory/reduce-stock', data),
  adjustStock:     (id, data)   => api.post(`/inventory/${id}/adjust`, data),
  getMovements:    (params)     => api.get('/inventory/movements', { params }),
  getLowStock:     ()           => api.get('/inventory/low-stock'),
  getSummary:      ()           => api.get('/inventory/summary'),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliersAPI = {
  getAll:              (params)     => api.get('/suppliers', { params }),
  getOne:              (id)         => api.get(`/suppliers/${id}`),
  create:              (data)       => api.post('/suppliers', data),
  update:              (id, data)   => api.put(`/suppliers/${id}`, data),
  delete:              (id)         => api.delete(`/suppliers/${id}`),
  addItems:            (id, data)   => api.post(`/suppliers/${id}/add-items`, data),
  removeItems:         (id, data)   => api.post(`/suppliers/${id}/remove-items`, data),
  getSupplierByItem:   (itemId)     => api.get(`/suppliers/item/${itemId}`),
};

export const grvAPI = {
  getAll:   (params)   => api.get('/grvs', { params }),
  getOne:   (id)       => api.get(`/grvs/${id}`),
  create:   (data)     => api.post('/grvs', data),
  update:   (id, data) => api.put(`/grvs/${id}`, data),
  post:     (id)       => api.post(`/grvs/${id}/post`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  generate:        (data)     => api.post('/reports/generate', data),
  getReport:       (date)     => api.get(`/reports/${date}`),
  getAll:          (params)   => api.get('/reports', { params }),
  finalize:        (date)     => api.put(`/reports/${date}/finalize`),
  delete:          (date)     => api.delete(`/reports/${date}`),
  getRevenueSummary: (params) => api.get('/reports/revenue-summary', { params }),
};

// ─── Sync ─────────────────────────────────────────────────────────────────────
export const syncAPI = {
  getStatus:       (deviceId) => api.get(`/sync/status/${deviceId}`),
  download:        (data)     => api.post('/sync/download', data),
  upload:          (data)     => api.post('/sync/upload', data),
  bidirectional:   (data)     => api.post('/sync/bidirectional', data),
  getHistory:      (params)   => api.get('/sync/history', { params }),
};
