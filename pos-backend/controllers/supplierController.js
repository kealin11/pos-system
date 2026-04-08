import asyncHandler from '../utils/asyncHandler.js';
import Supplier from '../models/Supplier.js';
import MenuItem from '../models/MenuItem.js';

// Get all suppliers
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const { active } = req.query;
  let query = {};

  if (active === 'true') query.isActive = true;
  if (active === 'false') query.isActive = false;

  const suppliers = await Supplier.find(query)
    .populate('items', 'name price')
    .sort('-createdAt');

  res.status(200).json({ success: true, suppliers });
});

// Get single supplier
export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).populate(
    'items',
    'name price stock'
  );

  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  res.status(200).json({ success: true, supplier });
});

// Create supplier
export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, supplier });
});

// Update supplier
export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  res.status(200).json({ success: true, supplier });
});

// Delete supplier
export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);

  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  // Remove supplier reference from items
  await MenuItem.updateMany({ supplier: req.params.id }, { supplier: null });

  res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
});

// Add items to supplier
export const addItemsToSupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;
  const { itemIds } = req.body;

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  // Add items to supplier and update items to reference supplier
  const newItems = itemIds.filter(
    (id) => !supplier.items.some((item) => item.toString() === id)
  );

  supplier.items = [...supplier.items, ...newItems];
  await supplier.save();

  // Update menu items to reference this supplier
  await MenuItem.updateMany(
    { _id: { $in: newItems } },
    { supplier: supplierId }
  );

  res.status(200).json({
    success: true,
    message: 'Items added to supplier',
    supplier,
  });
});

// Remove items from supplier
export const removeItemsFromSupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;
  const { itemIds } = req.body;

  const supplier = await Supplier.findByIdAndUpdate(
    supplierId,
    { $pull: { items: { $in: itemIds } } },
    { new: true }
  );

  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  // Remove supplier reference from items
  await MenuItem.updateMany(
    { _id: { $in: itemIds } },
    { supplier: null }
  );

  res.status(200).json({
    success: true,
    message: 'Items removed from supplier',
    supplier,
  });
});

// Get supplier by item
export const getSupplierByItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const suppliers = await Supplier.find({
    items: itemId,
    isActive: true,
  });

  res.status(200).json({ success: true, suppliers });
});
