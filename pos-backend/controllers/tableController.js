import Table from '../models/Table.js';

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
export const getTables = async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'All' ? { status } : {};
  const tables = await Table.find(filter).populate('currentOrder', 'customerName status total');
  res.json({ success: true, count: tables.length, data: tables });
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Private
export const getTable = async (req, res) => {
  const table = await Table.findById(req.params.id).populate('currentOrder');
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }
  res.json({ success: true, data: table });
};

// @desc    Create table
// @route   POST /api/tables
// @access  Private/Admin
export const createTable = async (req, res) => {
  const { name, seats, initial } = req.body;
  if (!name || !seats) {
    res.status(400);
    throw new Error('Name and seats are required');
  }
  const table = await Table.create({ name, seats, initial });
  res.status(201).json({ success: true, message: 'Table created', data: table });
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin
export const updateTable = async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }
  res.json({ success: true, message: 'Table updated', data: table });
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
export const deleteTable = async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }
  if (table.status === 'Booked') {
    res.status(400);
    throw new Error('Cannot delete a booked table');
  }
  await table.deleteOne();
  res.json({ success: true, message: 'Table deleted' });
};

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private
export const updateTableStatus = async (req, res) => {
  const { status } = req.body;
  if (!['Available', 'Booked'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Use Available or Booked');
  }
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status, ...(status === 'Available' ? { currentOrder: null, initial: '' } : {}) },
    { new: true }
  );
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }
  res.json({ success: true, message: `Table marked as ${status}`, data: table });
};