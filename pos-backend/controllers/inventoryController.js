import asyncHandler from '../utils/asyncHandler.js';
import MenuItem from '../models/MenuItem.js';
import StockMovement from '../models/StockMovement.js';

// Get all menu items with stock info
export const getAllItems = asyncHandler(async (req, res) => {
  const { category, status, isSellable } = req.query;
  let query = {};

  if (req.user?.role !== 'admin' && isSellable !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'Cashiers can only access sellable menu items',
    });
  }

  if (category) query.category = category;
  if (status === 'low') query.$expr = { $lte: ['$stock', '$reorderLevel'] };
  if (status === 'out') query.stock = 0;
  if (isSellable === 'true') query.isSellable = true;
  if (isSellable === 'false') query.isSellable = false;

  const items = await MenuItem.find(query).populate('supplier', 'name phone email');
  res.status(200).json({ success: true, items });
});

// Get single item
export const getItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('supplier');
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  res.status(200).json({ success: true, item });
});

// Create new item
export const createItem = asyncHandler(async (req, res) => {
  const { stock, ...productData } = req.body;
  const item = await MenuItem.create({
    ...productData,
    stock: 0,
  });
  res.status(201).json({ success: true, item });
});

// Update item
export const updateItem = asyncHandler(async (req, res) => {
  const { stock, ...productData } = req.body;
  const item = await MenuItem.findByIdAndUpdate(req.params.id, productData, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  res.status(200).json({ success: true, item });
});

// Delete item
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  res.status(200).json({ success: true, message: 'Item deleted successfully' });
});

// Load/Add stock
export const addStock = asyncHandler(async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Stock increases must be posted through a GRV',
  });
});

// Reduce stock (for orders)
export const reduceStock = asyncHandler(async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Stock decreases must come from completed sales',
  });
});

// Get stock movements/history
export const getStockMovements = asyncHandler(async (req, res) => {
  const { itemId, type, startDate, endDate } = req.query;
  let query = {};

  if (itemId) query.item = itemId;
  if (type) query.type = type;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const movements = await StockMovement.find(query)
    .populate('item', 'name')
    .populate('createdBy', 'name')
    .sort('-date');

  res.status(200).json({ success: true, movements });
});

// Get low stock items
export const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({
    $expr: { $lte: ['$stock', '$reorderLevel'] },
    isAvailable: true,
  }).populate('supplier', 'name phone');

  res.status(200).json({ success: true, items });
});

// Adjust stock (manual adjustment)
export const adjustStock = asyncHandler(async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Direct stock adjustments are disabled. Use GRV posting or completed sales.',
  });
});

// Get stock summary
export const getStockSummary = asyncHandler(async (req, res) => {
  const totalItems = await MenuItem.countDocuments();
  const lowStockItems = await MenuItem.countDocuments({
    $expr: { $lte: ['$stock', '$reorderLevel'] },
  });
  const outOfStockItems = await MenuItem.countDocuments({ stock: 0 });

  const totalStock = await MenuItem.aggregate([
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$stock' },
        totalValue: { $sum: { $multiply: ['$stock', '$costPrice'] } },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    summary: {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalQuantity: totalStock[0]?.totalQuantity || 0,
      totalValue: totalStock[0]?.totalValue || 0,
    },
  });
});
