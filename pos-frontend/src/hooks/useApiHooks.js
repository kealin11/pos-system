import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesAPI, ordersAPI, paymentAPI } from '../api/services.js';

// ─── Tables ───────────────────────────────────────────────────────────────────
export const useTables = (status) =>
  useQuery({
    queryKey: ['tables', status],
    queryFn:  () => tablesAPI.getAll(status).then((r) => r.data.data),
  });

export const useTable = (id) =>
  useQuery({
    queryKey: ['table', id],
    queryFn:  () => tablesAPI.getOne(id).then((r) => r.data.data),
    enabled:  !!id,
  });

export const useCreateTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tablesAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useUpdateTableStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => tablesAPI.updateStatus(id, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useDeleteTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tablesAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const useOrders = (status) =>
  useQuery({
    queryKey: ['orders', status],
    queryFn:  () => ordersAPI.getAll(status).then((r) => r.data.data),
    refetchInterval: 30000, // auto refresh every 30 seconds
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: ['order', id],
    queryFn:  () => ordersAPI.getOne(id).then((r) => r.data.data),
    enabled:  !!id,
  });

export const usePlaceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => ordersAPI.place(data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ordersAPI.updateStatus(id, status),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => ordersAPI.delete(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn:  () => ordersAPI.getStats().then((r) => r.data.data),
    refetchInterval: 60000, // auto refresh every 60 seconds
  });

// ─── Payment ──────────────────────────────────────────────────────────────────
export const useCreateRazorpayOrder = () =>
  useMutation({
    mutationFn: (orderId) => paymentAPI.createRazorpayOrder(orderId),
  });

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => paymentAPI.verifyPayment(data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useCompletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => paymentAPI.completePayment(data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
};

export const useInvoice = (orderId) =>
  useQuery({
    queryKey: ['invoice', orderId],
    queryFn:  () => paymentAPI.getInvoice(orderId).then((r) => r.data.data),
    enabled:  !!orderId,
  });
