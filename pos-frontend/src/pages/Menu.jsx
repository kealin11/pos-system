import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BottomNav from '../components/shared/BottomNav.jsx';
import BackButton from '../components/shared/BackButton.jsx';
import AddProductModal from '../components/shared/AddProductModal.jsx';
import EditProductModal from '../components/shared/EditProductModal.jsx';
import ConfirmDialog from '../components/shared/ConfirmDialog.jsx';
import Cart from '../components/cart/Cart.jsx';
import { menuCategories } from '../data.js';
import { inventoryAPI } from '../api/services.js';
import {
  addItem,
  clearCart,
  removeItem,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
  updateQty,
} from '../redux/slices/cartSlice.js';
import { selectIsAdmin } from '../redux/slices/authSlice.js';
import { formatCurrency } from '../utils.js';
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiEdit,
  FiGrid,
  FiLock,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { FaCoffee, FaIceCream, FaStar } from 'react-icons/fa';

const CASHIERS = [
  { id: 'C01', password: '1111', name: 'Cashier 1' },
  { id: 'C02', password: '2222', name: 'Cashier 2' },
  { id: 'C03', password: '3333', name: 'Cashier 3' },
  { id: 'C04', password: '4444', name: 'Cashier 4' },
  { id: 'C05', password: '5555', name: 'Cashier 5' },
  { id: 'C06', password: '6666', name: 'Cashier 6' },
];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Drinks':
      return <FaCoffee className="text-5xl text-[#f6b100]" />;
    case 'Desserts':
      return <FaIceCream className="text-5xl text-[#f6b100]" />;
    default:
      return <FaStar className="text-5xl text-[#f6b100]" />;
  }
};

