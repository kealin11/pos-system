import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Table name is required'],
      unique:   true,
      trim:     true,
    },
    seats: {
      type:     Number,
      required: [true, 'Number of seats is required'],
      min:      [1, 'Must have at least 1 seat'],
    },
    status: {
      type:    String,
      enum:    ['Available', 'Booked'],
      default: 'Available',
    },
    currentOrder: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Order',
      default: null,
    },
    initial: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Table = mongoose.model('Table', tableSchema);
export default Table;