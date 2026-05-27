import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlinePrinter,
    HiOutlineTruck,
    HiOutlineLibrary,
    HiOutlineClipboardCheck,
    HiOutlineCheckCircle,
    HiOutlineXCircle
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const OrderDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, supplier } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderRef = doc(db, 'purchase_orders', id);
                const orderSnap = await getDoc(orderRef);
                
                if (orderSnap.exists()) {
                    const orderData = orderSnap.data();
                    setOrder({
                        id: orderSnap.id,
                        ...orderData,
                        date: orderData.createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'
                    });
                } else {
                    console.error('Order not found');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder();
    }, [id]);

    const updateOrderStatus = async (newStatus) => {
        if (!window.confirm(`Mark this order as ${newStatus}?`)) return;
        
        setUpdating(true);
        try {
            const orderRef = doc(db, 'purchase_orders', id);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            
            // Update local state
            setOrder(prev => ({ ...prev, status: newStatus }));
            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-500/20 text-green-500 border-green-500/20';
            case 'shipped': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
            case 'ready': return 'bg-purple-500/20 text-purple-500 border-purple-500/20';
            case 'approved': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
            case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/20';
            default: return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
        }
    };

    const getNextAction = () => {
        switch (order?.status) {
            case 'pending':
                return { label: 'Approve Order', status: 'approved', icon: null };
            case 'approved':
                return { label: 'Mark as Ready', status: 'ready', icon: null };
            case 'ready':
                return { label: 'Mark as Shipped', status: 'shipped', icon: <HiOutlineTruck className="w-4 h-4" /> };
            case 'shipped':
                return { label: 'Confirm Delivery', status: 'delivered', icon: <HiOutlineCheckCircle className="w-4 h-4" /> };
            default:
                return null;
        }
    };

    const getOrderSteps = () => {
        const steps = [
            { key: 'pending', title: 'Order Placed', time: order?.createdAt?.toDate() },
            { key: 'approved', title: 'Confirmed by Supplier', time: order?.updatedAt?.toDate() },
            { key: 'ready', title: 'Items Packaged', time: null },
            { key: 'shipped', title: 'Out for Delivery', time: null },
            { key: 'delivered', title: 'Delivered', time: null }
        ];

        const currentStepIndex = steps.findIndex(s => s.key === order?.status);
        
        return steps.map((step, idx) => ({
            ...step,
            active: idx <= currentStepIndex,
            time: step.time?.toLocaleString() || (idx === currentStepIndex ? 'In progress...' : 'Pending')
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-white/60 italic">Order not found</p>
                <button onClick={() => navigate('/orders')} className="mt-4 text-shuleamber">Back to Orders</button>
            </div>
        );
    }

    const nextAction = getNextAction();
    const orderSteps = getOrderSteps();
    const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black italic">Order <span className="text-shuleamber">{order.id}</span></h2>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-sm opacity-60">Placed on {order.date}</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none justify-center bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/20 transition-all"
                    >
                        <HiOutlinePrinter className="w-4 h-4" />
                        <span>Print</span>
                    </button>
                    {nextAction && order.status !== 'cancelled' && (
                        <button
                            onClick={() => updateOrderStatus(nextAction.status)}
                            disabled={updating}
                            className="flex-1 sm:flex-none justify-center bg-shuleamber text-navblue px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-shuleamber/20 disabled:opacity-50"
                        >
                            {updating ? (
                                <div className="w-4 h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                            ) : (
                                nextAction.icon
                            )}
                            <span>{nextAction.label}</span>
                        </button>
                    )}
                    {order.status === 'cancelled' && (
                        <span className="flex-1 sm:flex-none justify-center bg-red-500/20 text-red-400 px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2">
                            <HiOutlineXCircle className="w-4 h-4" />
                            <span>Cancelled</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-white">
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">
                                Ordered Goods ({totalItems} items)
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-navblue text-xs">
                                <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-bold">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-4">Item</th>
                                        <th className="px-4 sm:px-6 py-4">Qty</th>
                                        <th className="hidden sm:table-cell px-6 py-4">Unit Price</th>
                                        <th className="px-4 sm:px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 sm:px-6 py-4 font-bold text-[11px] sm:text-xs">{item.name}</td>
                                            <td className="px-4 sm:px-6 py-4">{item.quantity} {item.unit || 'units'}</td>
                                            <td className="hidden sm:table-cell px-6 py-4 opacity-60">RWF {item.price?.toLocaleString()}</td>
                                            <td className="px-4 sm:px-6 py-4 font-black text-right">RWF {(item.quantity * item.price)?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-navblue/[0.02] border-t border-gray-100 font-bold">
                                    <tr>
                                        <td colSpan="3" className="text-right px-4 sm:px-6 py-4 opacity-40">Subtotal</td>
                                        <td className="px-4 sm:px-6 py-4 text-right">RWF {order.total?.toLocaleString()}</td>
                                    </tr>
                                    <tr className="text-navblue">
                                        <td colSpan="3" className="text-right px-4 sm:px-6 py-6 font-black">Grand Total</td>
                                        <td className="px-4 sm:px-6 py-6 text-right font-black text-navblue underline decoration-shuleamber decoration-2 underline-offset-4">
                                            RWF {order.total?.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <HiOutlineClipboardCheck className="text-navblue/20 w-5 h-5" />
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">Order Progress</span>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                            <div className="space-y-6">
                                {orderSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 items-start relative z-10">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            step.active ? 'bg-green-500 border-green-500' : 'bg-gray-100 border-gray-200'
                                        }`}>
                                            {step.active && <HiOutlineCheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                <span className={`text-sm font-bold ${step.active ? 'text-navblue' : 'text-gray-400'}`}>
                                                    {step.title}
                                                </span>
                                                <span className={`text-[10px] font-bold ${step.active ? 'text-navblue/40' : 'text-gray-300'}`}>
                                                    {step.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="flex flex-col gap-6">
                    {/* School Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineLibrary className="text-navblue/20 w-5 h-5" />
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">Ordering Institution</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400">School Name</p>
                                <p className="text-lg font-black text-navblue">{order.schoolName || order.canteenName || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="text-sm font-bold text-navblue/60">{order.schoolLocation || order.deliveryLocation || 'Not specified'}</p>
                            </div>
                            {order.orderedBy && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">Ordered By</p>
                                    <p className="text-sm font-bold text-navblue">{order.orderedBy.name}</p>
                                    <p className="text-xs text-navblue/60">{order.orderedBy.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment & Delivery Info */}
                    <div className="bg-navblue rounded-2xl p-6 text-white">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Payment Method</p>
                                <p className="text-lg font-bold">{order.paymentMethod || 'Cash'}</p>
                                {order.momoNumber && (
                                    <p className="text-xs text-white/60">{order.momoNumber}</p>
                                )}
                            </div>
                            <div className="pt-3 border-t border-white/10">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Delivery Location</p>
                                <p className="text-sm font-bold">{order.deliveryLocation || 'School Premises'}</p>
                            </div>
                            {order.deliveryId && (
                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-[10px] font-bold text-shuleamber uppercase tracking-widest">Tracking ID</p>
                                    <p className="text-sm font-bold">{order.deliveryId}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;