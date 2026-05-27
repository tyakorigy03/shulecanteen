import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineFilter,
    HiOutlineShoppingCart
} from 'react-icons/hi';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState(null);
    const itemsPerPage = 8;

    const orders = [
        { id: 'ORD-2931', school: 'GS Kigali Canteen', date: '21 May 2026', items: 4, total: '124,000', status: 'In Processing' },
        { id: 'ORD-2930', school: 'Riviera High School', date: '21 May 2026', items: 2, total: '45,600', status: 'Ready for Pickup' },
        { id: 'ORD-2929', school: 'Green Hills Academy', date: '20 May 2026', items: 12, total: '340,000', status: 'Pending Approval' },
        { id: 'ORD-2928', school: 'White Dove Girls', date: '20 May 2026', items: 5, total: '89,000', status: 'In Processing' },
        { id: 'ORD-2927', school: 'Lycee de Kigali', date: '19 May 2026', items: 8, total: '210,000', status: 'Delivered' },
        { id: 'ORD-2926', school: 'Kalyan Academy', date: '19 May 2026', items: 3, total: '56,200', status: 'Delivered' },
        { id: 'ORD-2925', school: 'Pathways Int.', date: '18 May 2026', items: 6, total: '112,000', status: 'Cancelled' },
        { id: 'ORD-2924', school: 'Nu-Vision High', date: '18 May 2026', items: 10, total: '280,000', status: 'Delivered' },
    ];

    const filteredOrders = orders.filter(order => {
        const search = searchTerm.toLowerCase();
        const schoolMatch = (order.school || '').toLowerCase().includes(search);
        const idMatch = (order.id || '').toLowerCase().includes(search);
        return schoolMatch || idMatch;
    });

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-500 bg-green-50';
            case 'Ready for Pickup': return 'text-blue-500 bg-blue-50';
            case 'In Processing': return 'text-amber-500 bg-amber-50';
            case 'Pending Approval': return 'text-blue-400 bg-blue-50';
            case 'Cancelled': return 'text-red-500 bg-red-50';
            default: return 'text-navblue/40 bg-navblue/5';
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Supply <span className="text-shuleamber">Orders</span></h2>
                    <p className="text-sm opacity-60 mt-1">Manage incoming supply requests from regional schools</p>
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
                            {paginatedOrders.map(order => (
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
                                                <span className="text-[10px] opacity-60 font-medium leading-tight">{order.school}</span>
                                                <span className="text-[8px] opacity-40 uppercase tracking-widest">{order.date}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{order.school}</span>
                                            <span className="text-[9px] opacity-40 uppercase tracking-widest">{order.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 font-black text-[11px] sm:text-xs">{order.total}</td>
                                    <td className="px-4 sm:px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleMenu(order.id)}
                                            className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                        >
                                            <HiOutlineDotsVertical className="w-4 h-4" />
                                        </button>

                                        {openMenuId === order.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setOpenMenuId(null)}
                                                ></div>
                                                <div className="absolute right-6 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.id}`)}
                                                        className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                    >
                                                        Details
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest">
                                                        Process Order
                                                    </button>
                                                    <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>
                                                    <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest">
                                                        Cancel Order
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
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
            </div>
        </div>
    );
};

export default OrdersPage;
