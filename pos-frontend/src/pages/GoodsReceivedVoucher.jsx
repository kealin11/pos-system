import React, { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiTruck,
} from 'react-icons/fi';
import { grvAPI, inventoryAPI, suppliersAPI } from '../api/services';

const createVoucherNumber = () => `GRV-${Date.now()}`;

const createLineItem = () => ({
  lineId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  productId: '',
  orderedQty: '',
  receivedQty: '',
  unitPrice: '',
  notes: '',
});

const createInitialForm = () => ({
  voucherNumber: createVoucherNumber(),
  supplierId: '',
  supplierInvoiceNumber: '',
  purchaseOrderNumber: '',
  receivedDate: new Date().toISOString().split('T')[0],
  notes: '',
});

const formatCurrency = (value) => `R${Number(value || 0).toFixed(2)}`;

const GoodsReceivedVoucher = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [grvs, setGrvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(createInitialForm());
  const [lineItems, setLineItems] = useState([createLineItem()]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [suppliersResponse, itemsResponse, grvResponse] = await Promise.all([
        suppliersAPI.getAll({ active: true }),
        inventoryAPI.getAll({}),
        grvAPI.getAll(),
      ]);

      setSuppliers(suppliersResponse.data.suppliers || []);
      setItems(itemsResponse.data.items || []);
      setGrvs(grvResponse.data.grvs || []);
    } catch (fetchError) {
      console.error('Error fetching GRV data:', fetchError);
      setError('Unable to load GRV data right now.');
    } finally {
      setLoading(false);
    }
  };

  const resetVoucher = () => {
    setEditingId(null);
    setFormData(createInitialForm());
    setLineItems([createLineItem()]);
    setError('');
    setSuccessMessage('');
  };

  const selectedSupplier = suppliers.find(
    (supplier) => supplier._id === formData.supplierId
  );

  const filteredItems = formData.supplierId
    ? items.filter(
        (item) =>
          !item.supplier ||
          item.supplier === formData.supplierId ||
          item.supplier?._id === formData.supplierId
      )
    : items;

  const detailedLines = lineItems.map((line) => {
    const matchedItem = items.find((item) => item._id === line.productId);
    const orderedQty = Number(line.orderedQty || 0);
    const receivedQty = Number(line.receivedQty || 0);
    const unitPrice = Number(line.unitPrice || 0);

    return {
      ...line,
      item: matchedItem,
      orderedQty,
      receivedQty,
      unitPrice,
      variance: receivedQty - orderedQty,
      lineTotal: receivedQty * unitPrice,
    };
  });

  const totals = detailedLines.reduce(
    (accumulator, line) => {
      accumulator.orderedQty += line.orderedQty;
      accumulator.receivedQty += line.receivedQty;
      accumulator.grandTotal += line.lineTotal;
      return accumulator;
    },
    { orderedQty: 0, receivedQty: 0, grandTotal: 0 }
  );

  const updateLineItem = (lineId, field, value) => {
    setLineItems((currentLines) =>
      currentLines.map((line) =>
        line.lineId === lineId ? { ...line, [field]: value } : line
      )
    );
  };

  const addLineItem = () => {
    setLineItems((currentLines) => [...currentLines, createLineItem()]);
  };

  const removeLineItem = (lineId) => {
    setLineItems((currentLines) =>
      currentLines.length === 1
        ? currentLines
        : currentLines.filter((line) => line.lineId !== lineId)
    );
  };

  const buildPayload = () => ({
    voucherNumber: formData.voucherNumber,
    supplierId: formData.supplierId,
    supplierInvoiceNumber: formData.supplierInvoiceNumber,
    purchaseOrderNumber: formData.purchaseOrderNumber,
    receivedDate: formData.receivedDate,
    notes: formData.notes,
    items: detailedLines
      .filter((line) => line.productId)
      .map((line) => ({
        productId: line.productId,
        orderedQty: line.orderedQty,
        receivedQty: line.receivedQty,
        unitPrice: line.unitPrice,
        notes: line.notes,
      })),
  });

  const validateVoucher = () => {
    if (!formData.supplierId) {
      return 'Select a supplier before saving the GRV.';
    }
    if (!formData.supplierInvoiceNumber.trim()) {
      return 'Supplier invoice number is required.';
    }

    const validLines = detailedLines.filter((line) => line.productId);
    if (validLines.length === 0) {
      return 'Add at least one GRV line.';
    }

    const invalidLine = validLines.find(
      (line) =>
        line.receivedQty <= 0 ||
        !Number.isFinite(line.receivedQty) ||
        line.unitPrice < 0 ||
        !Number.isFinite(line.unitPrice)
    );

    if (invalidLine) {
      return 'Each line must have a product, a received quantity above zero, and a valid unit price.';
    }

    return '';
  };

  const saveDraft = async () => {
    setError('');
    setSuccessMessage('');

    const validationMessage = validateVoucher();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const response = editingId
        ? await grvAPI.update(editingId, payload)
        : await grvAPI.create(payload);
      const savedGrv = response.data.grv;

      setEditingId(savedGrv._id);
      setFormData((current) => ({
        ...current,
        voucherNumber: savedGrv.voucherNumber,
      }));
      setSuccessMessage(`${savedGrv.voucherNumber} saved as draft.`);
      await fetchData();
    } catch (saveError) {
      console.error('Error saving GRV draft:', saveError);
      setError(saveError.response?.data?.message || 'Unable to save GRV draft.');
    } finally {
      setSubmitting(false);
    }
  };

  const postCurrentGrv = async () => {
    setError('');
    setSuccessMessage('');

    const validationMessage = validateVoucher();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const draftResponse = editingId
        ? await grvAPI.update(editingId, payload)
        : await grvAPI.create(payload);
      const draftGrv = draftResponse.data.grv;

      await grvAPI.post(draftGrv._id);
      resetVoucher();
      setSuccessMessage(`${draftGrv.voucherNumber} posted and stock updated.`);
      await fetchData();
    } catch (postError) {
      console.error('Error posting GRV:', postError);
      setError(postError.response?.data?.message || 'Unable to post GRV.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadDraft = (grv) => {
    setEditingId(grv._id);
    setFormData({
      voucherNumber: grv.voucherNumber,
      supplierId: grv.supplier?._id || '',
      supplierInvoiceNumber: grv.supplierInvoiceNumber || '',
      purchaseOrderNumber: grv.purchaseOrderNumber || '',
      receivedDate: new Date(grv.receivedDate).toISOString().split('T')[0],
      notes: grv.notes || '',
    });
    setLineItems(
      (grv.items || []).map((line) => ({
        lineId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productId: line.product?._id || line.product || '',
        orderedQty: String(line.orderedQty || ''),
        receivedQty: String(line.receivedQty || ''),
        unitPrice: String(line.unitPrice || ''),
        notes: line.notes || '',
      }))
    );
    setError('');
    setSuccessMessage(`Loaded draft ${grv.voucherNumber}.`);
  };

  const postExistingDraft = async (grvId) => {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      await grvAPI.post(grvId);
      if (editingId === grvId) {
        resetVoucher();
      }
      setSuccessMessage('Draft posted successfully.');
      await fetchData();
    } catch (postError) {
      console.error('Error posting saved draft:', postError);
      setError(postError.response?.data?.message || 'Unable to post saved draft.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#888]">Loading GRV workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 md:p-6">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Goods Received Voucher</h1>
          <p className="text-[#888] max-w-3xl">
            Draft GRVs against suppliers, then post them to increase stock.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] min-w-[140px]">
            <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Suppliers</p>
            <p className="text-2xl font-bold text-[#f6b100]">{suppliers.length}</p>
          </div>
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] min-w-[140px]">
            <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Drafts</p>
            <p className="text-2xl font-bold text-[#f6b100]">
              {grvs.filter((grv) => grv.status === 'Draft').length}
            </p>
          </div>
          <div className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] min-w-[140px]">
            <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Posted</p>
            <p className="text-2xl font-bold text-[#f6b100]">
              {grvs.filter((grv) => grv.status === 'Posted').length}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="bg-[#262626] rounded-lg p-4 border border-[#3a3a3a] hover:border-[#f6b100] transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-[#f6b100] mb-1">
              <FiRefreshCw size={16} />
              <span className="text-sm font-semibold">Refresh</span>
            </div>
            <p className="text-xs text-[#888]">Reload suppliers, products, and GRVs</p>
          </button>
        </div>
      </div>

      {(error || successMessage) && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 ${
            error
              ? 'border-red-700 bg-red-950 text-red-200'
              : 'border-green-700 bg-green-950 text-green-200'
          }`}
        >
          {error || successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 2xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-[#262626] rounded-xl border border-[#3a3a3a] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <FiFileText className="text-[#f6b100]" size={20} />
            <h2 className="text-xl font-bold">{editingId ? 'Edit Draft GRV' : 'New GRV Draft'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <label className="block">
              <span className="text-sm text-[#888] mb-2 block">Voucher Number</span>
              <input
                value={formData.voucherNumber}
                readOnly
                className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-[#888] mb-2 block">Received Date</span>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, receivedDate: event.target.value }))
                }
                className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-[#888] mb-2 block">Supplier</span>
              <select
                value={formData.supplierId}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, supplierId: event.target.value }))
                }
                className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-[#888] mb-2 block">Supplier Invoice</span>
              <input
                value={formData.supplierInvoiceNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    supplierInvoiceNumber: event.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-[#888] mb-2 block">Purchase Order</span>
              <input
                value={formData.purchaseOrderNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    purchaseOrderNumber: event.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
              />
            </label>
            <label className="block md:col-span-2 xl:col-span-1">
              <span className="text-sm text-[#888] mb-2 block">Delivery Notes</span>
              <input
                value={formData.notes}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, notes: event.target.value }))
                }
                className="w-full bg-[#1a1a1a] text-white border border-[#3a3a3a] rounded px-4 py-2"
              />
            </label>
          </div>

          {selectedSupplier && (
            <div className="mb-6 rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] p-4">
              <div className="flex items-center gap-2 mb-2 text-[#f6b100]">
                <FiTruck size={16} />
                <span className="font-semibold">Supplier Snapshot</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-[#cfcfcf]">
                <p>{selectedSupplier.name}</p>
                <p>{selectedSupplier.contactPerson || 'No contact person set'}</p>
                <p>{selectedSupplier.phone || selectedSupplier.email || 'No contact info'}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">GRV Lines</h3>
              <p className="text-sm text-[#888]">Posting is what increases stock.</p>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f6b100] hover:bg-[#d49a00] text-black font-semibold rounded transition-colors"
            >
              <FiPlus size={16} />
              Add Line
            </button>
          </div>

          <div className="space-y-4">
            {detailedLines.map((line, index) => (
              <div
                key={line.lineId}
                className="rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-[#f6b100]" size={16} />
                    <span className="font-semibold">Line {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(line.lineId)}
                    disabled={lineItems.length === 1}
                    className="p-2 rounded text-red-400 hover:bg-red-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  <label className="block xl:col-span-2">
                    <span className="text-sm text-[#888] mb-2 block">Product</span>
                    <select
                      value={line.productId}
                      onChange={(event) =>
                        updateLineItem(line.lineId, 'productId', event.target.value)
                      }
                      className="w-full bg-[#121212] text-white border border-[#3a3a3a] rounded px-4 py-2"
                    >
                      <option value="">Select product</option>
                      {filteredItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm text-[#888] mb-2 block">Ordered Qty</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.orderedQty}
                      onChange={(event) =>
                        updateLineItem(line.lineId, 'orderedQty', event.target.value)
                      }
                      className="w-full bg-[#121212] text-white border border-[#3a3a3a] rounded px-4 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[#888] mb-2 block">Received Qty</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.receivedQty}
                      onChange={(event) =>
                        updateLineItem(line.lineId, 'receivedQty', event.target.value)
                      }
                      className="w-full bg-[#121212] text-white border border-[#3a3a3a] rounded px-4 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[#888] mb-2 block">Unit Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(event) =>
                        updateLineItem(line.lineId, 'unitPrice', event.target.value)
                      }
                      className="w-full bg-[#121212] text-white border border-[#3a3a3a] rounded px-4 py-2"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mt-4 items-end">
                  <label className="block">
                    <span className="text-sm text-[#888] mb-2 block">Line Notes</span>
                    <input
                      value={line.notes}
                      onChange={(event) =>
                        updateLineItem(line.lineId, 'notes', event.target.value)
                      }
                      className="w-full bg-[#121212] text-white border border-[#3a3a3a] rounded px-4 py-2"
                    />
                  </label>
                  <div className="rounded-lg border border-[#3a3a3a] px-4 py-2">
                    <p className="text-xs text-[#888] mb-1">Variance</p>
                    <p className="font-semibold text-[#f6b100]">
                      {line.variance > 0 ? '+' : ''}
                      {line.variance}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#3a3a3a] px-4 py-2">
                    <p className="text-xs text-[#888] mb-1">Line Total</p>
                    <p className="font-semibold text-[#f6b100]">
                      {formatCurrency(line.lineTotal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[#888] mb-1">Total Ordered</p>
                <p className="text-2xl font-bold text-white">{totals.orderedQty}</p>
              </div>
              <div>
                <p className="text-sm text-[#888] mb-1">Total Received</p>
                <p className="text-2xl font-bold text-white">{totals.receivedQty}</p>
              </div>
              <div>
                <p className="text-sm text-[#888] mb-1">Voucher Value</p>
                <p className="text-2xl font-bold text-[#f6b100]">
                  {formatCurrency(totals.grandTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={saveDraft}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#3a7a52] hover:bg-[#2f6645] disabled:opacity-60 text-white font-semibold rounded transition-colors"
            >
              <FiSave size={18} />
              Save Draft
            </button>
            <button
              type="button"
              onClick={postCurrentGrv}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded transition-colors"
            >
              <FiCheckCircle size={18} />
              Post GRV
            </button>
            <button
              type="button"
              onClick={resetVoucher}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold rounded transition-colors"
            >
              <FiRefreshCw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#262626] rounded-xl border border-[#3a3a3a] p-5">
            <h2 className="text-xl font-bold mb-4">GRV Register</h2>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {grvs.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#3a3a3a] p-6 text-center text-[#888]">
                  No GRVs created yet.
                </div>
              )}

              {grvs.map((grv) => (
                <div
                  key={grv._id}
                  className="rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-white">{grv.voucherNumber}</p>
                      <p className="text-sm text-[#888]">{grv.supplier?.name}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        grv.status === 'Posted'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {grv.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-[#cfcfcf] mb-3">
                    <p>Invoice: {grv.supplierInvoiceNumber}</p>
                    <p>Date received: {new Date(grv.receivedDate).toISOString().split('T')[0]}</p>
                    <p>Total value: {formatCurrency(grv.totalAmount)}</p>
                  </div>
                  {grv.status === 'Draft' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadDraft(grv)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#2e5b94] hover:bg-[#254a78] text-white text-sm rounded transition-colors"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => postExistingDraft(grv._id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded transition-colors"
                      >
                        <FiCheckCircle size={14} />
                        Post
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#262626] rounded-xl border border-[#3a3a3a] p-5">
            <h2 className="text-xl font-bold mb-4">Receiving Rules</h2>
            <div className="space-y-3 text-sm text-[#cfcfcf]">
              <p>1. Draft GRVs store supplier and invoice details without touching stock.</p>
              <p>2. Posting a GRV is the only path that increases stock.</p>
              <p>3. Completed payments create the sale and reduce stock.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsReceivedVoucher;
