import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineLibrary,
    HiOutlineLocationMarker,
    HiOutlineUser,
    HiOutlinePlus,
    HiOutlineOfficeBuilding,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineExternalLink
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useEffect } from 'react';

const CanteensPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'onboarding_requests'), where('entityType', '==', 'canteen'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCanteens(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'onboarding_requests', id), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            setOpenMenuId(null);
        } catch (err) {
            console.error('Error updating canteen status:', err);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name || 'this facility'}"? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, 'onboarding_requests', id));
                setOpenMenuId(null);
            } catch (err) {
                console.error('Error deleting canteen:', err);
                alert('Failed to delete facility.');
            }
        }
    };

    const filteredCanteens = canteens.filter(c => {
        const search = searchTerm.toLowerCase();
        const nameMatch = (c.schoolName || c.name || '').toLowerCase().includes(search);
        const idMatch = (c.id || '').toLowerCase().includes(search);
        return nameMatch || idMatch;
    });

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Canteen <span className="text-shuleamber">Management</span></h2>
                    <p className="text-sm opacity-60 mt-1">Configure and monitor school canteen facilities</p>
                </div>
                <button
                    onClick={() => navigate('/canteens/register')}
                    className="bg-shuleamber text-navblue px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-shuleamber/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <HiOutlinePlus className="text-lg" />
                    Register New Canteen
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                    <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest">
                        {loading ? 'Fetching Registry...' : `Canteen Registry (${filteredCanteens.length})`}
                    </span>
                    <div className="relative w-full max-w-none sm:max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by school or facility ID..."
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
                                <th className="px-4 sm:px-6 py-4">Facility Info</th>
                                <th className="hidden sm:table-cell px-6 py-4">Location</th>
                                <th className="hidden md:table-cell px-6 py-4">Manager</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Capacity</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Status</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCanteens.map(can => (
                                <tr key={can.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => navigate(`/canteens/${can.id}`)}
                                                className="font-bold text-[11px] sm:text-xs leading-tight text-left hover:text-shuleamber transition-colors"
                                            >
                                                {can.schoolName || can.name}
                                            </button>
                                            <span className="text-[9px] opacity-40 font-black uppercase tracking-tighter mt-1">{can.id}</span>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-6 py-4">
                                        <div className="flex items-center gap-2 italic font-medium opacity-70">
                                            <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                                            <span>{can.district}, {can.province}</span>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-4 font-bold">{can.fullName || can.contactPerson || can.manager}</td>
                                    <td className="px-4 sm:px-6 py-4 text-right font-black opacity-60">{can.capacity || '0'} students</td>
                                    <td className="px-4 sm:px-6 py-4 text-right">
                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${can.status?.toLowerCase() === 'active' ? 'text-green-500 bg-green-50' :
                                            can.status?.toLowerCase() === 'rejected' ? 'text-red-500 bg-red-50' : 'text-shuleamber bg-shuleamber/10'
                                            }`}>
                                            {can.status}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleMenu(can.id)}
                                            className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                        >
                                            <HiOutlineDotsVertical className="w-4 h-4" />
                                        </button>

                                        {openMenuId === can.id && (
                                            <div className="absolute right-12 top-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-right-2 duration-200 text-left">
                                                <button
                                                    onClick={() => navigate(`/canteens/${can.id}`)}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-bold text-navblue hover:bg-navblue/5 transition-colors w-full"
                                                >
                                                    <HiOutlineExternalLink className="w-4 h-4 text-navblue/40" />
                                                    <span>View Facility</span>
                                                </button>
                                                <div className="h-[1px] bg-gray-50 my-1 mx-4"></div>
                                                <button
                                                    onClick={() => handleStatusUpdate(can.id, 'active')}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-bold text-green-600 hover:bg-green-50 transition-colors w-full"
                                                >
                                                    <HiOutlineCheck className="w-4 h-4" />
                                                    <span>Approve Facility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(can.id, 'rejected')}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-bold text-red-500 hover:bg-red-50 transition-colors w-full"
                                                >
                                                    <HiOutlineX className="w-4 h-4" />
                                                    <span>Deactivate</span>
                                                </button>
                                                <div className="h-[1px] bg-gray-50 my-1 mx-4"></div>
                                                <button
                                                    onClick={() => handleDelete(can.id, can.schoolName || can.name)}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-black text-red-600 hover:bg-red-600 hover:text-white transition-all w-full"
                                                >
                                                    <HiOutlineX className="w-4 h-4" />
                                                    <span>Delete Facility</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCanteens.length === 0 && (
                    <div className="p-12 text-center text-navblue opacity-30 italic">
                        No canteens found in registry.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CanteensPage;
