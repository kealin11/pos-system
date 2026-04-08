import asyncHandler from '../utils/asyncHandler.js';
import GRV from '../models/GRV.js';
import {
  getVoucherTotal,
  postGrvToStock,
  validateGrvProducts,
} from '../services/inventoryFlowService.js';

const normalizeGrvPayload = (body) => {
  const items = (body.items || []).map((item) => ({
    product: item.productId || item.product,
    orderedQty: Number(item.orderedQty || 0),
    receivedQty: Number(item.receivedQty),
    unitPrice: Number(item.unitPrice),
    notes: item.notes || '',
  }));

  return {
    voucherNumber: body.voucherNumber,
    supplier: body.supplierId || body.supplier,
    supplierInvoiceNumber: body.supplierInvoiceNumber,
    purchaseOrderNumber: body.purchaseOrderNumber || '',
    receivedDate: body.receivedDate,
    notes: body.notes || '',
    items,
    totalAmount: getVoucherTotal(items),
  };
};

export const getAllGrvs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const grvs = await GRV.find(query)
    .populate('supplier', 'name contactPerson phone email')
    .populate('items.product', 'name unit')
    .populate('createdBy', 'name')
    .populate('postedBy', 'name')
    .sort('-createdAt');

  res.status(200).json({ success: true, grvs });
});

export const getGrv = asyncHandler(async (req, res) => {
  const grv = await GRV.findById(req.params.id)
    .populate('supplier', 'name contactPerson phone email')
    .populate('items.product', 'name unit supplier')
    .populate('createdBy', 'name')
    .populate('postedBy', 'name');

  if (!grv) {
    return res.status(404).json({ success: false, message: 'GRV not found' });
  }

  res.status(200).json({ success: true, grv });
});

export const createGrv = asyncHandler(async (req, res) => {
  const payload = normalizeGrvPayload(req.body);

  if (!payload.supplier || !payload.supplierInvoiceNumber || !payload.receivedDate) {
    return res.status(400).json({
      success: false,
      message: 'Supplier, supplier invoice number, and received date are required',
    });
  }

  await validateGrvProducts(payload.supplier, payload.items);

  const grv = await GRV.create({
    ...payload,
    createdBy: req.user._id,
  });

  const populatedGrv = await GRV.findById(grv._id)
    .populate('supplier', 'name contactPerson phone email')
    .populate('items.product', 'name unit');

  res.status(201).json({ success: true, grv: populatedGrv });
});

export const updateGrv = asyncHandler(async (req, res) => {
  const existing = await GRV.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'GRV not found' });
  }

  if (existing.status === 'Posted') {
    return res.status(400).json({
      success: false,
      message: 'Posted GRVs cannot be edited',
    });
  }

  const payload = normalizeGrvPayload(req.body);
  await validateGrvProducts(payload.supplier, payload.items);

  Object.assign(existing, payload);
  await existing.save();

  const populatedGrv = await GRV.findById(existing._id)
    .populate('supplier', 'name contactPerson phone email')
    .populate('items.product', 'name unit');

  res.status(200).json({ success: true, grv: populatedGrv });
});

export const postGrv = asyncHandler(async (req, res) => {
  const grv = await GRV.findById(req.params.id);
  if (!grv) {
    return res.status(404).json({ success: false, message: 'GRV not found' });
  }

  const postedGrv = await postGrvToStock(grv, req.user._id);
  const populatedGrv = await GRV.findById(postedGrv._id)
    .populate('supplier', 'name contactPerson phone email')
    .populate('items.product', 'name unit')
    .populate('postedBy', 'name');

  res.status(200).json({
    success: true,
    message: 'GRV posted and stock updated successfully',
    grv: populatedGrv,
  });
});
