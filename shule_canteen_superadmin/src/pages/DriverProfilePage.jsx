import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlinePhone,
    HiOutlineIdentification,
    HiOutlineTruck,
    HiOutlineQrcode,
    HiOutlineDotsVertical,
    HiOutlinePencil,
    HiOutlineShieldCheck,
    HiOutlineChevronRight,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineCalendar,
    HiOutlineUser
} from 'react-icons/hi';

const DriverProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);

    useEffect(() => {
        // Mocking data fetch based on ID
        const mockDrivers = [
            { id: 'DRV-001', name: 'Kamanzi Eric', phone: '0788123456', vehicle: 'Toyota Dyna', plate: 'RAE 123A', status: 'En Route', orders: 12, rating: 4.8, joined: 'Aug 2023' },
            { id: 'DRV-002', name: 'Mugisha Jean', phone: '0788234567', vehicle: 'Hyundai HD65', plate: 'RAD 456B', status: 'Available', orders: 45, rating: 4.9, joined: 'Jan 2024' },
            { id: 'DRV-003', name: 'Uwera Marie', phone: '0788345678', vehicle: 'Toyota Dyna', plate: 'RAA 789C', status: 'Loading', orders: 8, rating: 4.7, joined: 'Mar 2024' },
            { id: 'DRV-004', name: 'Habimana Ali', phone: '0788456789', vehicle: 'Isuzu Elf', plate: 'RAF 012D', status: 'Available', orders: 32, rating: 4.6, joined: 'Oct 2023' },
        ];

        const selectedDriver = mockDrivers.find(d => d.id === id) || mockDrivers[0];
        setDriver(selectedDriver);
    }, [id]);

    if (!driver) return null;

    return (
        <div className="flex flex-col gap-8 font-outfit text-white">
            {/* Header / Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/fleet')}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-2xl sm:text-3xl font-black italic">
                            Driver <span className="text-shuleamber">Profile</span>
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs opacity-50 font-bold uppercase tracking-widest mt-0.5">
                            <span>Fleet Management</span>
                            <HiOutlineChevronRight className="w-3 h-3" />
                            <span className="text-shuleamber">{driver.id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        <HiOutlinePencil className="w-4 h-4" />
                        <span>Edit Details</span>
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <HiOutlineDotsVertical className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Essential Info */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Identity Card */}
                    <div className="bg-white rounded-[2rem] p-8 text-navblue shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-navblue/5 rounded-full -mr-16 -mt-16"></div>

                        <div className="relative mb-6">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-navblue/5 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                <HiOutlineUser className="w-12 h-12 sm:w-16 sm:h-16 text-navblue opacity-20" />
                            </div>
                            <div className={`absolute -bottom-1 right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${driver.status === 'Available' ? 'bg-green-500' :
                                driver.status === 'En Route' ? 'bg-shuleamber' : 'bg-navblue/20'
                                }`}>
                                <HiOutlineShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl font-black">{driver.name}</h3>
                            <span className="text-xs font-bold text-navblue/40 uppercase tracking-widest">{driver.id}</span>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100 my-8"></div>

                        <div className="w-full flex justify-between items-center px-8">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black text-navblue/30 uppercase">Total Trips</span>
                                <span className="text-xl font-black text-navblue">{driver.orders}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-gray-100"></div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black text-navblue/30 uppercase">Join Date</span>
                                <span className="text-[12px] font-black text-navblue/60">{driver.joined}</span>
                            </div>
                        </div>
                    </div>

                    {/* Verification QR */}
                    <div className="bg-navblue rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-navblue/30">
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <h4 className="text-sm font-black uppercase tracking-widest">Driver Application</h4>
                                <p className="text-[10px] opacity-40 font-bold leading-relaxed px-4">
                                    Scan the QR code to download the official Shule Canteen Driver App.
                                </p>
                            </div>

                            <div className="w-40 h-40 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative group">
                                <HiOutlineQrcode className="w-24 h-24 text-shuleamber group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-shuleamber/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Stats & Personnel Records */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personnel Data - Clean White Style */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 text-navblue">
                            <div className="flex items-center gap-2">
                                <HiOutlineIdentification className="text-navblue/20 w-5 h-5" />
                                <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">Personnel Data</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Primary Contact</span>
                                    <span className="text-lg font-black text-navblue">{driver.phone}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineMail className="w-4 h-4 text-navblue/20" />
                                        <span className="text-xs font-bold text-navblue/60 italic">No Email Assigned</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HiOutlineShieldCheck className="w-4 h-4 text-green-500" />
                                        <span className="text-xs font-bold text-navblue">ID: 1 19XX X XXXXXXX X XX</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Hub - Bold Navy Style */}
                        <div className="bg-navblue rounded-2xl shadow-sm p-6 flex flex-col gap-4 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-center gap-2 z-10">
                                <HiOutlineTruck className="text-white/20 w-5 h-5" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Logistics Assignment</span>
                            </div>

                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-xs opacity-60">Assigned Vehicle</span>
                                <span className="text-lg font-bold">{driver.vehicle}</span>
                            </div>

                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-xs opacity-60">License Plate</span>
                                <span className="text-lg font-black text-shuleamber tracking-wider uppercase">{driver.plate}</span>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex flex-col gap-1 z-10">
                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Operational Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${driver.status === 'Available' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-shuleamber shadow-[0_0_12px_rgba(247,173,34,0.6)]'}`}></div>
                                    <span className="text-base font-black uppercase tracking-widest">{driver.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity - Table View */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-navblue mt-2">
                        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
                            <span className="text-[10px] font-black text-navblue/30 uppercase tracking-widest">Recent Logistics Activity</span>
                            <button className="text-[10px] font-black uppercase tracking-widest text-shuleamber hover:underline transition-all">Export Report</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-navblue text-xs">
                                <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-black">
                                    <tr>
                                        <th className="px-6 py-4">Delivery Route</th>
                                        <th className="px-6 py-4">Cargo Type</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[
                                        { route: 'GS Rugunga - Main Canteen', time: 'Today, 08:30 AM', status: 'Delivered', type: 'Breakfast Stock' },
                                        { route: 'Lycee de Kigali - Storage B', time: 'Yesterday, 14:15 PM', status: 'Delivered', type: 'Beverages' },
                                        { route: 'Ecole Belge - Kitchen', time: '21 May, 09:00 AM', status: 'Delivered', type: 'Produce' },
                                        { route: 'Green Hills - Logistics Office', time: '20 May, 11:30 AM', status: 'Delivered', type: 'Supplies' }
                                    ].map((trip, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold">{trip.route}</td>
                                            <td className="px-6 py-4 text-[10px] font-medium opacity-60 uppercase">{trip.type}</td>
                                            <td className="px-6 py-4 opacity-40">{trip.time}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[9px] font-black uppercase tracking-tighter">
                                                    {trip.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverProfilePage;
