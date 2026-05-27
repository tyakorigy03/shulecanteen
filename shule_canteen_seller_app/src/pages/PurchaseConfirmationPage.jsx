import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePurchase } from '../context/PurchaseContext';
import { db } from '../config/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { HiOutlineShieldCheck, HiOutlineDeviceMobile, HiOutlineCash, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineHome, HiOutlineTag, HiOutlineUserGroup } from 'react-icons/hi';

// Helper function to generate unique order ID
// Helper function to generate unique order ID with timestamp
const generateOrderId = () => {
    const prefix = 'PO';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${timestamp}${random}`;
};

const PurchaseConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, school } = useAuth();
    const { clearPurchase } = usePurchase();

    // Get data from state
    const orders = location.state?.orders || [];
    const totalAmount = location.state?.totalAmount || 0;
    const supplierCount = location.state?.supplierCount || 0;
    const paymentMethod = location.state?.paymentMethod || 'Cash';
    const momoNumber = location.state?.momoNumber || '';
    const deliveryLocation = location.state?.deliveryLocation || 'Home School';

    const [status, setStatus] = useState('review');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isProcessing, setIsProcessing] = useState(false);

    // If no orders, redirect back to checkout
    useEffect(() => {
        if (orders.length === 0 && !location.state) {
            navigate('/purchases/checkout');
        }
    }, [orders, location, navigate]);

    const saveOrdersToFirestore = async () => {
        setIsProcessing(true);
        
        try {
            const schoolCode = user?.schoolCode || school?.schoolCode;
            if (!schoolCode) {
                throw new Error('School code not found');
            }

            const batch = writeBatch(db);
            const savedOrders = [];

            for (const order of orders) {
                // Generate unique order ID
                const orderId = generateOrderId();
                
                const orderData = {
                    // Order ID
                    id: orderId,
                    
                    // School Info
                    schoolCode: schoolCode,
                    schoolName: school?.schoolName || school?.name || user?.schoolName,
                    schoolLocation: school?.location || school?.address || '',
                    schoolPhone: school?.phone || '',
                    schoolEmail: school?.email || '',
                    
                    // Ordered By (Who placed the order)
                    orderedBy: {
                        id: user?.id || user?.uid,
                        name: user?.fullName || user?.name || 'Canteen Operator',
                        phone: user?.phone || '',
                        email: user?.email || '',
                        role: user?.role || 'operator'
                    },
                    
                    // Supplier Info
                    supplierId: order.supplierId,
                    supplierName: order.supplierName,
                    supplierPhone: order.supplierPhone || '',
                    supplierEmail: order.supplierEmail || '',
                    supplierLocation: order.supplierLocation || '',
                    
                    // Order Details
                    paymentMethod: paymentMethod,
                    momoNumber: paymentMethod === 'MoMo' ? momoNumber : null,
                    deliveryLocation: deliveryLocation,
                    total: order.total,
                    items: order.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        category: item.category || 'General',
                        unit: item.unit || 'piece',
                        productImage: item.image || ''
                    })),
                    
                    // Status
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
                
                const docRef = doc(db, 'purchase_orders', orderId);
                batch.set(docRef, orderData);
                savedOrders.push({ 
                    orderId: orderId, 
                    supplierName: order.supplierName,
                    total: order.total 
                });
            }
            
            await batch.commit();
            return savedOrders;
            
        } catch (error) {
            console.error("Error saving orders:", error);
            throw error;
        }
    };

    const handleMomoPayment = async () => {
        setStatus('processing');
        
        // Simulate MoMo payment API call
        // In production, call your MoMo API endpoint here
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 3000);
        });
    };

    const handleConfirm = async () => {
        if (paymentMethod === 'MoMo') {
            const paymentSuccess = await handleMomoPayment();
            if (paymentSuccess) {
                await completeOrder();
            }
        } else {
            await completeOrder();
        }
    };

    const completeOrder = async () => {
        try {
            const savedOrders = await saveOrdersToFirestore();
            
            setStatus('success');
            
            setTimeout(() => {
                clearPurchase();
                navigate('/purchases/receipt', {
                    state: {
                        orders: savedOrders,
                        originalOrders: orders,
                        totalAmount: totalAmount,
                        supplierCount: supplierCount,
                        school: school,
                        orderedBy: {
                            name: user?.fullName || user?.name,
                            phone: user?.phone,
                            email: user?.email
                        },
                        paymentMethod: paymentMethod,
                        momoNumber: momoNumber,
                        deliveryLocation: deliveryLocation,
                        date: new Date().toLocaleDateString(),
                        receiptId: `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
                    }
                });
            }, 1500);
            
        } catch (error) {
            console.error("Error completing order:", error);
            alert("Failed to place orders. Please try again.");
            setStatus('review');
        }
    };

    useEffect(() => {
        let timer;
        if (status === 'processing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                if (timeLeft === 22) {
                    completeOrder();
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, timeLeft]);

    if (orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading order details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">
            <div className="p-6 pt-24 max-w-lg mx-auto">
                {status === 'review' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Card */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                            <HiOutlineShieldCheck className="text-4xl text-shuleamber mb-3" />
                            <h2 className="text-navblue font-black text-xl leading-tight">Verify Order Details</h2>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">
                                {supplierCount} {supplierCount === 1 ? 'Supplier' : 'Suppliers'} • RWF {totalAmount.toLocaleString()}
                            </p>
                        </div>

                        {/* Ordered By Info - Who placed the order */}
                        {user && (
                            <div className="bg-shuleamber/5 p-4 rounded-2xl border border-shuleamber/10">
                                <p className="text-[8px] font-black uppercase tracking-widest text-shuleamber/70 mb-1">Ordered By</p>
                                <p className="text-navblue font-bold text-sm">{user?.fullName || user?.name || 'Canteen Operator'}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    {user?.phone && (
                                        <p className="text-[10px] text-navblue/60">📞 {user.phone}</p>
                                    )}
                                    {user?.email && (
                                        <p className="text-[10px] text-navblue/60">✉️ {user.email}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* School Info */}
                        {school && (school.schoolName || school.name) && (
                            <div className="bg-navblue/5 p-4 rounded-2xl border border-navblue/10">
                                <p className="text-[8px] font-black uppercase tracking-widest text-navblue/40 mb-1">Ordering Institution</p>
                                <p className="text-navblue font-bold text-sm">{school.schoolName || school.name}</p>
                                <p className="text-[10px] text-navblue/60">{school.location || school.address || 'School Canteen'}</p>
                            </div>
                        )}

                        {/* Orders Breakdown */}
                        {orders.map((order, idx) => (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-navblue/5 overflow-hidden">
                                <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineUserGroup className="text-shuleamber text-sm" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Order #{idx + 1}</span>
                                        </div>
                                        <span className="text-xs font-black text-navblue">{order.supplierName}</span>
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="space-y-3">
                                        {order.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-navblue font-bold text-sm">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400">x{item.quantity} {item.unit || 'units'}</p>
                                                </div>
                                                <p className="text-navblue font-bold">RWF {(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex justify-between">
                                        <span className="text-xs font-bold text-navblue">Subtotal</span>
                                        <span className="text-lg font-black text-navblue">RWF {order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Payment Info */}
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-navblue">Payment Method</span>
                                <span className="text-xs font-black text-shuleamber">{paymentMethod}</span>
                            </div>
                            {paymentMethod === 'MoMo' && momoNumber && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-navblue">Mobile Number</span>
                                    <span className="text-xs font-black text-navblue">{momoNumber}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                                <span className="text-xs font-bold text-navblue">Delivery Location</span>
                                <span className="text-xs font-black text-navblue">{deliveryLocation}</span>
                            </div>
                        </div>

                        {/* Total Summary */}
                        <div className="bg-shuleamber/10 p-5 rounded-3xl border border-shuleamber/20">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-navblue uppercase tracking-widest">Total Amount</span>
                                <span className="text-2xl font-black text-navblue">RWF {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="w-full py-5 bg-shuleamber text-navblue rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-shuleamber/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {paymentMethod === 'MoMo' ? 'Pay with MoMo' : 'Confirm Purchase'}
                        </button>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="flex flex-col items-center py-12 space-y-8 animate-in zoom-in duration-500">
                        <div className="relative">
                            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                                <HiOutlineDeviceMobile className="text-5xl text-navblue" />
                            </div>
                            <div className="absolute inset-0 border-4 border-navblue border-t-shuleamber rounded-full animate-spin"></div>
                        </div>

                        <div className="text-center space-y-3">
                            <h2 className="text-navblue font-black text-2xl">Confirm on Phone</h2>
                            <p className="text-slate-400 text-xs font-medium max-w-[250px] mx-auto leading-relaxed">
                                We've sent a payment request to <span className="font-bold text-navblue">{momoNumber}</span>. Please enter your PIN to complete the order.
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-navblue/30">Waiting for PIN</span>
                            <div className="text-3xl font-black text-navblue tabular-nums">00:{timeLeft.toString().padStart(2, '0')}</div>
                        </div>

                        <button
                            onClick={() => setStatus('review')}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors pt-8"
                        >
                            Cancel Transaction
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center py-20 animate-in zoom-in fade-in duration-500">
                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl shadow-[0_20px_50px_rgba(34,197,94,0.3)]">
                            <HiOutlineCheckCircle />
                        </div>
                        <h2 className="text-navblue font-black text-2xl mt-8">Orders Placed!</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Saving to database...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseConfirmationPage;