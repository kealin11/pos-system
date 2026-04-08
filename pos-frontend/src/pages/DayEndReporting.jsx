import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../api/services';
import ConfirmDialog from '../components/shared/ConfirmDialog.jsx';
import { formatCurrency } from '../utils';
import { FiDownload, FiRefreshCw, FiBarChart2, FiTrash2 } from 'react-icons/fi';

const DayEndReporting = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getAll({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Generating report for:', today);
      const response = await reportsAPI.generate({
        date: today,
        notes: 'Auto-generated day-end report',
      });
      console.log('Report generated:', response);
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error.response?.data || error.message);
      alert(`Failed to generate report: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;
    try {
      const reportDate = new Date(selectedReport.date)
        .toISOString()
        .split('T')[0];
      console.log('Updating report for:', reportDate);
      const response = await reportsAPI.generate({
        date: reportDate,
        notes: selectedReport.notes || 'Updated after more orders',
      });
      console.log('Report updated:', response);
      fetchReports();
      // Refresh selected report with new data
      const reportResponse = await reportsAPI.getReport(reportDate);
      setSelectedReport(reportResponse.data.report);
    } catch (error) {
      console.error('Error updating report:', error.response?.data || error.message);
      alert(`Failed to update report: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    try {
      setDeleteBusy(true);
      const reportDate = new Date(selectedReport.date).toISOString().split('T')[0];
      await reportsAPI.delete(reportDate);
      setSelectedReport(null);
      setDeleteDialogOpen(false);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error.response?.data || error.message);
      alert(`Failed to delete report: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleteBusy(false);
    }
  };

  const exportToCSV = (report) => {
    const data = [
      ['Date', new Date(report.date).toLocaleDateString()],
      ['Total Orders', report.totalOrders],
      ['Total Revenue', formatCurrency(report.totalRevenue)],
      ['Service Charge', formatCurrency(report.totalServiceCharge)],
      [],
      ['Payment Method', 'Amount'],
      ['Cash', formatCurrency(report.paymentBreakdown.cash)],
      ['Card', formatCurrency(report.paymentBreakdown.card)],
      ['UPI', formatCurrency(report.paymentBreakdown.upi)],
      [],
      ['Order Type', 'Count'],
      ['Dine In', report.ordersByType.dineIn],
      ['Takeaway', report.ordersByType.takeaway],
    ];

    const csv = data.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date(report.date).toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#888]">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Day-End Reports</h1>
        <p className="text-[#888]">Track your daily sales and performance</p>
      </div>

      {/* Controls */}
      <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="text-sm text-[#888]">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-[#888]">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2 mt-1"
            />
          </div>
          <button
            onClick={handleGenerateToday}
            className="bg-[#f6b100] hover:bg-[#d49a00] text-black font-semibold px-4 py-2 rounded transition-colors"
          >
            Generate Today
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold mb-4">Reports</h2>
          <div className="space-y-2">
            {reports.map((report) => (
              <button
                key={report._id}
                onClick={() => setSelectedReport(report)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedReport?._id === report._id
                    ? 'bg-[#f6b100] border-[#f6b100] text-black'
                    : 'bg-[#262626] border-[#3a3a3a] text-white hover:border-[#f6b100]'
                }`}
              >
                <p className="font-semibold">
                  {new Date(report.date).toLocaleDateString()}
                </p>
                <p className="text-sm opacity-75">
                  ₹{report.totalRevenue.toFixed(0)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Report Details */}
        {selectedReport ? (
          <div className="lg:col-span-2">
            <div className="bg-[#262626] rounded-lg p-6 border border-[#3a3a3a]">
            <div className="flex justify-between items-center mb-6 gap-3">
              <h2 className="text-xl font-bold">
                {new Date(selectedReport.date).toLocaleDateString()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateReport}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center gap-2"
                  title="Update report with latest data"
                >
                  <FiRefreshCw size={18} />
                  <span className="text-sm font-semibold hidden sm:inline">Update</span>
                </button>
                <button
                  onClick={() => exportToCSV(selectedReport)}
                  className="p-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded transition-colors"
                  title="Download as CSV"
                >
                  <FiDownload size={18} />
                </button>
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="p-2 bg-red-700 hover:bg-red-800 rounded transition-colors"
                  title="Delete report"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[#888] text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-[#f6b100]">
                    {selectedReport.totalOrders}
                  </p>
                </div>
                <div>
                  <p className="text-[#888] text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(selectedReport.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-[#888] text-sm">Service Charge</p>
                  <p className="text-xl font-bold text-[#888]">
                    {formatCurrency(selectedReport.totalServiceCharge)}
                  </p>
                </div>
                <div>
                  <p className="text-[#888] text-sm">Avg Order Value</p>
                  <p className="text-xl font-bold text-[#888]">
                    {formatCurrency(
                      selectedReport.totalRevenue /
                        (selectedReport.totalOrders || 1)
                    )}
                  </p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Payment Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Cash</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        selectedReport.paymentBreakdown.cash
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Card</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        selectedReport.paymentBreakdown.card
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">UPI</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedReport.paymentBreakdown.upi)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Items */}
              {selectedReport.topItems && selectedReport.topItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Top Items</h3>
                  <div className="space-y-2 text-sm">
                    {selectedReport.topItems.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-[#888]">
                          {item.itemName} ×{item.quantitySold}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-[#262626] rounded-lg p-6 border border-[#3a3a3a] flex items-center justify-center h-96">
            <div className="text-center text-[#888]">
              <FiBarChart2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a report to view details</p>
            </div>
          </div>
        )}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <p>No reports available for the selected date range</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Report"
        message={
          selectedReport
            ? `Are you sure you want to delete the report for ${new Date(selectedReport.date).toLocaleDateString()}?`
            : ''
        }
        confirmLabel="Delete Report"
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteReport}
        busy={deleteBusy}
      />
    </div>
  );
};

export default DayEndReporting;
