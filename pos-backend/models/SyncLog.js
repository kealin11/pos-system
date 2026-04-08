import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    lastSyncTime: {
      type: Date,
      required: true,
    },
    syncedData: {
      ordersCount: Number,
      itemsSynced: Number,
      stockUpdates: Number,
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
    errorLog: {
      type: String,
    },
    syncDirection: {
      type: String,
      enum: ['upload', 'download', 'bidirectional'],
      default: 'bidirectional',
    },
  },
  { timestamps: true }
);

const SyncLog = mongoose.model('SyncLog', syncLogSchema);
export default SyncLog;
