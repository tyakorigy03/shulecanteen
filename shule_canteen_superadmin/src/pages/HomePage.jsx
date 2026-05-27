import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineTruck,
    HiOutlineBadgeCheck,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineRefresh,
} from 'react-icons/hi';

const HomePage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        suppliers: 0,
        canteens: 0,
        activeSuppliers: 0,
        activeCanteens: 0,
        pending: 0,
        rejected: 0,
    });
    const [lastSync, setLastSync] = useState(null);
    const [syncTick, setSyncTick] = useState(0);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'onboarding_requests'), (snapshot) => {
            const docs = snapshot.docs.map(doc => doc.data());
            setStats({
                suppliers: docs.filter(d => d.entityType === 'supplier').length,
                canteens: docs.filter(d => d.entityType === 'canteen').length,
                activeSuppliers: docs.filter(d => d.entityType === 'supplier' && d.status === 'active').length,
                activeCanteens: docs.filter(d => d.entityType === 'canteen' && d.status === 'active').length,
                pending: docs.filter(d => d.status === 'pending').length,
                rejected: docs.filter(d => d.status === 'rejected').length,
            });
            setLastSync(new Date());
        });

        return () => unsub();
    }, []);

    // Refresh the "last sync" display every 10s
    useEffect(() => {
        const timer = setInterval(() => setSyncTick(t => t + 1), 10000);
        return () => clearInterval(timer);
    }, []);

    const formatLastSync = () => {
        if (!lastSync) return '—';
        const diff = Math.floor((new Date() - lastSync) / 1000);
        if (diff < 10) return 'Just now';
        if (diff < 60) return `${diff}s ago`;
        return `${Math.floor(diff / 60)}m ago`;
    };

    const pulseItems = [
        {
            label: 'Pending Applications',
            status: stats.pending === 0 ? 'All Cleared' : `${stats.pending} Awaiting Review`,
            time: stats.pending === 0 ? 'OK' : 'Review',
            icon: HiOutlineClock,
            urgent: stats.pending > 0,
        },
        {
            label: 'Active Vendors',
            status: `${stats.activeSuppliers} Supplier${stats.activeSuppliers !== 1 ? 's' : ''} · ${stats.activeCanteens} Canteen${stats.activeCanteens !== 1 ? 's' : ''}`,
            time: 'Live',
            icon: HiOutlineCheckCircle,
            urgent: false,
        },
        {
            label: 'Rejected Requests',
            status: stats.rejected === 0 ? 'None' : `${stats.rejected} Rejected`,
            time: stats.rejected === 0 ? 'OK' : 'Flagged',
            icon: HiOutlineExclamationCircle,
            urgent: stats.rejected > 0,
        },
    ];

    return (
        <div className="flex flex-col justify-between font-outfit text-white">
            <div className="hero p-3 mb-12">
                <h2 className="text-3xl font-black">Superadmin <span className="text-shuleamber">Console</span></h2>
                <p className="text-sm opacity-60 mt-1">Global oversight of Shule Canteen ecosystem</p>
            </div>

            <div className="Widgets py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-navblue">
                {/* Card 1: System Network */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineBadgeCheck className="w-6 h-6 text-navblue" />
                            <div>
                                <h3 className="font-bold text-xs uppercase tracking-wider">Network Health</h3>
                                <p className="text-[9px] opacity-40 leading-none">All systems operational</p>
                            </div>
                        </div>
                        <HiOutlineChevronRight className="w-4 h-4 opacity-20" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-navblue/5 rounded-xl p-3">
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-wider">Suppliers</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-lg font-bold text-navblue">{stats.suppliers}</span>
                                <span className="text-[8px] bg-green-500/10 text-green-600 px-1 rounded-sm">LIVE</span>
                            </div>
                        </div>
                        <div className="bg-navblue/5 rounded-xl p-3">
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-wider">Canteens</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-lg font-bold text-navblue">{stats.canteens}</span>
                                <span className="text-[8px] bg-green-500/10 text-green-600 px-1 rounded-sm">LIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-0.5 text-xs">
                        {[
                            { label: 'Active Provinces', val: '5/5' },
                            { label: 'System Uptime', val: '99.98%' },
                            { label: 'Last Sync', val: formatLastSync() },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 opacity-70 hover:opacity-100 cursor-pointer">
                                <span>{item.label}</span>
                                <span className="font-bold text-[10px] text-navblue">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card 2: Operational Pulse — LIVE */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-navblue">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[9px] uppercase opacity-30 font-bold tracking-widest text-navblue">Operational Pulse</h3>
                            <span className="inline-flex items-center gap-1 text-[8px] bg-green-500/10 text-green-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                                Live
                            </span>
                        </div>
                        <HiOutlineRefresh className="w-4 h-4 opacity-20 text-navblue" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                        {pulseItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => item.label === 'Pending Applications' && navigate('/applications')}
                                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer text-navblue"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.urgent ? 'bg-amber-500/10' : 'bg-navblue/5'}`}>
                                            <Icon className={`w-3.5 h-3.5 ${item.urgent ? 'text-amber-500' : 'text-navblue/40'}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold">{item.label}</p>
                                            <p className={`text-[9px] italic ${item.urgent ? 'text-amber-500 opacity-80' : 'opacity-30'}`}>{item.status}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.urgent ? 'text-amber-600 bg-amber-50' : 'text-navblue/30'}`}>
                                        {item.time}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Card 3: Global Logistics */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 text-navblue">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[9px] uppercase opacity-30 font-bold tracking-widest text-navblue">Global Logistics</h3>
                        <HiOutlineChevronRight className="w-4 h-4 opacity-20 text-navblue" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                        {[
                            { name: 'Kamanzi Eric', status: 'En Route', school: 'GS Kigali' },
                            { name: 'Mugisha Jean', status: 'Available', school: '-' },
                            { name: 'Uwera Marie', status: 'Loading', school: 'Riviera High' },
                            { name: 'Habimana Ali', status: 'Available', school: '-' }
                        ].map((driver, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-1 border-transparent hover:rounded-lg cursor-pointer transition-colors text-navblue">
                                <div className="flex items-center gap-2">
                                    <HiOutlineTruck className={`w-4 h-4 ${driver.status === 'En Route' ? 'text-shuleamber' : 'text-navblue/20'}`} />
                                    <span>{driver.name}</span>
                                </div>
                                <span className={`text-[9px] font-bold ${driver.status === 'Available' ? 'text-green-500' : 'text-navblue/40'}`}>
                                    {driver.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