const CashierLoginModal = ({ form, error, onChange, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#383838] bg-[#151515]">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(246,177,0,0.2),_transparent_45%),linear-gradient(145deg,#262626,#151515)] p-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#4f4120] bg-[#221d11] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#f6b100]">
            <FiLock size={14} />
            Cashier Access
          </p>
          <h2 className="text-3xl font-bold text-white">Sign in before starting a sale.</h2>
          <p className="mt-4 text-sm leading-6 text-[#d1c5ab]">
            Use one of the six simple cashier logins below to open the POS sales screen.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CASHIERS.map((cashier) => (
              <div key={cashier.id} className="rounded-2xl border border-[#423724] bg-[#1d1a16]/90 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9f8b62]">{cashier.name}</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
                  <span className="text-[#b9b0a1]">ID</span>
                  <span className="font-semibold text-[#f6b100]">{cashier.id}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
                  <span className="text-[#b9b0a1]">Password</span>
                  <span className="font-semibold text-white">{cashier.password}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#101010] p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#7e7e7e]">POS Login</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Cashier Sign In</h3>
            </div>
            <button onClick={onClose} className="rounded-full border border-[#2d2d2d] p-2 text-[#8a8a8a] hover:text-white">
              <FiX size={18} />
            </button>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#cfcfcf]">ID</span>
              <div className="flex items-center gap-3 rounded-2xl border border-[#2f2f2f] bg-[#181818] px-4 py-3">
                <FiUser className="text-[#888]" size={18} />
                <input
                  name="id"
                  value={form.id}
                  onChange={onChange}
                  placeholder="Enter cashier ID"
                  className="w-full bg-transparent text-white outline-none placeholder:text-[#5f5f5f]"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#cfcfcf]">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-[#2f2f2f] bg-[#181818] px-4 py-3">
                <FiLock className="text-[#888]" size={18} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-white outline-none placeholder:text-[#5f5f5f]"
                />
              </div>
            </label>

            {error && <div className="rounded-2xl border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200">{error}</div>}

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f6b100] px-5 py-4 text-sm font-bold text-black hover:bg-[#d7a006]">
              Open Sales Menu
              <FiArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

const MenuItemCard = ({ item, onProductDeleted, onProductEdit, canManageProducts }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const inCart = cartItems.find((cartItem) => cartItem.id === item.id);
  const [added, setAdded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canAddMore = (inCart?.qty || 0) < (item.stock || 0);

  const handleAdd = () => {
    if (!canAddMore) return;
    dispatch(addItem(item));
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await inventoryAPI.delete(item.id);
      onProductDeleted?.();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Failed to delete product: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-[26px] border border-[#2f2f2f] bg-[#1c1c1c] transition hover:-translate-y-1 hover:border-[#4b4024] hover:bg-[#232323]">
      <div className="relative flex h-40 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(246,177,0,0.12),_transparent_45%),linear-gradient(180deg,#202020,#181818)]">
        {item.image ? <img src={item.image} alt={item.name} className="h-40 w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{getCategoryIcon(item.category)}</div>}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f0ede4]">{item.category}</span>
          {item.popular && <span className="rounded-full bg-[#f6b100] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black">Popular</span>}
        </div>
        {inCart && <span className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">x{inCart.qty}</span>}
        {canManageProducts && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
            <button onClick={() => onProductEdit(item)} className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700" title="Edit product"><FiEdit size={14} /></button>
            <button onClick={() => setDeleteDialogOpen(true)} disabled={deleting} className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700 disabled:opacity-60" title="Delete product"><FiTrash2 size={14} /></button>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#f5f5f5]">{item.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8f8f8f]">{item.description}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAddMore}
            className={`${added ? 'bg-green-600 text-white' : 'bg-[#f6b100] text-black hover:bg-[#d49a00]'} flex h-10 w-10 items-center justify-center rounded-2xl font-bold transition disabled:bg-[#343434] disabled:text-[#777]`}
          >
            {added ? <FiCheck size={16} /> : <FiPlus size={16} />}
          </button>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-[#f6b100]">{formatCurrency(item.price)}</p>
            <p className={`mt-1 text-xs ${item.stock > 0 ? 'text-[#8c8c8c]' : 'text-red-400'}`}>{item.stock > 0 ? `${item.stock} available` : 'Out of stock'}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#666]">Tap to add</p>
        </div>
      </div>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${item.name}" from the menu?`}
        confirmLabel="Delete Product"
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        busy={deleting}
      />
    </div>
  );
};

const OrderSummary = ({ cashier, onOpenCart }) => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);

  return (
    <aside className="flex h-full flex-col rounded-[30px] border border-[#2f2f2f] bg-[linear-gradient(180deg,#1b1b1b,#111111)] p-5">
      <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#747474]">Current Ticket</p>
          <h2 className="mt-1 text-xl font-bold text-white">Order Summary</h2>
        </div>
        <div className="rounded-2xl border border-[#3d3524] bg-[#1f1a11] px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8f7b4d]">Cashier</p>
          <p className="text-sm font-semibold text-[#f6b100]">{cashier.name}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#2f2f2f] bg-[#181818] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#717171]">Items</p>
          <p className="mt-2 text-2xl font-bold text-white">{cartCount}</p>
        </div>
        <div className="rounded-2xl border border-[#2f2f2f] bg-[#181818] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#717171]">Total</p>
          <p className="mt-2 text-2xl font-bold text-[#f6b100]">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-5 flex-1 overflow-hidden rounded-[26px] border border-[#2a2a2a] bg-[#151515]">
        <div className="flex items-center justify-between border-b border-[#252525] px-4 py-3">
          <p className="text-sm font-semibold text-white">Items in basket</p>
          <button onClick={onOpenCart} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f6b100]">Full cart</button>
        </div>
        <div className="max-h-[420px] overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-[22px] border border-dashed border-[#333] bg-[#111] text-center">
              <FiShoppingCart size={34} className="text-[#4d4d4d]" />
              <p className="mt-4 text-sm font-medium text-[#d7d7d7]">No products added yet</p>
              <p className="mt-1 text-xs text-[#6f6f6f]">Choose products from the menu to start the sale.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-[#2d2d2d] bg-[#1b1b1b] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-[#8d8d8d]">{formatCurrency(item.price)} each</p>
                    </div>
                    <button onClick={() => dispatch(removeItem(item.id))} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-[#313131] bg-[#141414] p-1">
                      <button onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))} className="flex h-8 w-8 items-center justify-center rounded-full text-[#f2f2f2] hover:bg-[#262626]"><FiMinus size={13} /></button>
                      <span className="w-7 text-center text-sm font-semibold text-white">{item.qty}</span>
                      <button onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))} disabled={item.qty >= item.stock} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6b100] text-black hover:bg-[#d49a00] disabled:bg-[#343434] disabled:text-[#777]"><FiPlus size={13} /></button>
                    </div>
                    <p className="text-sm font-bold text-[#f6b100]">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-[24px] border border-[#2e2e2e] bg-[#151515] p-4">
        <div className="flex items-center justify-between text-sm text-[#9d9d9d]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <div className="flex items-center justify-between text-sm text-[#9d9d9d]"><span>Service charge</span><span>{formatCurrency(subtotal * 0.1)}</span></div>
        <div className="flex items-center justify-between border-t border-[#2f2f2f] pt-3 text-base font-bold text-white"><span>Total due</span><span className="text-[#f6b100]">{formatCurrency(total)}</span></div>
        <button onClick={onOpenCart} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f6b100] px-4 py-3 text-sm font-bold text-black hover:bg-[#d49a00]">Open Checkout</button>
        <button onClick={() => dispatch(clearCart())} disabled={items.length === 0} className="w-full rounded-2xl border border-[#383838] px-4 py-3 text-sm font-semibold text-[#d0d0d0] hover:border-[#575757] hover:text-white disabled:cursor-not-allowed disabled:opacity-50">Clear Ticket</button>
      </div>
    </aside>
  );
};

const SaleLaunchScreen = ({ onMakeSale }) => (
  <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(246,177,0,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),_transparent_28%),linear-gradient(180deg,#121212,#1b1b1b)] pb-16">
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
      <div className="flex items-center gap-4">
        <BackButton />
        <p className="rounded-full border border-[#3a3a3a] bg-[#1d1d1d]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#f6b100]">
          Sales Terminal
        </p>
      </div>

      <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9e8a60]">Front Counter Flow</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
            Start every order with a clean cashier sign-in.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#c5c5c5]">
            Tap once to begin, sign in with a cashier ID, and move into a faster menu layout built for counter sales.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={onMakeSale} className="inline-flex items-center gap-3 rounded-[24px] bg-[#f6b100] px-8 py-5 text-base font-bold text-black hover:bg-[#d7a006]">
              Make a Sale
              <FiArrowRight size={18} />
            </button>
            <div className="inline-flex items-center gap-3 rounded-[24px] border border-[#333] bg-[#171717]/85 px-5 py-5 text-sm text-[#d7d7d7]">
              <FiUsers className="text-[#f6b100]" size={18} />
              6 cashier logins ready
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[30px] border border-[#2f2f2f] bg-[#181818]/90 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7b7b7b]">Process</p>
            <div className="mt-5 grid gap-4">
              {[
                'Tap "Make a Sale"',
                'Cashier signs in with ID and password',
                'Open the improved POS menu and begin checkout',
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-[22px] border border-[#2b2b2b] bg-[#121212] px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6b100] font-bold text-black">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-[#2f2f2f] bg-[#181818]/90 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#777]">Security</p>
              <h2 className="mt-3 text-xl font-bold text-white">Cashier sign-off</h2>
              <p className="mt-2 text-sm leading-6 text-[#b4b4b4]">
                Each sale begins with a cashier login so the till starts with the right person.
              </p>
            </div>
            <div className="rounded-[26px] border border-[#2f2f2f] bg-[#181818]/90 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#777]">Interface</p>
              <h2 className="mt-3 text-xl font-bold text-white">Built for speed</h2>
              <p className="mt-2 text-sm leading-6 text-[#b4b4b4]">
                Larger product cards, live totals, and a dedicated ticket panel make the page feel like a proper POS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </section>
);

const Menu = () => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [saleStarted, setSaleStarted] = useState(false);
  const [cashierForm, setCashierForm] = useState({ id: '', password: '' });
  const [cashierError, setCashierError] = useState('');
  const [activeCashier, setActiveCashier] = useState(null);
  const [now, setNow] = useState(new Date());
  const cartCount = useSelector(selectCartCount);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const isAdmin = useSelector(selectIsAdmin);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAll({ isSellable: true });
      const items = (response.data.items || []).map((item) => ({
        _id: item._id,
        id: item._id,
        name: item.name,
        category: item.category || 'Snacks',
        price: item.price,
        costPrice: item.costPrice || 0,
        description: item.description || '',
        image: item.image || null,
        popular: Number(item.stock || 0) > 15,
        stock: item.stock || 0,
        reorderLevel: item.reorderLevel || 10,
        isSellable: item.isSellable !== false,
      }));
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (item) => {
    setEditingProduct(item);
    setShowEditProductModal(true);
  };

  const handleEditProductClose = () => {
    setShowEditProductModal(false);
    setEditingProduct(null);
  };

  const handleCashierInputChange = (event) => {
    const { name, value } = event.target;
    setCashierForm((current) => ({
      ...current,
      [name]: name === 'id' ? value.toUpperCase().trimStart() : value.trimStart(),
    }));
    setCashierError('');
  };

  const handleCashierLogin = (event) => {
    event.preventDefault();

    const cashier = CASHIERS.find(
      (entry) =>
        entry.id === cashierForm.id.trim().toUpperCase() &&
        entry.password === cashierForm.password.trim()
    );

    if (!cashier) {
      setCashierError('Invalid cashier ID or password. Use one of the six cashier logins shown.');
      return;
    }

    setActiveCashier(cashier);
    setSaleStarted(true);
    setLoginOpen(false);
    setCashierForm({ id: '', password: '' });
    setCashierError('');
  };

  const handleEndSaleAccess = () => {
    setSaleStarted(false);
    setActiveCashier(null);
    setCartOpen(false);
    dispatch(clearCart());
  };

  const filtered = useMemo(
    () =>
      menuItems.filter((item) => {
        const matchCat = activeCategory === 'All' || item.category === activeCategory;
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch && item.isSellable;
      }),
    [activeCategory, menuItems, search]
  );

  const categorySummary = useMemo(
    () =>
      menuCategories
        .filter((category) => category !== 'All')
        .map((category) => ({
          category,
          count: menuItems.filter((item) => item.category === category && item.isSellable).length,
        }))
        .filter((item) => item.count > 0),
    [menuItems]
  );

  const availableStock = filtered.reduce((sum, item) => sum + Number(item.stock || 0), 0);

  if (!saleStarted) {
    return (
      <>
        <SaleLaunchScreen onMakeSale={() => setLoginOpen(true)} />
        {loginOpen && (
          <CashierLoginModal
            form={cashierForm}
            error={cashierError}
            onChange={handleCashierInputChange}
            onClose={() => {
              setLoginOpen(false);
              setCashierError('');
            }}
            onSubmit={handleCashierLogin}
          />
        )}
      </>
    );
  }

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#131313,#191919)] pb-16 text-white">
      <div className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-[#2e2e2e] bg-[radial-gradient(circle_at_top_left,_rgba(246,177,0,0.07),_transparent_24%),linear-gradient(180deg,#1d1d1d,#141414)] p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-[#2c2c2c] pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <BackButton />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f8f8f]">POS Sales Menu</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Counter Sales Workspace</h1>
                <p className="mt-2 text-sm text-[#b3b3b3]">
                  Logged in as <span className="font-semibold text-[#f6b100]">{activeCashier?.name}</span> ({activeCashier?.id}).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[#2e2e2e] bg-[#151515] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#767676]">Business Date</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {now.toLocaleDateString('en-ZA', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="rounded-2xl border border-[#2e2e2e] bg-[#151515] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#767676]">Time</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                  <FiClock size={14} className="text-[#f6b100]" />
                  {now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddProductModal(true)} className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700">
                  Add Product
                </button>
              )}
              <button onClick={handleEndSaleAccess} className="rounded-2xl border border-[#474747] px-4 py-3 text-sm font-semibold text-[#d0d0d0] hover:border-[#6a6a6a] hover:text-white">
                End Sale Access
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-[26px] border border-[#2d2d2d] bg-[#171717] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#787878]">Products Shown</p>
              <p className="mt-3 text-3xl font-black text-white">{filtered.length}</p>
              <p className="mt-2 text-sm text-[#9a9a9a]">Filtered by category and search.</p>
            </div>
            <div className="rounded-[26px] border border-[#2d2d2d] bg-[#171717] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#787878]">Live Ticket</p>
              <p className="mt-3 text-3xl font-black text-[#f6b100]">{formatCurrency(cartTotal)}</p>
              <p className="mt-2 text-sm text-[#9a9a9a]">{cartCount} item(s) currently in the order.</p>
            </div>
            <div className="rounded-[26px] border border-[#2d2d2d] bg-[#171717] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#787878]">Categories</p>
              <p className="mt-3 text-3xl font-black text-white">{categorySummary.length}</p>
              <p className="mt-2 text-sm text-[#9a9a9a]">Quick access across your sellable ranges.</p>
            </div>
            <div className="rounded-[26px] border border-[#2d2d2d] bg-[#171717] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#787878]">Units Available</p>
              <p className="mt-3 text-3xl font-black text-white">{availableStock}</p>
              <p className="mt-2 text-sm text-[#9a9a9a]">Total stock in the current product view.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
            <div className="min-w-0">
              <div className="rounded-[30px] border border-[#2e2e2e] bg-[#151515] p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-3 rounded-[22px] border border-[#2d2d2d] bg-[#101010] px-4 py-3 xl:min-w-[360px]">
                    <FiSearch className="text-[#7d7d7d]" size={18} />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search products, drinks, desserts..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#5d5d5d]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#2d2d2d] bg-[#101010] px-4 py-3 text-sm text-[#d6d6d6]">
                      <FiGrid size={16} className="text-[#f6b100]" />
                      {menuItems.length} sellable products loaded
                    </div>
                    <button onClick={() => setCartOpen(true)} className="relative rounded-2xl bg-[#f6b100] px-4 py-3 text-sm font-bold text-black hover:bg-[#d49a00]">
                      Open Cart
                      {cartItems.length > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-[#f6b100]">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
                  {menuCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                        activeCategory === category
                          ? 'bg-[#f6b100] text-black'
                          : 'border border-[#2f2f2f] bg-[#121212] text-[#b4b4b4] hover:border-[#4b4024] hover:text-white'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {categorySummary.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {categorySummary.map(({ category, count }) => (
                      <div key={category} className="min-w-[150px] rounded-[22px] border border-[#2b2b2b] bg-[#111111] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#707070]">{category}</p>
                        <p className="mt-2 text-lg font-bold text-white">{count} items</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 min-h-[540px] rounded-[30px] border border-[#2e2e2e] bg-[#151515] p-4 sm:p-5">
                {loading ? (
                  <div className="flex h-[480px] items-center justify-center text-[#ababab]">Loading menu...</div>
                ) : filtered.length === 0 ? (
                  <div className="flex h-[480px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#343434] bg-[#121212] px-6 text-center">
                    <FiSearch size={34} className="text-[#555]" />
                    <p className="mt-4 text-lg font-semibold text-white">No matching products found</p>
                    <p className="mt-2 max-w-md text-sm text-[#838383]">
                      Try another category or adjust the search term to find sellable stock.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {filtered.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onProductDeleted={fetchMenuItems}
                        onProductEdit={handleEditProduct}
                        canManageProducts={isAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:sticky xl:top-4 xl:h-[calc(100vh-7rem)]">
              <OrderSummary cashier={activeCashier} onOpenCart={() => setCartOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {isAdmin && (
        <AddProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          categories={menuCategories}
          onProductAdded={fetchMenuItems}
        />
      )}
      {isAdmin && (
        <EditProductModal
          isOpen={showEditProductModal}
          onClose={handleEditProductClose}
          product={editingProduct}
          categories={menuCategories}
          onProductUpdated={fetchMenuItems}
        />
      )}
    </section>
  );
};

export default Menu;
