import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineTruck,
    HiOutlineLocationMarker,
    HiOutlineClock,
    HiOutlineGlobe,
    HiOutlineOfficeBuilding,
    HiOutlineUser,
    HiOutlineArrowRight,
    HiOutlineChevronRight,
    HiOutlineSupport
} from 'react-icons/hi';

const FleetPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('deliveries'); // 'deliveries' or 'drivers'

    const shipments = [
        { id: 'SHP-4021', origin: 'Kigali Bulk Wholesalers', destination: 'GS Rugunga', driver: 'Kamanzi Eric', status: 'In Transit', items: 450, eta: '12:45 PM' },
        { id: 'SHP-4022', origin: 'Gisenyi Dairy Farm', destination: 'Riviera High School', driver: 'Mugisha Jean', status: 'Loading', items: 120, eta: '02:00 PM' },
        { id: 'SHP-4023', origin: 'Nyanza Grain Hub', destination: 'Green Hills Academy', driver: 'Uwera Marie', status: 'Delayed', items: 800, eta: '04:30 PM' },
        { id: 'SHP-4024', origin: 'Musanze Veggies', destination: 'FAWE Girls School', driver: 'Habimana Ali', status: 'In Transit', items: 300, eta: '01:15 PM' },
    ];

    const drivers = [
        { id: 'DRV-001', name: 'Kamanzi Eric', phone: '0788123456', vehicle: 'Toyota Dyna', status: 'En Route' },
        { id: 'DRV-002', name: 'Mugisha Jean', phone: '0788234567', vehicle: 'Hyundai HD65', status: 'Available' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Transit': return 'text-green-500 bg-green-50';
            case 'Loading': return 'text-shuleamber bg-shuleamber/10';
            case 'Delayed': return 'text-red-500 bg-red-50';
            case 'Available': return 'text-navblue/40 bg-navblue/5';
            default: return 'text-navblue/60 bg-navblue/5';
        }
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black">Global <span className="text-shuleamber uppercase tracking-tighter italic">Logistics</span></h2>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Real-time Supply Chain Network Monitoring</p>
                </div>

                <div className="flex gap-4 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setViewMode('deliveries')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'deliveries' ? 'bg-shuleamber text-navblue shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Live Shipments
                    </button>
                    <button
                        onClick={() => setViewMode('drivers')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'drivers' ? 'bg-shuleamber text-navblue shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Active Fleet
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Trips', value: '18', icon: HiOutlineGlobe, color: 'text-blue-400' },
                    { label: 'Units En Route', value: '2,401', icon: HiOutlineTruck, color: 'text-shuleamber' },
                    { label: 'Network Health', value: '98%', icon: HiOutlineShieldCheck, color: 'text-green-400' },
                    { label: 'Avg Transit', value: '42m', icon: HiOutlineClock, color: 'text-purple-400' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <stat.icon className={`text-xl ${stat.color}`} />
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Live</span>
                        </div>
                        <span className="text-2xl font-black italic mt-2">{stat.value}</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Main Operational Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Simulated Map Visual */}
                <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[32px] p-6 relative overflow-hidden min-h-[400px] flex flex-col gap-6">
                    <div className="flex justify-between items-start z-10">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Regional Mesh</h3>
                            <span className="text-[10px] text-white/40 font-bold uppercase">Kigali Zone A-1</span>
                        </div>
                        <div className="w-8 h-8 bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center animate-pulse">
                            <HiOutlineGlobe className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Simulated Map Grid */}
                    <div className="flex-1 relative border border-white/5 rounded-2xl bg-black/20 p-4">
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
                            {[...Array(36)].map((_, i) => <div key={i} className="border border-white/10"></div>)}
                        </div>

                        {/* Truck Dots */}
                        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-shuleamber rounded-full shadow-lg shadow-shuleamber/50 animate-bounce"></div>
                        <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-red-400 rounded-full shadow-lg shadow-red-400/50"></div>

                        <div className="absolute bottom-6 left-6 text-[8px] font-black uppercase tracking-widest text-white/20 italic">
                            * Simulating GPS Node Telemetry
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <HiOutlineSupport className="text-shuleamber text-xl" />
                        <div className="flex flex-col leading-tight">
                            <span className="text-[10px] font-black uppercase tracking-widest text-shuleamber">Dispatch Comm</span>
                            <span className="text-[9px] text-white/40 font-bold uppercase mt-0.5">Contact Fleet Controller</span>
                        </div>
                        <HiOutlineChevronRight className="ml-auto text-white/20" />
                    </div>
                </div>

                {/* Delivery List */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-navblue">Active Manifests</h4>
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/20 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Filter manifest..."
                                className="bg-navblue/5 border-none rounded-xl py-2 pl-10 pr-4 text-[10px] font-black text-navblue w-40"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-navblue text-[11px]">
                            <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] font-black tracking-widest text-navblue/40">
                                <tr>
                                    <th className="px-6 py-4">Manifest ID</th>
                                    <th className="px-6 py-4">Chain Route (Origin &gt; Dest)</th>
                                    <th className="px-6 py-4">Units</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-4 py-4 text-center">Live</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 uppercase font-black italic">
                                {shipments.map(ship => (
                                    <tr key={ship.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 tracking-tighter">#{ship.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="opacity-50 line-clamp-1">{ship.origin}</span>
                                                <HiOutlineArrowRight className="text-shuleamber shrink-0" />
                                                <span className="text-navblue leading-none line-clamp-1">{ship.destination}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-navblue">{ship.items}</span>
                                                <span className="text-[8px] opacity-40 font-bold not-italic font-outfit uppercase">Units Total</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-widest ${getStatusColor(ship.status)}`}>
                                                {ship.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button className="text-navblue/20 hover:text-navblue transition-colors group-hover:scale-110">
                                                <HiOutlineLocationMarker className="w-5 h-5 mx-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-gray-50 flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-navblue/40">Live Sync Authorized</span>
                        </div>
                        <button className="text-[10px] font-black uppercase text-shuleamber hover:underline">Download Day Manifest</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HiOutlineShieldCheck = (props) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

export default FleetPage;
