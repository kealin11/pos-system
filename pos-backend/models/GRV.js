import mongoose from 'mongoose';

const grvItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    orderedQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    receivedQty: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const grvSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    supplierInvoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseOrderNumber: {
      type: String,
      trim: true,
    },
    receivedDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Posted'],
      default: 'Draft',
    },
    items: {
      type: [grvItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'At least one GRV item is required',
      },
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    postedAt: {
      type: Date,
      default: null,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

grvSchema.index({ supplier: 1, receivedDate: -1 });
grvSchema.index({ status: 1, createdAt: -1 });

const GRV = mongoose.model('GRV', grvSchema);
export default GRV;
