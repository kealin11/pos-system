import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import { createSaleFromOrder } from '../services/inventoryFlowService.js';

const getRazorpay = () =>
  new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.paymentStatus === 'Paid') {
    res.status(400);
    throw new Error('Order already paid');
  }

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(order.total * 100), // convert to paise
    currency: 'INR',
    receipt:  `receipt_${orderId}`,
    notes:    { orderId: orderId.toString(), customerName: order.customerName },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    },
  });
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error('Invalid payment signature. Verification failed.');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const sale = await createSaleFromOrder({
    order,
    paymentMethod: 'Razorpay',
    paymentReference: razorpayPaymentId,
    userId: req.user._id,
  });

  order.paymentStatus = 'Paid';
  order.paymentMethod = 'Razorpay';
  order.razorpayPaymentId = razorpayPaymentId;
  order.status = 'Completed';
  order.sale = sale._id;
  await order.save();

  if (order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: 'Available',
      currentOrder: null,
      initial: '',
    });
  }

  res.json({ success: true, message: 'Payment verified and order completed', data: order });
};

// @desc    Complete payment
// @route   POST /api/payment/complete
// @access  Private
export const completePayment = async (req, res) => {
  const { orderId, paymentMethod = 'Cash', paymentReference = '' } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const sale = await createSaleFromOrder({
    order,
    paymentMethod,
    paymentReference,
    userId: req.user._id,
  });

  order.paymentStatus = 'Paid';
  order.paymentMethod = paymentMethod;
  order.status = 'Completed';
  order.sale = sale._id;
  await order.save();

  if (order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: 'Available',
      currentOrder: null,
      initial: '',
    });
  }

  res.json({
    success: true,
    message: `${paymentMethod} payment recorded and stock updated.`,
    data: order,
  });
};

// @desc    Get invoice data
// @route   GET /api/payment/invoice/:orderId
// @access  Private
export const getInvoice = async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('table', 'name seats')
    .populate('createdBy', 'name');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, data: order });
};
