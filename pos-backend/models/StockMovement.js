import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reference: {
      // For reference to order, purchase order, etc.
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      enum: ['Order', 'PurchaseOrder', 'GRV', 'Sale', null],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

stockMovementSchema.index({ item: 1, date: 1 });
stockMovementSchema.index({ type: 1, date: 1 });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
