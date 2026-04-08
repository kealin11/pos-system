import SyncLog from '../models/SyncLog.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get sync status
export const getSyncStatus = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  const lastSync = await SyncLog.findOne({ deviceId }).sort('-lastSyncTime');

  res.status(200).json({
    success: true,
    data: lastSync || {
      deviceId,
      lastSyncTime: null,
      status: 'never',
    },
  });
});

// Sync data (download from server)
export const syncDownload = asyncHandler(async (req, res) => {
  const { deviceId, lastSyncTime } = req.body;

  const query = lastSyncTime
    ? { updatedAt: { $gt: new Date(lastSyncTime) } }
    : {};

  const [orders, items] = await Promise.all([
    Order.find(query).populate('table'),
    MenuItem.find(query),
  ]);

  // Create sync log
  await SyncLog.create({
    deviceId,
    lastSyncTime: new Date(),
    syncedData: {
      ordersCount: orders.length,
      itemsSynced: items.length,
    },
    status: 'success',
    syncDirection: 'download',
  });

  res.status(200).json({
    success: true,
    message: 'Data synced successfully',
    data: {
      orders,
      items,
      syncTime: new Date(),
    },
  });
});

// Sync data (upload to server)
export const syncUpload = asyncHandler(async (req, res) => {
  const { deviceId, orders, updates } = req.body;

  try {
    const createdOrders = [];
    const updatedItems = [];

    // Save orders
    if (orders && orders.length > 0) {
      const savedOrders = await Order.insertMany(orders);
      createdOrders.push(...savedOrders);
    }

    // Update items
    if (updates && updates.length > 0) {
      for (const update of updates) {
        const updated = await MenuItem.findByIdAndUpdate(
          update.itemId,
          { stock: update.stock },
          { new: true }
        );
        updatedItems.push(updated);
      }
    }

    // Create sync log
    await SyncLog.create({
      deviceId,
      lastSyncTime: new Date(),
      syncedData: {
        ordersCount: createdOrders.length,
        itemsSynced: updatedItems.length,
      },
      status: 'success',
      syncDirection: 'upload',
    });

    res.status(200).json({
      success: true,
      message: 'Data uploaded successfully',
      data: {
        ordersCreated: createdOrders.length,
        itemsUpdated: updatedItems.length,
      },
    });
  } catch (error) {
    // Log failed sync
    await SyncLog.create({
      deviceId,
      lastSyncTime: new Date(),
      status: 'failed',
      errorLog: error.message,
      syncDirection: 'upload',
    });

    throw error;
  }
});

// Bidirectional sync
export const syncBidirectional = asyncHandler(async (req, res) => {
  const { deviceId, lastSyncTime, orders, updates } = req.body;

  try {
    // First upload local data
    const createdOrders = [];
    const updatedItems = [];

    if (orders && orders.length > 0) {
      const savedOrders = await Order.insertMany(orders);
      createdOrders.push(...savedOrders);
    }

    if (updates && updates.length > 0) {
      for (const update of updates) {
        const updated = await MenuItem.findByIdAndUpdate(
          update.itemId,
          { stock: update.stock },
          { new: true }
        );
        updatedItems.push(updated);
      }
    }

    // Then download fresh data
    const query = lastSyncTime
      ? { updatedAt: { $gt: new Date(lastSyncTime) } }
      : {};

    const [serverOrders, serverItems] = await Promise.all([
      Order.find(query).populate('table'),
      MenuItem.find(query),
    ]);

    // Create sync log
    await SyncLog.create({
      deviceId,
      lastSyncTime: new Date(),
      syncedData: {
        ordersCount: createdOrders.length + serverOrders.length,
        itemsSynced: updatedItems.length + serverItems.length,
      },
      status: 'success',
      syncDirection: 'bidirectional',
    });

    res.status(200).json({
      success: true,
      message: 'Bidirectional sync completed',
      data: {
        uploaded: {
          ordersCount: createdOrders.length,
          itemsUpdated: updatedItems.length,
        },
        downloaded: {
          orders: serverOrders,
          items: serverItems,
        },
        syncTime: new Date(),
      },
    });
  } catch (error) {
    // Log failed sync
    await SyncLog.create({
      deviceId,
      lastSyncTime: new Date(),
      status: 'failed',
      errorLog: error.message,
      syncDirection: 'bidirectional',
    });

    throw error;
  }
});

// Get sync history
export const getSyncHistory = asyncHandler(async (req, res) => {
  const { deviceId, limit = 20 } = req.query;

  const history = await SyncLog.find(deviceId ? { deviceId } : {})
    .sort('-createdAt')
    .limit(parseInt(limit));

  res.status(200).json({ success: true, history });
});
