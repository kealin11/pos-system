import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type:     String,
      required: [true, 'Customer name is required'],
      trim:     true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    guestCount: {
      type:    Number,
      default: 1,
    },
    type: {
      type:    String,
      enum:    ['Dine In', 'Takeaway'],
      default: 'Dine In',
    },
    table: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Table',
      default: null,
    },
    tableNo: {
      type:    String,
      default: null,
    },
    items: [orderItemSchema],
    status: {
      type:    String,
      enum:    ['In Progress', 'Ready', 'Completed', 'Cancelled'],
      default: 'In Progress',
    },
    subtotal:      { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    total:         { type: Number, required: true },

    // Payment
    paymentMethod: {
      type:    String,
      enum:    ['Cash', 'Card', 'Razorpay', 'Bank Transfer', 'Other', 'Pending'],
      default: 'Pending',
    },
    paymentStatus: {
      type:    String,
      enum:    ['Paid', 'Unpaid', 'Refunded'],
      default: 'Unpaid',
    },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      default: null,
    },

    // Staff
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  { timestamps: true }
);

// Virtual: friendly order ID for display
orderSchema.virtual('orderId').get(function () {
  return `ORD-${String(this._id).slice(-6).toUpperCase()}`;
});

orderSchema.set('toJSON', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
