import mongoose from 'mongoose';

const dayEndReportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalServiceCharge: {
      type: Number,
      default: 0,
    },
    paymentBreakdown: {
      cash: {
        type: Number,
        default: 0,
      },
      card: {
        type: Number,
        default: 0,
      },
      upi: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
    ordersByType: {
      dineIn: {
        type: Number,
        default: 0,
      },
      takeaway: {
        type: Number,
        default: 0,
      },
    },
    topItems: [
      {
        itemId: mongoose.Schema.Types.ObjectId,
        itemName: String,
        quantitySold: Number,
        revenue: Number,
      },
    ],
    stockSummary: {
      itemsLowStock: [
        {
          itemId: mongoose.Schema.Types.ObjectId,
          itemName: String,
          currentStock: Number,
          reorderLevel: Number,
        },
      ],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DayEndReport = mongoose.model('DayEndReport', dayEndReportSchema);
export default DayEndReport;
