import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineArrowLeft,
    HiOutlineTruck,
    HiOutlineLibrary,
    HiOutlineUser,
    HiOutlineLocationMarker,
    HiOutlinePhone,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineRefresh
} from 'react-icons/hi';

const DeliveryDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, supplier } = useAuth();
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchDelivery = async () => {
            try {
                const deliveryRef = doc(db, 'deliveries', id);
                const deliverySnap = await getDoc(deliveryRef);
                
                if (deliverySnap.exists()) {
                    const deliveryData = deliverySnap.data();
                    
                    // Fetch all orders in this delivery
                    const ordersData = [];
                    for (const orderId of deliveryData.orderIds || []) {
                        const orderRef = doc(db, 'purchase_orders', orderId);
                        const orderSnap = await getDoc(orderRef);
                        if (orderSnap.exists()) {
                            ordersData.push({
                                id: orderSnap.id,
                                ...orderSnap.data()
                            });
                        }
                    }
                    
                    setDelivery({
                        id: deliverySnap.id,
                        ...deliveryData,
                        orders: ordersData
                    });
                }
            } catch (error) {
                console.error('Error fetching delivery:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDelivery();
    }, [id]);

    const updateDeliveryStatus = async (newStatus) => {
        if (!confirm(`Mark this delivery as ${newStatus}?`)) return;
        
        setUpdating(true);
        try {
            const batch = writeBatch(db);
            
            // Update delivery
            const deliveryRef = doc(db, 'deliveries', id);
            batch.update(deliveryRef, {
                status: newStatus,
                updatedAt: serverTimestamp(),
                ...(newStatus === 'delivered' ? { deliveredAt: serverTimestamp() } : {})
            });
            
            // Update all orders in this delivery
            for (const order of delivery.orders) {
                const orderRef = doc(db, 'purchase_orders', order.id);
                batch.update(orderRef, {
                    deliveryStatus: newStatus,
                    status: newStatus === 'delivered' ? 'delivered' : 'shipped',
                    updatedAt: serverTimestamp()
                });
            }
            
            await batch.commit();
            
            // Update local state
            setDelivery(prev => ({ ...prev, status: newStatus }));
            alert(`Delivery marked as ${newStatus}`);
            
        } catch (error) {
            console.error('Error updating delivery:', error);
            alert('Failed to update delivery status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="text-center py-20">
                <p className="text-white/60 italic">Delivery not found</p>
                <button onClick={() => navigate('/deliveries')} className="mt-4 text-shuleamber">Back to Deliveries</button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'in_transit': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'assigned': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getNextAction = () => {
        switch (delivery.status) {
            case 'assigned':
                return { label: 'Start Transit', status: 'in_transit', icon: <HiOutlineTruck className="w-4 h-4" /> };
            case 'in_transit':
                return { label: 'Mark as Delivered', status: 'delivered', icon: <HiOutlineCheckCircle className="w-4 h-4" /> };
            default:
                return null;
        }
    };

    const nextAction = getNextAction();
    const totalItems = delivery.orders?.reduce((sum, order) => sum + (order.items?.length || 0), 0) || 0;

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/deliveries')}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black italic">Shipment <span className="text-shuleamber">{delivery.deliveryCode || delivery.id}</span></h2>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(delivery.status)}`}>
                                {delivery.status?.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-sm opacity-60">
                            Dispatched on {delivery.dispatchDate?.toDate?.().toLocaleDateString() || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => window.location.href = `tel:${delivery.driverPhone}`}
                        className="flex-1 sm:flex-none justify-center bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/20 transition-all"
                    >
                        <HiOutlinePhone className="w-4 h-4" />
                        <span>Call Driver</span>
                    </button>
                    {nextAction && (
                        <button
                            onClick={() => updateDeliveryStatus(nextAction.status)}
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
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Orders in this delivery */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-white">
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">
                                Orders in this Shipment ({delivery.orders?.length || 0} orders)
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {delivery.orders?.map((order, idx) => (
                                <div key={order.id} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <button
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                className="font-bold text-navblue text-sm hover:text-shuleamber transition-colors"
                                            >
                                                {order.id}
                                            </button>
                                            <p className="text-xs text-navblue/60 mt-0.5">{order.canteenName || order.schoolName}</p>
                                        </div>
                                        <span className="text-xs font-bold text-navblue">RWF {order.total?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {order.items?.slice(0, 3).map((item, itemIdx) => (
                                            <span key={itemIdx} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {item.name} x{item.quantity}
                                            </span>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <span className="text-[9px] text-gray-400">+{order.items.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Driver Info */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineUser className="text-navblue/20 w-5 h-5" />
                            <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest">Driver</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-navblue text-white flex items-center justify-center font-black text-lg">
                                {delivery.driverName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-navblue">{delivery.driverName}</p>
                                <p className="text-xs text-navblue/60">{delivery.driverPhone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Summary */}
                    <div className="bg-navblue rounded-2xl p-6 text-white">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Priority</p>
                                <p className="text-lg font-bold capitalize">{delivery.priority || 'Normal'}</p>
                            </div>
                            <div className="pt-3 border-t border-white/10">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Total Orders</p>
                                <p className="text-2xl font-bold">{delivery.orders?.length || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Total Items</p>
                                <p className="text-2xl font-bold">{totalItems}</p>
                            </div>
                            {delivery.notes && (
                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Notes</p>
                                    <p className="text-xs text-white/80 mt-1">{delivery.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDetailsPage;