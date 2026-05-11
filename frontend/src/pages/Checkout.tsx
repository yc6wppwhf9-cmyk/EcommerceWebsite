import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../constants/products';
import { motion } from 'motion/react';
import { api } from '../lib/api';

declare const Razorpay: any;

const THEME_ACCENT: Record<string, string> = {
  premium: '#000000',
  junior: '#F69245',
  default: '#26B3FF',
};

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const themeKey = searchParams.get('theme') || sessionStorage.getItem('siteTheme') || 'default';
  const accent = THEME_ACCENT[themeKey] ?? THEME_ACCENT.default;

  const { items, total, clearCart, showToast } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthMode, user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [touched, setTouched] = useState<Record<string,boolean>>({});

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || (user as any).phone || '',
      }));
    }
  }, [user]);

  const SHIPPING_THRESHOLD = Number(import.meta.env.VITE_SHIPPING_THRESHOLD ?? 1499);
  const SHIPPING_FEE = Number(import.meta.env.VITE_SHIPPING_FEE ?? 99);
  const shipping = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shipping;

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      showToast('Please fill all required delivery details.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentTimeout = setTimeout(() => {
        setIsProcessing(false);
        showToast('Payment is taking longer than expected. Please try again.', 'error');
      }, 15000);

      let orderData: any;
      try {
        orderData = await api.createPaymentOrder(grandTotal, `receipt_${Date.now()}`);
      } finally {
        clearTimeout(paymentTimeout);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Priority Bags',
        description: 'Elite Travel Gear Checkout',
        image: '/Priority Logo-02.png',
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const savedOrder = await api.createOrder({
              items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
              shipping_name: form.name,
              shipping_phone: form.phone,
              shipping_line1: form.line1,
              shipping_line2: form.line2 || undefined,
              shipping_city: form.city,
              shipping_state: form.state,
              shipping_pincode: form.pincode,
              payment_method: 'online',
              payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setOrderId(savedOrder?.id || savedOrder?.order_id || response.razorpay_order_id);
            clearCart();
            setIsProcessing(false);
            setOrderPlaced(true);
          } catch (err: any) {
            showToast('Payment verification failed: ' + (err.message || 'Please contact support.'), 'error');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#000000' },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        showToast('Payment Failed: ' + response.error.description, 'error');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Could not initiate payment. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const updateField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const isFormValid = !!(form.name && form.email && form.phone && form.line1 && form.city && form.state && form.pincode);

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-32 text-center max-w-md font-outfit">
        <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Login Required</h1>
        <p className="text-gray-400 mb-12 font-bold uppercase tracking-widest text-[11px] leading-loose">Please sign in to your priority account to continue with your premium order and secure your points.</p>
        <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="bg-priority-blue text-white font-black text-[11px] px-12 py-5 rounded-2xl hover:scale-105 transition-all tracking-[0.2em] uppercase shadow-2xl shadow-priority-blue/20">SIGN IN NOW</button>
      </main>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="container mx-auto px-4 py-32 text-center font-outfit">
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Your cart is empty</h1>
        <p className="text-gray-400 mb-12 font-bold uppercase tracking-widest text-[11px]">Please add some products before checking out.</p>
        <Link to="/" className="bg-priority-blue text-white font-black text-[11px] px-12 py-5 rounded-2xl hover:scale-105 transition-all tracking-[0.2em] uppercase shadow-2xl shadow-priority-blue/20 inline-block mt-8">CONTINUE SHOPPING</Link>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="container mx-auto px-4 py-32 text-center max-w-lg font-outfit">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 rounded-[3rem] p-16 border border-green-100 shadow-2xl shadow-green-500/5"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl border border-green-100">
            <ShieldCheck className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-5xl font-black text-green-900 mb-6 uppercase tracking-tighter">Order Placed!</h1>
          <p className="text-green-800 font-bold mb-4 uppercase tracking-widest text-xs">Authentic Priority Gear reserved.</p>
          {orderId && (
            <p className="text-[10px] font-black text-green-700/60 uppercase tracking-widest mb-4">
              Order ID: <span className="text-green-800">{orderId}</span>
            </p>
          )}
          <p className="text-sm text-green-600/70 mb-12 font-bold uppercase tracking-widest leading-loose">We'll send you a confirmation message on WhatsApp and Email shortly. Your journey begins.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="bg-priority-blue text-white font-black text-[11px] px-12 py-5 rounded-2xl hover:scale-105 transition-all tracking-[0.2em] uppercase shadow-2xl shadow-priority-blue/20 inline-block">Continue Shopping</Link>
            <Link to="/account" className="border-2 border-green-700 text-green-800 font-black text-[11px] px-10 py-5 rounded-2xl hover:bg-green-50 transition-all tracking-[0.2em] uppercase inline-block">View My Orders</Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const fields: { label: string; field: string; type: string; placeholder: string; span: boolean; optional?: boolean; maxLength?: number; pattern?: string; inputMode?: string }[] = [
    { label: 'Full Recipient Name', field: 'name', type: 'text', placeholder: 'Name on identification', span: false },
    { label: 'Communication Email', field: 'email', type: 'email', placeholder: 'For order tracking', span: false },
    { label: 'Mobile Number', field: 'phone', type: 'tel', placeholder: '10-digit primary number', span: false, maxLength: 10, pattern: '[0-9]{10}', inputMode: 'numeric' },
    { label: 'Address Line 1', field: 'line1', type: 'text', placeholder: 'Building / Street', span: true },
    { label: 'Landmark', field: 'line2', type: 'text', placeholder: 'Optional point of reference', span: true, optional: true },
    { label: 'City Hub', field: 'city', type: 'text', placeholder: 'Metropolitan / Town', span: false },
    { label: 'State Zone', field: 'state', type: 'text', placeholder: 'Current state', span: false },
    { label: 'Postal Code', field: 'pincode', type: 'text', placeholder: '6-digit PIN', span: false, maxLength: 6, pattern: '[0-9]{6}', inputMode: 'numeric' },
  ];

  return (
    <main className="bg-white min-h-screen font-outfit pb-32">
      <nav className="border-b border-gray-100 bg-gray-50/30">
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <Link to="/" className="hover:opacity-70 transition-opacity">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900">Checkout</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 max-w-[1300px] pt-8 md:pt-16">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-20">
          <div className="lg:w-[60%] space-y-8 md:space-y-16">
            <div className="space-y-2 md:space-y-4">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]" style={{ color: accent }}>Final Step</span>
              <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase text-gray-900">Checkout</h1>
            </div>

            <section className="space-y-6 md:space-y-10">
              <div className="flex items-center gap-3 md:gap-4 border-b border-gray-100 pb-4 md:pb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center" style={{ backgroundColor: accent + '15' }}>
                  <Truck className="w-5 h-5 md:w-6 md:h-6" style={{ color: accent }} />
                </div>
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">Delivery Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {fields.map((f) => {
                  const hasError = touched[f.field] && !f.optional && !(form as any)[f.field];
                  const errorId = `checkout-${f.field}-error`;
                  return (
                    <div key={f.field} className={f.span ? 'sm:col-span-2' : ''}>
                      <label
                        htmlFor={`checkout-${f.field}`}
                        className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 md:mb-3 ml-1"
                        style={{ color: accent }}
                      >
                        {f.label}{f.optional && <span className="text-gray-400 normal-case tracking-normal ml-1">(optional)</span>}
                      </label>
                      <input
                        id={`checkout-${f.field}`}
                        {...(!f.optional && { required: true })}
                        type={f.type}
                        value={(form as any)[f.field]}
                        onChange={(e) => updateField(f.field, e.target.value)}
                        placeholder={f.placeholder}
                        maxLength={f.maxLength}
                        pattern={f.pattern}
                        inputMode={f.inputMode as any}
                        onBlur={() => setTouched(t => ({ ...t, [f.field]: true }))}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorId : undefined}
                        className={`w-full px-4 py-3.5 md:px-6 md:py-5 bg-gray-50 rounded-xl md:rounded-3xl focus:outline-none focus:ring-4 md:focus:ring-8 focus:bg-white transition-all text-sm font-bold uppercase tracking-tight placeholder:text-gray-300 ${hasError ? 'border-2 border-red-400 bg-red-50/30' : 'border border-gray-100'}`}
                      />
                      {hasError && <p id={errorId} className="text-xs text-red-500 mt-1 ml-1">This field is required</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-gray-50 rounded-2xl md:rounded-[3rem] p-6 md:p-12 border border-gray-100 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2s]">
                <CreditCard size={120} style={{ color: accent }} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6" style={{ color: accent }} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Verified Digital Payment</h3>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest max-w-lg leading-loose">
                Your transaction is protected by 256-bit encryption. We accept UPI, Cards, and Net Banking through our secure Razorpay gateway.
              </p>
            </section>
          </div>

          <aside className="lg:w-[40%]">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl md:rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/[0.03] p-6 md:p-12 space-y-6 md:space-y-10 mb-20 md:mb-0">
              <div>
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter mb-4 md:mb-8 pb-3 md:pb-4 border-b border-gray-100">Review Items</h2>
                <div className="space-y-4 md:space-y-8 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 md:gap-6 items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-gray-100 flex items-center justify-center shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-black uppercase tracking-tight text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{item.quantity} Unit(s) • {formatPrice(item.product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-5 pt-6 md:pt-10 border-t border-gray-100">
                <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between items-end pt-6 md:pt-8 mt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1" style={{ color: accent }}>Total Payable</span>
                    <span className="text-2xl md:text-4xl font-black tracking-tighter uppercase">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!isFormValid || isProcessing}
                className="w-full text-white font-black text-[10px] md:text-xs py-4 md:py-5 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 md:gap-4 hover:scale-[1.02] active:scale-98 transition-all shadow-2xl uppercase tracking-[0.15em] md:tracking-[0.2em] disabled:opacity-30 disabled:grayscale h-14 md:h-16 group"
                style={{ backgroundColor: accent }}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-[10px] md:text-xs">Opening Secure Payment...</span></>
                ) : (
                  <>Secure Pay <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 opacity-30">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Session Active</span>
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
