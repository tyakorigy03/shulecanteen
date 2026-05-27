import { useState, useEffect } from 'react';
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineChartBar } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ReportsPage = () => {
    const { user } = useAuth();
    const [salesData, setSalesData] = useState({ total: 0, items: [] });
    const [purchaseData, setPurchaseData] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const canteenId = user.id || user.uid;

        // Listen to Sales
        const qSales = query(collection(db, 'sales'), where('canteenId', '==', canteenId));
        const unsubscribeSales = onSnapshot(qSales, (snap) => {
            let total = 0;
            const itemCounts = {};
            snap.forEach(doc => {
                const data = doc.data();
                total += data.totalAmount || 0;
                (data.items || []).forEach(item => {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
                });
            });
            const topItems = Object.entries(itemCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name]) => name);

            setSalesData({ total, items: topItems });
        });

        // Listen to Purchases
        const qPurchases = query(collection(db, 'purchase_orders'), where('canteenId', '==', canteenId), where('status', '==', 'delivered'));
        const unsubscribePurchases = onSnapshot(qPurchases, (snap) => {
            let total = 0;
            snap.forEach(doc => {
                total += doc.data().total || 0;
            });
            setPurchaseData({ total });
            setLoading(false);
        });

        return () => {
            unsubscribeSales();
            unsubscribePurchases();
        };
    }, [user]);

    const stats = [
        { label: 'Total Sales', value: `RWF ${salesData.total.toLocaleString()}`, trend: 'up', color: 'text-green-500' },
        { label: 'Purchases', value: `RWF ${purchaseData.total.toLocaleString()}`, trend: 'down', color: 'text-red-500' },
        { label: 'Net Profit', value: `RWF ${(salesData.total - purchaseData.total).toLocaleString()}`, trend: 'up', color: 'text-shuleamber' },
    ];

    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="px-4 pt-2 pb-20 space-y-6">
            <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-navblue font-black text-lg uppercase tracking-tight">Performance Reports</h2>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{currentMonth}</span>
                </div>

                {/* Stat Cards */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 italic">Calculating statistics...</div>
                    ) : (
                        stats.map((stat, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                            {stat.trend === 'up' ? <HiOutlineTrendingUp className={stat.color} /> : <HiOutlineTrendingDown className={stat.color} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-navblue font-bold text-base leading-tight">{stat.label}</span>
                                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider italic">Real-time performance</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-base font-black text-navblue">{stat.value}</span>
                                    </div>
                                </div>
                                {index < stats.length - 1 && (
                                    <div className="mx-4 border-b border-slate-100"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <h3 className="text-navblue font-black text-sm uppercase tracking-widest mb-3 ml-2">Top Selling</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {salesData.items.length > 0 ? (
                        salesData.items.map((name, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <span className="text-slate-300 font-black italic">{idx + 1}</span>
                                    <span className="text-navblue font-bold text-sm">{name}</span>
                                </div>
                                <HiOutlineChartBar className="text-slate-200" />
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400 italic">No sales recorded yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
