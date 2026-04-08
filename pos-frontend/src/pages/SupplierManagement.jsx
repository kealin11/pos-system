import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../api/services';
import ConfirmDialog from '../components/shared/ConfirmDialog.jsx';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMail } from 'react-icons/fi';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [supplierPendingDelete, setSupplierPendingDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Credit',
    creditDays: 30,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await suppliersAPI.update(editingId, formData);
      } else {
        await suppliersAPI.create(formData);
      }
      fetchSuppliers();
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleDelete = async () => {
    if (!supplierPendingDelete) return;

    try {
      setDeleteBusy(true);
      await suppliersAPI.delete(supplierPendingDelete._id);
      fetchSuppliers();
      setSupplierPendingDelete(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(`Failed to delete supplier: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: 'Credit',
      creditDays: 30,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#888]">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Supplier Management</h1>
          <p className="text-[#888]">Manage your suppliers and their information</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#f6b100] hover:bg-[#d49a00] text-black font-semibold px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <FiPlus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#262626] rounded-lg p-6 border border-[#3a3a3a] mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Supplier Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2 md:col-span-2"
            />
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
            >
              <option>Cash</option>
              <option>Credit</option>
              <option>Check</option>
            </select>
            <input
              type="number"
              placeholder="Credit Days"
              value={formData.creditDays}
              onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
              className="bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors"
              >
                {editingId ? 'Update' : 'Create'} Supplier
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <div
            key={supplier._id}
            className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] hover:border-[#f6b100] transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{supplier.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="p-2 hover:bg-[#3a3a3a] rounded transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => setSupplierPendingDelete(supplier)}
                  className="p-2 hover:bg-red-900 rounded transition-colors text-red-500"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#888]">
              {supplier.contactPerson && (
                <p>Contact: {supplier.contactPerson}</p>
              )}
              {supplier.phone && (
                <p className="flex items-center gap-2">
                  <FiPhone size={14} /> {supplier.phone}
                </p>
              )}
              {supplier.email && (
                <p className="flex items-center gap-2">
                  <FiMail size={14} /> {supplier.email}
                </p>
              )}
              {supplier.address && (
                <p>Address: {supplier.address}</p>
              )}
              <p>Payment: {supplier.paymentTerms} ({supplier.creditDays} days)</p>
            </div>

            {supplier.items && supplier.items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#3a3a3a]">
                <p className="text-xs text-[#f6b100] font-semibold">
                  Supplies {supplier.items.length} items
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <p>No suppliers yet. Add one to get started!</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!supplierPendingDelete}
        title="Delete Supplier"
        message={
          supplierPendingDelete
            ? `Are you sure you want to delete "${supplierPendingDelete.name}"?`
            : ''
        }
        confirmLabel="Delete Supplier"
        onCancel={() => setSupplierPendingDelete(null)}
        onConfirm={handleDelete}
        busy={deleteBusy}
      />
    </div>
  );
};

export default SupplierManagement;
