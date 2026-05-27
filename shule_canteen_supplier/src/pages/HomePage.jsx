import { useState, useEffect } from 'react';
import {
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineUserGroup,
    HiOutlineTruck,
    HiOutlineBadgeCheck,
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { user, supplier } = useAuth();
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [stats, setStats] = useState({ canteensCount: 0, totalOrders: 0, pendingOrders: 0 });
    const [loading, setLoading] = useState(true);

    // Get the correct supplier ID
    const supplierId = user?.supplierId || supplier?.id;

    useEffect(() => {
        if (!supplierId) {
            setLoading(false);
            return;
        }

        // Fetch Recent Orders (limit 3)
        const qOrders = query(
            collection(db, 'purchase_orders'),
            where('supplierId', '==', supplierId),
            orderBy('createdAt', 'desc'),
            limit(3)
        );
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'
            }));
            setOrders(items);
        }, (error) => {
            console.error("Error fetching orders:", error);
        });

        // Fetch Drivers
        const qDrivers = query(
            collection(db, 'drivers'),
            where('supplierId', '==', supplierId),
            limit(4)
        );
        const unsubDrivers = onSnapshot(qDrivers, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDrivers(items);
        }, (error) => {
            console.error("Error fetching drivers:", error);
        });

        // Get Stats - fetch all orders once to calculate counts
        const fetchStats = async () => {
            try {
                const qCanteens = query(
                    collection(db, 'purchase_orders'),
                    where('supplierId', '==', supplierId)
                );
                const snapshot = await getDocs(qCanteens);
                const allOrders = snapshot.docs.map(doc => doc.data());
                
                const uniqueCanteens = new Set(allOrders.map(doc => doc.canteenId || doc.schoolCode));
                const pendingOrders = allOrders.filter(order => order.status === 'pending' || order.status === 'approved').length;
                
                setStats({
                    canteensCount: uniqueCanteens.size,
                    totalOrders: allOrders.length,
                    pendingOrders: pendingOrders
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();

        return () => {
            unsubOrders();
            unsubDrivers();
        };
    }, [supplierId]);

    const supplierName = supplier?.companyName || supplier?.businessName || user?.fullName || "Supplier";
    const pendingCount = stats.pendingOrders;

    // Helper to get driver status display
    const getDriverStatus = (driver) => {
        if (driver.isAvailable === false) return 'On Delivery';
        if (driver.status === 'active') return 'Available';
        return driver.status || 'Active';
    };

    const getDriverStatusColor = (driver) => {
        if (driver.isAvailable === false) return 'text-shuleamber';
        if (driver.status === 'active') return 'text-green-500';
        return 'text-navblue/40';
    };

    return (
        <div className="flex flex-col justify-between font-outfit text-white">

            {/* ── HERO ── */}
            {/* ── HERO ── */}
<div className="mb-10">
    <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-2">
        Welcome back, <span className="text-shuleamber">{supplierName}</span> 👋
    </h1>
    <p className="text-white/60 text-sm">
        Here's what's happening across your supply network today.
    </p>
</div>

            <div className="Widgets py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-navblue">
                {/* Card 1: Supply Overview */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineBadgeCheck className="w-6 h-6 text-navblue" />
                            <div>
                                <h3 className="font-bold text-xs">Supply Overview</h3>
                                <p className="text-[9px] opacity-40 leading-none">Certified Regional Supplier</p>
                            </div>
                        </div>
                        <HiOutlineChevronRight className="w-4 h-4 opacity-20" />
                    </div>

                    <div className="bg-navblue/5 rounded-xl p-3 mb-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-wider">Schools Served</span>
                            <span className="text-lg font-bold text-navblue">{stats.canteensCount} Canteens</span>
                        </div>
                        <HiOutlineUserGroup className="w-5 h-5 text-navblue/40" />
                    </div>

                    <div className="space-y-0.5 text-xs">
                        {[
                            { label: 'Total Orders', val: `${stats.totalOrders} Processed` },
                            { label: 'Regional Reach', val: supplier?.province || 'Multiple Regions' },
                            { label: 'Agreement Status', val: 'Active ✓' }
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 opacity-70 hover:opacity-100 cursor-pointer">
                                <span>{item.label}</span>
                                <span className="font-bold text-[10px] text-navblue">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card 2: Order Pipeline */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-navblue">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[9px] uppercase opacity-30 font-bold tracking-widest text-navblue">Recent Orders</h3>
                        <HiOutlineChevronRight className="w-4 h-4 opacity-20 text-navblue" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                        {loading ? (
                            <div className="p-4 text-center opacity-30 italic">Syncing orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="p-4 text-center opacity-30 italic">No incoming orders.</div>
                        ) : (
                            orders.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer text-navblue">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-navblue/5 flex items-center justify-center">
                                            <HiOutlineClock className="w-3.5 h-3.5 text-navblue/40" />
                                        </div>
                                        <div>
                                            <p className="font-bold truncate max-w-[100px]">{item.canteenName || item.schoolName || 'School'}</p>
                                            <p className="text-[9px] opacity-30 italic uppercase">{item.status}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] opacity-30">{item.time}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Card 3: Fleet Hub */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-navblue">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[9px] uppercase opacity-30 font-bold tracking-widest text-navblue">Fleet Hub</h3>
                        <HiOutlineChevronRight className="w-4 h-4 opacity-20 text-navblue" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                        {loading ? (
                            <div className="p-4 text-center opacity-30 italic">Loading drivers...</div>
                        ) : drivers.length === 0 ? (
                            <div className="p-4 text-center opacity-30 italic">No drivers registered.</div>
                        ) : (
                            drivers.slice(0, 4).map((driver, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-1 border-transparent hover:rounded-lg cursor-pointer transition-colors text-navblue">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineTruck className={`w-4 h-4 ${getDriverStatusColor(driver)}`} />
                                        <span className="font-bold text-[11px]">{driver.fullName || driver.name || 'Driver'}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold ${getDriverStatusColor(driver)}`}>
                                        {getDriverStatus(driver)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;