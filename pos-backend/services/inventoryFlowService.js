import MenuItem from '../models/MenuItem.js';
import Sale from '../models/Sale.js';
import StockMovement from '../models/StockMovement.js';
import Supplier from '../models/Supplier.js';

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

export const calculateOrderTotals = (items) => {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.qty, 0)
  );
  const serviceCharge = roundMoney(subtotal * 0.1);
  const total = roundMoney(subtotal + serviceCharge);

  return { subtotal, serviceCharge, total };
};

export const getVoucherTotal = (items) =>
  roundMoney(items.reduce((sum, item) => sum + item.receivedQty * item.unitPrice, 0));

export const loadProductsForOrder = async (items) => {
  const productIds = items.map((item) => item.productId || item.id);
  const products = await MenuItem.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  return items.map((item) => {
    const productId = String(item.productId || item.id);
    const product = productMap.get(productId);

    if (!product) {
      throw new Error(`Product ${item.name || productId} not found`);
    }

    if (!product.isSellable) {
      throw new Error(`${product.name} is not available on the POS menu`);
    }

    return {
      product,
      qty: Number(item.qty),
    };
  });
};

export const ensureStockAvailability = async (items) => {
  const loadedItems = await loadProductsForOrder(items);

  loadedItems.forEach(({ product, qty }) => {
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (product.stock < qty) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
  });

  return loadedItems;
};

export const normalizeOrderItems = async (items) => {
  const loadedItems = await ensureStockAvailability(items);

  return loadedItems.map(({ product, qty }) => ({
    product: product._id,
    name: product.name,
    price: product.price,
    qty,
    image: product.image || '',
  }));
};

export const validateGrvProducts = async (supplierId, items) => {
  const productIds = items.map((item) => item.productId || item.product);
  const products = await MenuItem.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  items.forEach((item) => {
    const productId = String(item.productId || item.product);
    const product = productMap.get(productId);
    if (!product) {
      throw new Error('One or more GRV products could not be found');
    }
    const receivedQty = Number(item.receivedQty);
    const unitPrice = Number(item.unitPrice);

    if (!Number.isFinite(receivedQty) || receivedQty <= 0) {
      throw new Error(`Received quantity must be greater than zero for ${product.name}`);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Unit price is invalid for ${product.name}`);
    }

    if (product.supplier && product.supplier.toString() !== String(supplierId)) {
      throw new Error(`${product.name} is linked to a different supplier`);
    }
  });

  return products;
};

export const postGrvToStock = async (grv, userId) => {
  if (grv.status === 'Posted') {
    throw new Error('GRV has already been posted');
  }

  const supplier = await Supplier.findById(grv.supplier);
  if (!supplier) {
    throw new Error('Supplier linked to this GRV was not found');
  }

  for (const line of grv.items) {
    const product = await MenuItem.findById(line.product);
    if (!product) {
      throw new Error('A GRV product could not be found during posting');
    }

    if (!product.supplier) {
      product.supplier = grv.supplier;
    }

    product.stock += line.receivedQty;
    product.costPrice = line.unitPrice;
    await product.save();

    await StockMovement.create({
      item: product._id,
      type: 'IN',
      quantity: line.receivedQty,
      reference: grv._id,
      referenceModel: 'GRV',
      createdBy: userId,
      notes: [
        `GRV ${grv.voucherNumber}`,
        `Invoice ${grv.supplierInvoiceNumber}`,
        grv.purchaseOrderNumber ? `PO ${grv.purchaseOrderNumber}` : null,
        line.notes || null,
      ]
        .filter(Boolean)
        .join(' | '),
    });

    if (!supplier.items.some((itemId) => itemId.toString() === product._id.toString())) {
      supplier.items.push(product._id);
    }
  }

  supplier.totalPurchases = roundMoney((supplier.totalPurchases || 0) + grv.totalAmount);
  await supplier.save();

  grv.status = 'Posted';
  grv.postedAt = new Date();
  grv.postedBy = userId;
  await grv.save();

  return grv;
};

export const createSaleFromOrder = async ({
  order,
  paymentMethod,
  paymentReference,
  userId,
}) => {
  if (order.paymentStatus === 'Paid') {
    const existingSale = await Sale.findOne({ order: order._id });
    if (existingSale) {
      return existingSale;
    }
    throw new Error('Order is already paid');
  }

  const loadedItems = await ensureStockAvailability(
    order.items.map((item) => ({
      productId: item.product || item.id,
      qty: item.qty,
      name: item.name,
    }))
  );

  for (const { product, qty } of loadedItems) {
    product.stock -= qty;
    await product.save();

    await StockMovement.create({
      item: product._id,
      type: 'OUT',
      quantity: qty,
      reference: order._id,
      referenceModel: 'Sale',
      createdBy: userId,
      notes: `Sale ${order.orderId || order._id.toString()}`,
    });
  }

  const sale = await Sale.create({
    order: order._id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderType: order.type,
    table: order.table,
    tableNo: order.tableNo,
    items: order.items.map((item) => ({
      product: item.product || item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      total: roundMoney(item.price * item.qty),
    })),
    subtotal: order.subtotal,
    serviceCharge: order.serviceCharge,
    total: order.total,
    paymentMethod,
    paymentReference,
    paidAt: new Date(),
    createdBy: userId,
  });

  return sale;
};
