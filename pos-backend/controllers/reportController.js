import DayEndReport from '../models/DayEndReport.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import StockMovement from '../models/StockMovement.js';
import asyncHandler from '../utils/asyncHandler.js';

// Generate day-end report
export const generateDayEndReport = asyncHandler(async (req, res) => {
  const { date, notes } = req.body;
  const reportDate = date ? new Date(date) : new Date();
  reportDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(reportDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Get all orders for the day
  const orders = await Order.find({
    createdAt: {
      $gte: reportDate,
      $lt: nextDay,
    },
    status: 'Completed',
    paymentStatus: 'Paid',
  });

  // Calculate totals
  const totalOrders = orders.length;
  let totalRevenue = 0;
  let totalServiceCharge = 0;
  const paymentBreakdown = {
    cash: 0,
    card: 0,
    upi: 0,
    other: 0,
  };
  const ordersByType = {
    dineIn: 0,
    takeaway: 0,
  };

  orders.forEach((order) => {
    totalRevenue += order.total;
    totalServiceCharge += order.serviceCharge;

    const method = order.paymentMethod?.toLowerCase();
    if (method === 'cash') paymentBreakdown.cash += order.total;
    else if (method === 'card') paymentBreakdown.card += order.total;
    else if (method === 'upi') paymentBreakdown.upi += order.total;
    else paymentBreakdown.other += order.total;

    if (order.type === 'Dine In') ordersByType.dineIn++;
    else if (order.type === 'Takeaway') ordersByType.takeaway++;
  });

  // Get top items sold
  const topItems = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: reportDate,
          $lt: nextDay,
        },
        status: 'Completed',
        paymentStatus: 'Paid',
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        itemName: { $first: '$items.name' },
        quantitySold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        itemName: 1,
        quantitySold: 1,
        revenue: 1,
      },
    },
  ]);

  // Get low stock items
  const lowStockItems = await MenuItem.find({
    $expr: { $lte: ['$stock', '$reorderLevel'] },
  }).select('_id name stock reorderLevel');

  // Check if report already exists
  let report = await DayEndReport.findOne({ date: reportDate });

  if (report) {
    // Update existing report
    report.totalOrders = totalOrders;
    report.totalRevenue = totalRevenue;
    report.totalServiceCharge = totalServiceCharge;
    report.paymentBreakdown = paymentBreakdown;
    report.ordersByType = ordersByType;
    report.topItems = topItems;
    report.stockSummary.itemsLowStock = lowStockItems;
    report.notes = notes;
    report.generatedBy = req.user._id;
    await report.save();
  } else {
    // Create new report
    report = await DayEndReport.create({
      date: reportDate,
      totalOrders,
      totalRevenue,
      totalServiceCharge,
      paymentBreakdown,
      ordersByType,
      topItems,
      stockSummary: {
        itemsLowStock: lowStockItems,
      },
      notes,
      generatedBy: req.user._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Day-end report generated',
    report,
  });
});

// Get day-end report
export const getDayEndReport = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const reportDate = new Date(date);
  reportDate.setHours(0, 0, 0, 0);

  const report = await DayEndReport.findOne({ date: reportDate }).populate(
    'generatedBy',
    'name'
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found for this date',
    });
  }

  res.status(200).json({ success: true, report });
});

// Get all day-end reports
export const getAllDayEndReports = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 30 } = req.query;

  let query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      query.date.$lt = end;
    }
  }

  const reports = await DayEndReport.find(query)
    .populate('generatedBy', 'name')
    .sort('-date')
    .limit(parseInt(limit));

  res.status(200).json({ success: true, reports });
});

// Finalize report (lock it)
export const finalizeReport = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const reportDate = new Date(date);
  reportDate.setHours(0, 0, 0, 0);

  const report = await DayEndReport.findOneAndUpdate(
    { date: reportDate },
    { isFinalized: true },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Report finalized',
    report,
  });
});

// Delete report
export const deleteReport = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const reportDate = new Date(date);
  reportDate.setHours(0, 0, 0, 0);

  const report = await DayEndReport.findOneAndDelete({ date: reportDate });

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Report deleted successfully',
  });
});

// Get revenue summary for date range
export const getRevenueSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateRange = {};
  if (startDate) dateRange.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    dateRange.$lt = end;
  }

  const summary = await DayEndReport.aggregate([
    {
      $match: dateRange.length ? { date: dateRange } : {},
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalRevenue: { $sum: '$totalRevenue' },
        totalOrders: { $sum: '$totalOrders' },
        avgOrderValue: {
          $avg: { $divide: ['$totalRevenue', '$totalOrders'] },
        },
        totalServiceCharge: { $sum: '$totalServiceCharge' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    summary: summary[0] || {
      totalDays: 0,
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      totalServiceCharge: 0,
    },
  });
});
