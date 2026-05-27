import { useState, useEffect } from 'react';
import { HiOutlineEye, HiOutlineTag } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SalesPage = () => {
    const { user, school } = useAuth();
    const [activeFilter, setActiveFilter] = useState('Today');
    const [showBalance, setShowBalance] = useState(false);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const navigate = useNavigate();

    const filters = ['Today', 'Yesterday', 'Last 7 Days', 'Custom'];

    useEffect(() => {
        if (!user?.schoolCode) return;

        // Correct path: schools/{schoolCode}/sales
        const q = query(
            collection(db, 'schools', user.schoolCode, 'sales'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dateObj: doc.data().createdAt?.toDate(),
                date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A',
                time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'
            }));
            
            // Apply filter
            let filtered = items;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (activeFilter === 'Today') {
                filtered = items.filter(sale => sale.dateObj >= today);
            } else if (activeFilter === 'Yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                filtered = items.filter(sale => sale.dateObj >= yesterday && sale.dateObj < today);
            } else if (activeFilter === 'Last 7 Days') {
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                filtered = items.filter(sale => sale.dateObj >= lastWeek);
            } else if (activeFilter === 'Custom' && dateRange.start && dateRange.end) {
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                end.setHours(23, 59, 59);
                filtered = items.filter(sale => sale.dateObj >= start && sale.dateObj <= end);
            }
            
            setSalesData(filtered);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sales:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.schoolCode, activeFilter, dateRange]);

    const salesSummary = {
        totalAmount: salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
        transactionCount: salesData.length,
        averageValue: salesData.length > 0 ? salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / salesData.length : 0
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24 space-y-6 pt-4">
            {/* Sales Wallet Card */}
            <div className="px-4">
                <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-xl">
                    <div className="bg-navblue p-4 flex flex-col items-center relative">
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">
                            Total {activeFilter} Sales
                        </p>
                        <div className="flex items-center space-x-4">
                            <h2 className="text-white text-3xl font-black">
                                RWF {showBalance ? (
                                    <span>{salesSummary.totalAmount.toLocaleString()}</span>
                                ) : (
                                    <span className="text-xl align-middle -mt-1 ml-1 opacity-40">********</span>
                                )}
                            </h2>
                            <button
                                onClick={() => setShowBalance(!showBalance)}
                                className="text-shuleamber hover:scale-110 transition-transform"
                            >
                                <HiOutlineEye className="text-2xl" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-[#002f5e] flex items-center divide-x divide-white/10">
                        <div className="flex-1 py-4 flex flex-col items-center space-y-0.5">
                            <span className="text-white text-lg font-black">{salesSummary.transactionCount}</span>
                            <span className="text-white text-sm">Transactions</span>
                        </div>
                        <div className="flex-1 py-4 flex flex-col items-center space-y-0.5">
                            <span className="text-white text-lg font-black">RWF {Math.round(salesSummary.averageValue).toLocaleString()}</span>
                            <span className="text-white text-sm">Avg. Sale</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Filters */}
            <div className="px-4">
                <div className="bg-white p-2 rounded-2xl shadow-sm flex items-center overflow-x-auto border border-slate-100">
                    <div className="flex items-center justify-between min-w-full">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-navblue text-white shadow-md'
                                    : 'text-slate-400 hover:text-navblue'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Range */}
                {activeFilter === 'Custom' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="space-y-1">
                            <label className="text-navblue/40 text-[8px] font-black uppercase tracking-widest ml-2">From</label>
                            <input
                                type="date"
                                className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-navblue text-[11px] font-bold focus:outline-none focus:border-shuleamber transition-all"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-navblue/40 text-[8px] font-black uppercase tracking-widest ml-2">To</label>
                            <input
                                type="date"
                                className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-navblue text-[11px] font-bold focus:outline-none focus:border-shuleamber transition-all"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Sales List */}
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-navblue font-black text-lg">Transaction History</h2>
                    <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{activeFilter}</span>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading transactions...</div>
                ) : salesData.length === 0 ? (
                      <div className="p-10 flex flex-col items-center text-center">
                        <img
                            src="https://shulecantine.babyeyi.rw/cantine/empty_inventory.png"
                            alt="No Purchases"
                            className="w-40 opacity-90 mb-5"
                        />
                        <p className="text-slate-400 italic mb-6">
                            No sales found.
                        </p>
                        <button
                            onClick={() => navigate('/listing')}
                            className="text-shuleamber hover:text-navblue underline text-sm"
                        >
                            + Create New sale
                        </button>
                    </div>
                ) : (
                    salesData.map((sale) => (
                        <div key={sale.id} className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden border border-slate-50">
                            <div className="p-5 pb-3">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-navblue font-black text-xs">
                                        {sale.date} | {sale.time}
                                    </span>
                                    <span className="text-shuleamber font-black text-sm">
                                        +RWF {sale.totalAmount?.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                                    {sale.studentName} • {sale.studentId}
                                </p>
                            </div>

                            <div className="p-5 pt-0 flex">
                                <div className="w-[1.5px] bg-navblue/5 rounded-full mr-5 ml-1 mt-1 mb-1"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-y-2.5">
                                        <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Txn ID:</span>
                                        <span className="text-slate-400 text-[10px] font-bold text-right">{sale.id.slice(-12)}</span>

                                        {sale.items?.map((item, idx) => (
                                            <div key={idx} className="contents">
                                                <span className="text-navblue/60 text-xs font-bold">{item.name} x{item.quantity}</span>
                                                <span className="text-navblue/40 text-xs font-bold text-right">RWF {(item.quantity * item.price).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SalesPage;