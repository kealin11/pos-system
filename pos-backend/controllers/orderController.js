import Order from '../models/Order.js';
import Sale from '../models/Sale.js';
import MenuItem from '../models/MenuItem.js';
import StockMovement from '../models/StockMovement.js';
import Table from '../models/Table.js';
import {
  calculateOrderTotals,
  normalizeOrderItems,
} from '../services/inventoryFlowService.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'All' ? { status } : {};
  const orders = await Order.find(filter)
    .populate('table', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('table', 'name seats')
    .populate('createdBy', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ success: true, data: order });
};

// @desc    Place new order + book table + reduce stock
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res) => {
  const { customerName, customerPhone, guestCount, type, tableId, items } = req.body;

  if (!customerName || !items?.length) {
    res.status(400);
    throw new Error('Customer name and at least one item are required');
  }

  const normalizedItems = await normalizeOrderItems(items);
  const { subtotal, serviceCharge, total } = calculateOrderTotals(normalizedItems);

  // Verify table if Dine In
  let table = null;
  let tableNo = null;
  if (type === 'Dine In' && tableId) {
    table = await Table.findById(tableId);
    if (!table) {
      res.status(404);
      throw new Error('Table not found');
    }
    if (table.status === 'Booked') {
      res.status(400);
      throw new Error('Table is already booked');
    }
    tableNo = table.name;
  }

  // Get customer initials
  const initial = customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const order = await Order.create({
    customerName,
    customerPhone,
    guestCount,
    type,
    table: table?._id || null,
    tableNo,
    items: normalizedItems,
    subtotal,
    serviceCharge,
    total,
    createdBy: req.user._id,
  });

  // Book the table
  if (table) {
    await Table.findByIdAndUpdate(table._id, {
      status: 'Booked',
      currentOrder: order._id,
      initial,
    });
  }

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['In Progress', 'Ready', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Valid options: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (status === 'Cancelled' && order.paymentStatus === 'Paid') {
    res.status(400);
    throw new Error('Paid orders cannot be cancelled');
  }

  order.status = status;
  await order.save();

  if (status === 'Cancelled' && order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: 'Available',
      currentOrder: null,
      initial: '',
    });
  }

  res.json({ success: true, message: `Order marked as ${status}`, data: order });
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.paymentStatus === 'Paid') {
    for (const item of order.items) {
      const productId = item.product || item.id;
      const product = await MenuItem.findById(productId);

      if (product) {
        product.stock += Number(item.qty || 0);
        await product.save();
      }
    }

    await Sale.findOneAndDelete({ order: order._id });
    await StockMovement.deleteMany({
      reference: order._id,
      referenceModel: 'Sale',
    });
  }

  // Free up table if exists
  if (order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: 'Available',
      currentOrder: null,
      initial: '',
    });
  }

  // Delete the order
  await Order.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Order deleted successfully' });
};

// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [todayOrders, yesterdayOrders, inProgressCount] = await Promise.all([
    Order.find({ createdAt: { $gte: today }, paymentStatus: 'Paid' }),
    Order.find({ createdAt: { $gte: yesterday, $lt: today }, paymentStatus: 'Paid' }),
    Order.countDocuments({ status: 'In Progress' }),
  ]);

  const todayEarnings     = todayOrders.reduce((s, o) => s + o.total, 0);
  const yesterdayEarnings = yesterdayOrders.reduce((s, o) => s + o.total, 0);
  const earningsChange    = yesterdayEarnings
    ? (((todayEarnings - yesterdayEarnings) / yesterdayEarnings) * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      totalEarnings:  todayEarnings,
      earningsChange: parseFloat(earningsChange),
      inProgress:     inProgressCount,
    },
  });
};
