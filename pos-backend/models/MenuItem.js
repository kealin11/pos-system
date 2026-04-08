import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    // Stock Management
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    // Unit of measurement
    unit: {
      type: String,
      enum: ['pcs', 'kg', 'ltr', 'ml', 'g', 'custom'],
      default: 'pcs',
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    isSellable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
menuItemSchema.index({ category: 1, isAvailable: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
