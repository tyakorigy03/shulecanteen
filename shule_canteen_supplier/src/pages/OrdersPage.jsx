import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineFilter,
    HiOutlineShoppingCart,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineXCircle
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const itemsPerPage = 8;

    // Get the correct supplier ID
    const supplierId = user?.supplierId || supplier?.id;

    useEffect(() => {
        if (!supplierId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'purchase_orders'),
            where('supplierId', '==', supplierId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'
            }));
            setOrders(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [supplierId]);

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const orderRef = doc(db, 'purchase_orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            setOpenMenuId(null);
            
            // If marking as shipped, navigate to dispatch page with this order
            if (newStatus === 'shipped') {
                // Find the order to pass its data
                const order = orders.find(o => o.id === orderId);
                navigate('/deliveries/new', {
                    state: {
                        preselectedOrder: {
                            id: order.id,
                            schoolName: order.schoolName || order.canteenName,
                            schoolLocation: order.schoolLocation || order.deliveryLocation,
                            contactPerson: order.orderedBy?.name,
                            contactPhone: order.orderedBy?.phone,
                            items: order.items,
                            total: order.total
                        }
                    }
                });
            } else {
                alert(`Order ${newStatus === 'approved' ? 'approved' : 'marked as ' + newStatus}`);
            }
        } catch (error) {
            console.error("Error updating order:", error);
            alert('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter(order =>
        (order.canteenName || order.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-amber-600 bg-amber-50';
            case 'approved': return 'text-blue-600 bg-blue-50';
            case 'ready': return 'text-purple-600 bg-purple-50';
            case 'shipped': return 'text-indigo-600 bg-indigo-50';
            case 'delivered': return 'text-green-600 bg-green-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-slate-400 bg-slate-50';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return { label: 'Pending', icon: null };
            case 'approved': return { label: 'Approved', icon: null };
            case 'ready': return { label: 'Ready', icon: null };
            case 'shipped': return { label: 'Shipped', icon: <HiOutlineTruck className="text-xs mr-1" /> };
            case 'delivered': return { label: 'Delivered', icon: <HiOutlineCheckCircle className="text-xs mr-1" /> };
            case 'cancelled': return { label: 'Cancelled', icon: <HiOutlineXCircle className="text-xs mr-1" /> };
            default: return { label: status, icon: null };
        }
    };

    // Get available next status based on current status
    const getNextStatusOptions = (currentStatus) => {
        switch (currentStatus) {
            case 'pending':
                return [{ status: 'approved', label: 'Approve Order' }];
            case 'approved':
                return [{ status: 'ready', label: 'Mark as Ready' }];
            case 'ready':
                return [{ status: 'shipped', label: 'Create Dispatch & Mark Shipped' }];
            default:
                return [];
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Supply <span className="text-shuleamber">Orders</span></h2>
                    <p className="text-sm opacity-60 mt-1">Manage incoming supply requests from regional schools</p>
                    {supplierId && (
                        <p className="text-[9px] opacity-40 mt-1 font-mono">Supplier ID: {supplierId}</p>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white">
                    <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest whitespace-nowrap mr-4">Recent Orders ({filteredOrders.length})</span>
                    <div className="relative w-full max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search school or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navblue/5 border-none rounded-xl py-2 pl-10 pr-4 text-xs text-navblue focus:ring-1 focus:ring-navblue transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
                            <span className="ml-3 text-navblue/40 text-sm">Loading orders...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-10 flex flex-col items-center text-center">
                            <img
                                src="https://shulecantine.babyeyi.rw/cantine/empty_inventory.png"
                                alt="No Orders"
                                className="w-40 opacity-90 mb-5"
                            />
                            <p className="text-slate-400 italic mb-2">
                                No orders found.
                            </p>
                            <p className="text-slate-300 text-xs">
                                Orders from canteens will appear here.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-navblue text-xs relative">
                            <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-bold">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Order Info</th>
                                    <th className="hidden sm:table-cell px-6 py-4">School</th>
                                    <th className="px-4 sm:px-6 py-4">Status</th>
                                    <th className="px-4 sm:px-6 py-4">Total</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedOrders.map(order => {
                                    const statusBadge = getStatusBadge(order.status);
                                    const nextOptions = getNextStatusOptions(order.status);
                                    
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.id}`)}
                                                        className="font-bold text-[11px] sm:text-xs text-navblue hover:text-shuleamber transition-colors text-left"
                                                    >
                                                        {order.id}
                                                    </button>
                                                    <div className="sm:hidden flex flex-col gap-0.5 mt-0.5">
                                                        <span className="text-[10px] opacity-60 font-medium leading-tight">{order.canteenName || order.schoolName}</span>
                                                        <span className="text-[8px] opacity-40 uppercase tracking-widest">{order.date}</span>
                                                    </div>
                                                </div>
                                             </td>
                                            <td className="hidden sm:table-cell px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{order.canteenName || order.schoolName || 'Unknown'}</span>
                                                    <span className="text-[9px] opacity-40 uppercase tracking-widest">{order.date}</span>
                                                </div>
                                             </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                    {statusBadge.icon}
                                                    {statusBadge.label}
                                                </span>
                                              </td>
                                            <td className="px-4 sm:px-6 py-4 font-black text-[11px] sm:text-xs">RWF {order.total?.toLocaleString()}  </td>
                                            <td className="px-4 sm:px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => toggleMenu(order.id)}
                                                    className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                                    disabled={updatingId === order.id}
                                                >
                                                    {updatingId === order.id ? (
                                                        <div className="w-4 h-4 border-2 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
                                                    ) : (
                                                        <HiOutlineDotsVertical className="w-4 h-4" />
                                                    )}
                                                </button>

                                                {openMenuId === order.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuId(null)}
                                                        ></div>
                                                        <div className="absolute right-6 top-10 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <button
                                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                                className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                            >
                                                                View Details
                                                            </button>
                                                            
                                                            {nextOptions.map(option => (
                                                                <button
                                                                    key={option.status}
                                                                    onClick={() => updateOrderStatus(order.id, option.status)}
                                                                    className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest flex items-center gap-2"
                                                                >
                                                                    {option.status === 'shipped' && <HiOutlineTruck className="w-3 h-3" />}
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                            
                                                            {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'shipped' && (
                                                                <>
                                                                    <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('Cancel this order?')) {
                                                                                updateOrderStatus(order.id, 'cancelled');
                                                                            }
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest"
                                                                    >
                                                                        Cancel Order
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                              </td>
                                          </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Footer */}
                {filteredOrders.length > 0 && (
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-white">
                        <span className="text-[10px] text-navblue/40 font-bold">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-navblue/5 text-navblue hover:bg-navblue/10'
                                    }`}
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-navblue text-white shadow-md'
                                        : 'bg-navblue/5 text-navblue hover:bg-navblue/10'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-navblue/5 text-navblue hover:bg-navblue/10'
                                    }`}
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;