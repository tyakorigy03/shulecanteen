import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineTruck,
    HiOutlineFilter,
    HiOutlinePhone,
    HiOutlineLocationMarker
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const DeliveriesPage = () => {
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 8;

    const supplierId = user?.supplierId || supplier?.id;

    useEffect(() => {
        if (!supplierId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'deliveries'),
            where('supplierId', '==', supplierId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dispatchDateFormatted: doc.data().dispatchDate?.toDate().toLocaleDateString() || 'N/A'
            }));
            setDeliveries(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching deliveries:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [supplierId]);

    const filteredDeliveries = deliveries.filter(delivery =>
        (delivery.driverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (delivery.deliveryCode || delivery.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.orderIds?.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'in_transit': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'assigned': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-white/10 text-white/40 border-white/10';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'delivered': return 'Delivered';
            case 'in_transit': return 'In Transit';
            case 'assigned': return 'Assigned';
            default: return status || 'Unknown';
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                        <HiOutlineTruck className="w-6 h-6 text-shuleamber" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black italic">Live <span className="text-shuleamber">Deliveries</span></h2>
                        <p className="text-[10px] sm:text-sm opacity-40 uppercase tracking-widest font-bold">Transit monitoring and logistics</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    <Link to="/deliveries/new" className="flex-1 lg:flex-none justify-center bg-shuleamber text-navblue px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-shuleamber/20">
                        <HiOutlineTruck className="w-4 h-4" />
                        <span>Dispatch New Bundle</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 sm:p-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                    <span className="text-[10px] font-black text-navblue/30 uppercase tracking-widest">Tracking Monitor ({filteredDeliveries.length})</span>
                    <div className="relative w-full max-w-none sm:max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/20 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by driver, ID, or order..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navblue/5 border-none rounded-xl py-2 pl-10 pr-4 text-xs text-navblue focus:ring-1 focus:ring-navblue transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {filteredDeliveries.length === 0 ? (
                        <div className="p-10 flex flex-col items-center text-center">
                            <img src="https://shulecantine.babyeyi.rw/cantine/empty_inventory.png" alt="No Deliveries" className="w-40 opacity-90 mb-5" />
                            <p className="text-slate-400 italic mb-2">No deliveries found.</p>
                            <Link to="/deliveries/new" className="text-shuleamber text-sm underline">Create your first dispatch</Link>
                        </div>
                    ) : (
                        <table className="w-full text-left text-navblue text-xs relative">
                            <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-widest text-navblue/40 font-black">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Delivery Info</th>
                                    <th className="hidden sm:table-cell px-6 py-4">Driver</th>
                                    <th className="hidden md:table-cell px-6 py-4">Orders</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Status</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedDeliveries.map(delivery => (
                                    <tr key={delivery.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => navigate(`/deliveries/${delivery.id}`)}
                                                    className="font-black text-navblue hover:text-shuleamber transition-colors italic text-[11px] sm:text-sm text-left"
                                                >
                                                    {delivery.deliveryCode || delivery.id}
                                                </button>
                                                <span className="font-bold text-[10px] sm:text-xs leading-tight">
                                                    {delivery.orders?.[0]?.school || 'Multiple destinations'}
                                                </span>
                                                <span className="sm:hidden text-[9px] opacity-40 font-medium">
                                                    {delivery.driverName} • {delivery.orderIds?.length || 0} Orders
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{delivery.driverName}</span>
                                                <span className="text-[9px] opacity-40">{delivery.driverPhone}</span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {delivery.orderIds?.slice(0, 3).map(orderId => (
                                                    <span key={orderId} className="bg-navblue/5 text-[8px] font-black px-1.5 py-0.5 rounded border border-navblue/5">
                                                        {orderId.slice(-8)}
                                                    </span>
                                                ))}
                                                {delivery.orderIds?.length > 3 && (
                                                    <span className="text-[8px] text-gray-400">+{delivery.orderIds.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(delivery.status)}`}>
                                                {getStatusLabel(delivery.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => toggleMenu(delivery.id)}
                                                className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                            >
                                                <HiOutlineDotsVertical className="w-5 h-5" />
                                            </button>

                                            {openMenuId === delivery.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                    <div className="absolute right-6 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20">
                                                        <button
                                                            onClick={() => navigate(`/deliveries/${delivery.id}`)}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                        >
                                                            Review Details
                                                        </button>
                                                        <button
                                                            onClick={() => window.location.href = `tel:${delivery.driverPhone}`}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                        >
                                                            Call Driver
                                                        </button>
                                                        {delivery.status === 'in_transit' && (
                                                            <button
                                                                onClick={() => navigate(`/deliveries/${delivery.id}/track`)}
                                                                className="w-full text-left px-4 py-2.5 text-[10px] font-black text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                            >
                                                                Track Live
                                                            </button>
                                                        )}
                                                        <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>
                                                        <button className="w-full text-left px-4 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest">
                                                            Cancel Dispatch
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Pagination */}
                {filteredDeliveries.length > 0 && (
                    <div className="p-5 border-t border-gray-50 flex justify-between items-center bg-white">
                        <span className="text-[10px] text-navblue/30 font-black uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-navblue/5 text-navblue hover:bg-navblue/10'}`}
                            >
                                <HiOutlineChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-navblue/5 text-navblue hover:bg-navblue/10'}`}
                            >
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveriesPage;