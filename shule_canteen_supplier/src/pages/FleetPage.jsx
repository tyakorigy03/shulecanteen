import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineIdentification,
    HiOutlinePhone,
    HiOutlineTruck,
    HiOutlinePlus
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const FleetPage = () => {
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const supplierId = user?.supplierId || supplier?.id;

    useEffect(() => {
        if (!supplierId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'drivers'),
            where('supplierId', '==', supplierId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDrivers(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching drivers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [supplierId]);

    const filteredDrivers = drivers.filter(driver =>
        driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.includes(searchTerm)
    );

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const getStatusColor = (status, isAvailable) => {
        if (status === 'active' && isAvailable) return 'text-green-500 bg-green-50';
        if (status === 'active' && !isAvailable) return 'text-shuleamber bg-shuleamber/5';
        return 'text-gray-400 bg-gray-50';
    };

    const getStatusLabel = (status, isAvailable) => {
        if (status === 'active' && isAvailable) return 'Available';
        if (status === 'active' && !isAvailable) return 'On Delivery';
        return 'Inactive';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Fleet <span className="text-shuleamber">Hub</span></h2>
                    <p className="text-sm opacity-60 mt-1">Manage regional delivery personnel and vehicle assignments</p>
                </div>
                <button
                    onClick={() => navigate('/fleet/register')}
                    className="w-full sm:w-auto justify-center bg-shuleamber text-navblue px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-shuleamber/10"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Register Driver</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                    <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest">Active Personnel ({filteredDrivers.length})</span>
                    <div className="relative w-full max-w-none sm:max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navblue/5 border-none rounded-xl py-2 pl-10 pr-4 text-xs text-navblue focus:ring-1 focus:ring-navblue transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {filteredDrivers.length === 0 ? (
                        <div className="p-12 text-center text-navblue opacity-30 italic">
                            No drivers found. Click "Register Driver" to add your first driver.
                        </div>
                    ) : (
                        <table className="w-full text-left text-navblue text-xs relative">
                            <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-bold">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Personnel Info</th>
                                    <th className="hidden sm:table-cell px-6 py-4">Phone</th>
                                    <th className="hidden md:table-cell px-6 py-4">Vehicle</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Status</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredDrivers.map(driver => (
                                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[11px] sm:text-xs leading-tight">{driver.fullName}</span>
                                                <span className="sm:hidden text-[9px] opacity-40 font-medium mt-0.5">{driver.phone} • {driver.vehicleType}</span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 opacity-70">{driver.phone}</td>
                                        <td className="hidden md:table-cell px-6 py-4 italic text-[10px] opacity-40">
                                            {driver.vehicleType} • {driver.plateNumber}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${getStatusColor(driver.status, driver.isAvailable)}`}>
                                                {getStatusLabel(driver.status, driver.isAvailable)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => toggleMenu(driver.id)}
                                                className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                            >
                                                <HiOutlineDotsVertical className="w-4 h-4" />
                                            </button>

                                            {openMenuId === driver.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    ></div>
                                                    <div className="absolute right-6 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                        <button
                                                            onClick={() => navigate(`/fleet/driver/${driver.id}`)}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                        >
                                                            View Profile
                                                        </button>
                                                        <button
                                                            onClick={() => navigate('/deliveries/new')}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                        >
                                                            Assign Trip
                                                        </button>
                                                        <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>
                                                        <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest">
                                                            Deactivate
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
            </div>
        </div>
    );
};

export default FleetPage;