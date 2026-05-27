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
import { db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const DriverProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deliveryHistory, setDeliveryHistory] = useState([]);

    const supplierId = user?.supplierId || supplier?.id;

    useEffect(() => {
        const fetchDriver = async () => {
            if (!id) return;
            
            try {
                // Fetch driver details
                const driverRef = doc(db, 'drivers', id);
                const driverSnap = await getDoc(driverRef);
                
                if (driverSnap.exists()) {
                    const driverData = { id: driverSnap.id, ...driverSnap.data() };
                    setDriver(driverData);
                    
                    // Fetch delivery history for this driver
                    const deliveriesQuery = query(
                        collection(db, 'deliveries'),
                        where('driverId', '==', id)
                    );
                    const deliveriesSnapshot = await getDocs(deliveriesQuery);
                    const deliveries = deliveriesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setDeliveryHistory(deliveries);
                } else {
                    console.error('Driver not found');
                }
            } catch (error) {
                console.error('Error fetching driver:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDriver();
    }, [id]);

    const getStatusColor = (status) => {
        if (status === 'delivered') return 'bg-green-50 text-green-600';
        if (status === 'in_transit') return 'bg-shuleamber/10 text-shuleamber';
        if (status === 'assigned') return 'bg-blue-50 text-blue-600';
        return 'bg-gray-50 text-gray-500';
    };

    const getStatusLabel = (status) => {
        if (status === 'delivered') return 'Delivered';
        if (status === 'in_transit') return 'In Transit';
        if (status === 'assigned') return 'Assigned';
        return status || 'Unknown';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="text-center py-20">
                <p className="text-white/60 italic">Driver not found</p>
                <button onClick={() => navigate('/fleet')} className="mt-4 text-shuleamber">Back to Fleet</button>
            </div>
        );
    }

    const totalDeliveries = deliveryHistory.length;
    const completedDeliveries = deliveryHistory.filter(d => d.status === 'delivered').length;
    const joinDate = driver.createdAt?.toDate().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) || 'N/A';

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
                            <div className={`absolute -bottom-1 right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                                driver.isAvailable ? 'bg-green-500' : 'bg-shuleamber'
                            }`}>
                                <HiOutlineShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl font-black">{driver.fullName}</h3>
                            <span className="text-xs font-bold text-navblue/40 uppercase tracking-widest">{driver.id}</span>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100 my-8"></div>

                        <div className="w-full flex justify-between items-center px-8">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black text-navblue/30 uppercase">Total Trips</span>
                                <span className="text-xl font-black text-navblue">{totalDeliveries}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-gray-100"></div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black text-navblue/30 uppercase">Completed</span>
                                <span className="text-xl font-black text-green-600">{completedDeliveries}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-gray-100"></div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black text-navblue/30 uppercase">Join Date</span>
                                <span className="text-[12px] font-black text-navblue/60">{joinDate}</span>
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
                        {/* Personnel Data */}
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
                                        <span className="text-xs font-bold text-navblue/60 italic">Email: {driver.email || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HiOutlineIdentification className="w-4 h-4 text-navblue/20" />
                                        <span className="text-xs font-bold text-navblue/60">ID Number: {driver.idNumber || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Hub */}
                        <div className="bg-navblue rounded-2xl shadow-sm p-6 flex flex-col gap-4 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-center gap-2 z-10">
                                <HiOutlineTruck className="text-white/20 w-5 h-5" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Logistics Assignment</span>
                            </div>

                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-xs opacity-60">Assigned Vehicle</span>
                                <span className="text-lg font-bold">{driver.vehicleType || 'Not assigned'}</span>
                            </div>

                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-xs opacity-60">License Plate</span>
                                <span className="text-lg font-black text-shuleamber tracking-wider uppercase">{driver.plateNumber || 'N/A'}</span>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex flex-col gap-1 z-10">
                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Operational Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${driver.isAvailable ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-shuleamber shadow-[0_0_12px_rgba(247,173,34,0.6)]'}`}></div>
                                    <span className="text-base font-black uppercase tracking-widest">
                                        {driver.isAvailable ? 'Available' : 'On Delivery'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity - Table View */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-navblue mt-2">
                        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
                            <span className="text-[10px] font-black text-navblue/30 uppercase tracking-widest">Recent Delivery History</span>
                            <button className="text-[10px] font-black uppercase tracking-widest text-shuleamber hover:underline transition-all">Export Report</button>
                        </div>
                        <div className="overflow-x-auto">
                            {deliveryHistory.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <p>No delivery history found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-navblue text-xs">
                                    <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-black">
                                        <tr>
                                            <th className="px-6 py-4">Delivery ID</th>
                                            <th className="px-6 py-4">Destination</th>
                                            <th className="px-6 py-4">Orders</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {deliveryHistory.slice(0, 5).map((delivery) => (
                                            <tr key={delivery.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/deliveries/${delivery.id}`)}>
                                                <td className="px-6 py-4 font-bold text-[10px]">{delivery.deliveryCode || delivery.id.slice(-8)}</td>
                                                <td className="px-6 py-4 text-[11px] font-medium">
                                                    {delivery.orders?.[0]?.school || 'Multiple destinations'}
                                                </td>
                                                <td className="px-6 py-4 text-[10px] opacity-60">{delivery.orderIds?.length || 0} orders</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${getStatusColor(delivery.status)}`}>
                                                        {getStatusLabel(delivery.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-[10px] opacity-40">
                                                    {delivery.dispatchDate?.toDate().toLocaleDateString() || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverProfilePage;