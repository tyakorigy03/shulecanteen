import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchase } from '../context/PurchaseContext';
import { HiOutlineTag, HiOutlineUserGroup, HiOutlineCreditCard, HiOutlineCheckCircle, HiPhone, HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineMail } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const PurchaseCheckoutPage = () => {
    const navigate = useNavigate();
    const { user, school } = useAuth();
    const { purchaseItems, totalAmount, clearPurchase } = usePurchase();

    // Form States
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [momoNumber, setMomoNumber] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('Home School');
    const [groupedBySupplier, setGroupedBySupplier] = useState({});
    const [loading, setLoading] = useState(false);

    // Group items by supplier when purchaseItems changes
    useEffect(() => {
        const grouped = {};
        purchaseItems.forEach(item => {
            const supplierId = item.supplierId || item.supplier?.id || 'unknown';
            const supplierName = item.supplier?.name || item.supplierName || 'Supplier';
            const supplierLogo = item.supplier?.logo || '';
            const supplierPhone = item.supplier?.phone || '';
            const supplierEmail = item.supplier?.email || '';
            const supplierLocation = item.supplier?.location || '';
            
            if (!grouped[supplierId]) {
                grouped[supplierId] = {
                    supplierId: supplierId,
                    supplierName: supplierName,
                    supplierLogo: supplierLogo,
                    supplierPhone: supplierPhone,
                    supplierEmail: supplierEmail,
                    supplierLocation: supplierLocation,
                    items: [],
                    totalAmount: 0
                };
            }
            grouped[supplierId].items.push(item);
            grouped[supplierId].totalAmount += item.price * item.quantity;
        });
        setGroupedBySupplier(grouped);
    }, [purchaseItems]);

   // In your PurchaseCheckoutPage, when completing, just navigate with data - DON'T save to Firestore yet
    const handleComplete = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
        // Navigate to confirmation with order data - don't save to Firestore yet
        navigate('/purchases/confirm', { 
            state: { 
                orders: Object.values(groupedBySupplier).map(group => ({
                    supplierId: group.supplierId,
                    supplierName: group.supplierName,
                    supplierPhone: group.supplierPhone,
                    supplierEmail: group.supplierEmail,
                    supplierLocation: group.supplierLocation,
                    items: group.items,
                    total: group.totalAmount,
                    paymentMethod: paymentMethod,
                    momoNumber: paymentMethod === 'MoMo' ? momoNumber : null,
                    deliveryLocation: deliveryLocation
                })),
                totalAmount: totalAmount,
                supplierCount: Object.keys(groupedBySupplier).length,
                school: school,
                paymentMethod: paymentMethod,
                momoNumber: paymentMethod === 'MoMo' ? momoNumber : null,
                deliveryLocation: deliveryLocation
            } 
        });
        
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to proceed. Please try again.");
    } finally {
        setLoading(false);
    }
};

    const getLogisticsOptions = () => {
        return [
            { 
                id: 'Home School', 
                label: school?.schoolName || 'School Premises', 
                sub: school?.location || school?.address || 'Deliver to school address',
                icon: <HiOutlineHome /> 
            },
            { 
                id: 'Supplier Pickup', 
                label: 'Supplier Pickup', 
                sub: 'Pick up from supplier location', 
                icon: <HiOutlineTruck /> 
            }
        ];
    };

    if (purchaseItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <HiOutlineTag className="text-3xl text-slate-200" />
                </div>
                <h2 className="text-navblue font-black text-lg">Order List Empty</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Add items to restock inventory.</p>
                <button
                    onClick={() => navigate('/purchases/new')}
                    className="bg-navblue text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-navblue/10 active:scale-95 transition-all mt-4"
                >
                    Back to Catalog
                </button>
            </div>
        );
    }

    const supplierCount = Object.keys(groupedBySupplier).length;

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-4">
            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* School Info Card */}
                {school && (
                    <div className="bg-gradient-to-r from-navblue to-navblue/90 p-4 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                <HiOutlineOfficeBuilding className="text-white text-xl" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white/60 text-[8px] font-black uppercase tracking-widest">School / Institution</p>
                                <h3 className="text-white font-bold text-base">{school.schoolName || school.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <HiOutlineLocationMarker className="text-white/40 text-[10px]" />
                                    <p className="text-white/60 text-[9px] font-medium">{school.location || school.address || 'Location not set'}</p>
                                </div>
                                <p className="text-white/40 text-[8px] font-mono mt-1">Code: {school.schoolCode || school.code}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                <div className="bg-navblue p-6 rounded-2xl shadow-xl flex flex-col items-center">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Total Procurement Cost</p>
                    <h2 className="text-white text-3xl font-black">RWF {totalAmount.toLocaleString()}</h2>
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">
                        {supplierCount} {supplierCount === 1 ? 'Supplier' : 'Suppliers'}
                    </p>
                </div>

                {/* Items Grouped by Supplier */}
                <div className="space-y-4">
                    <h3 className="text-navblue/40 font-black text-[9px] uppercase tracking-widest ml-2">Order Review by Supplier</h3>
                    
                    {Object.values(groupedBySupplier).map((supplierGroup) => (
                        <div key={supplierGroup.supplierId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Supplier Header */}
                            <div className="bg-slate-50 p-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-shuleamber/10 flex items-center justify-center">
                                        <HiOutlineUserGroup className="text-shuleamber text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-navblue font-bold text-sm">{supplierGroup.supplierName}</h4>
                                        {supplierGroup.supplierLocation && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <HiOutlineLocationMarker className="text-slate-400 text-[8px]" />
                                                <p className="text-[8px] text-slate-400">{supplierGroup.supplierLocation}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-shuleamber font-black text-sm">RWF {supplierGroup.totalAmount.toLocaleString()}</p>
                                        <p className="text-[9px] text-slate-400">{supplierGroup.items.length} items</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Supplier Items */}
                            <div className="divide-y divide-slate-50">
                                {supplierGroup.items.map((item) => (
                                    <div key={item.id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                                                <HiOutlineTag className="text-sm" />
                                            </div>
                                            <div>
                                                <span className="text-navblue font-bold text-xs">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] text-slate-400">x{item.quantity} {item.unit || 'units'}</p>
                                                    {item.category && (
                                                        <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                                                            {item.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-navblue font-bold text-xs">RWF {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Delivery & Payment Form */}
                <div className="space-y-3">
                    <h3 className="text-navblue/40 font-black text-[9px] uppercase tracking-widest ml-2">Delivery & Payment</h3>
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                        {/* Delivery Location Section */}
                        <div className="space-y-2.5">
                            <label className="text-navblue/40 text-[9px] font-black uppercase tracking-widest ml-2">Delivery Location</label>
                            <div className="space-y-2">
                                {getLogisticsOptions().map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setDeliveryLocation(opt.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${deliveryLocation === opt.id
                                            ? 'bg-slate-50 border-shuleamber shadow-inner'
                                            : 'bg-white border-slate-100 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${deliveryLocation === opt.id ? 'bg-shuleamber/10 text-shuleamber' : 'bg-slate-50 text-slate-300'}`}>
                                                {opt.icon}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className={`text-[12px] font-black ${deliveryLocation === opt.id ? 'text-navblue' : 'text-slate-400'}`}>{opt.label}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">{opt.sub}</span>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryLocation === opt.id ? 'border-shuleamber' : 'border-slate-100'}`}>
                                            {deliveryLocation === opt.id && <div className="w-2.5 h-2.5 bg-shuleamber rounded-full"></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2.5">
                            <label className="text-navblue/40 text-[9px] font-black uppercase tracking-widest ml-2">Payment Method</label>
                            <div className="space-y-2">
                                {[
                                    { id: 'Cash', label: 'Pay with Cash', icon: <HiOutlineCreditCard className="text-lg" />, sub: 'Instant settlement' },
                                    { id: 'MoMo', label: 'MTN Mobile Money', image: '/mtn_logo.png', sub: '*182# Payment' }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${paymentMethod === method.id
                                            ? 'bg-navblue border-navblue shadow-lg shadow-navblue/10 scale-[1.02]'
                                            : 'bg-slate-50 border-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden transition-colors ${paymentMethod === method.id ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                                                {method.image ? (
                                                    <img src={method.image} alt={method.id} className="w-11 h-11 object-contain" />
                                                ) : (
                                                    <div className={paymentMethod === method.id ? 'text-white' : 'text-navblue/30'}>
                                                        {method.icon}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className={`text-[12px] font-black tracking-tight ${paymentMethod === method.id ? 'text-white' : 'text-navblue'}`}>
                                                    {method.label}
                                                </span>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${paymentMethod === method.id ? 'text-white/40' : 'text-slate-400'}`}>
                                                    {method.sub}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${paymentMethod === method.id
                                            ? 'bg-shuleamber border-white/20'
                                            : 'bg-white border-slate-100'
                                        }`}>
                                            {paymentMethod === method.id && (
                                                <div className="w-2 h-2 bg-navblue rounded-full shadow-inner animate-in zoom-in duration-300"></div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MoMo Number Input */}
                        {paymentMethod === 'MoMo' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-navblue/40 text-[9px] font-black uppercase tracking-widest ml-2">MoMo Phone Number</label>
                                <div className="relative">
                                    <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="tel"
                                        placeholder="078... or 079..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-navblue text-xs font-bold focus:outline-none focus:border-shuleamber transition-all"
                                        value={momoNumber}
                                        onChange={(e) => setMomoNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Complete Action Button */}
                <div className="pt-8 pb-12">
                    <button
                        onClick={handleComplete}
                        disabled={loading || (paymentMethod === 'MoMo' && !momoNumber)}
                        className={`w-full py-4.5 rounded-xl flex items-center justify-center space-x-3 transition-all active:scale-95 ${(!loading && !(paymentMethod === 'MoMo' && !momoNumber))
                            ? 'bg-shuleamber text-navblue shadow-lg shadow-shuleamber/20'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                <span className="text-[11px] font-black uppercase tracking-widest">Processing Orders...</span>
                            </>
                        ) : (
                            <>
                                <HiOutlineCheckCircle className="text-lg" />
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    Place Order with {supplierCount} {supplierCount === 1 ? 'Supplier' : 'Suppliers'}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseCheckoutPage;