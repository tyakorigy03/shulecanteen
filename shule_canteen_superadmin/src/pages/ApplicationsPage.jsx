import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, doc, updateDoc, orderBy } from 'firebase/firestore';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineExternalLink,
    HiOutlineClock,
    HiOutlineFilter
} from 'react-icons/hi';

const ApplicationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, active, rejected

    useEffect(() => {
        const q = query(collection(db, 'onboarding_requests'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApplications(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const filteredApplications = applications.filter(app => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (app.companyName || app.name || '').toLowerCase().includes(search) ||
            (app.email || '').toLowerCase().includes(search) ||
            (app.id || '').toLowerCase().includes(search);

        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'onboarding_requests', id), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            setOpenMenuId(null);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'text-green-500 bg-green-50';
            case 'rejected': return 'text-red-500 bg-red-50';
            case 'pending': return 'text-amber-500 bg-amber-50';
            default: return 'text-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Onboarding <span className="text-shuleamber">Applications</span></h2>
                    <p className="text-sm opacity-60 mt-1">Review and manage supplier & canteen registrations</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest min-w-fit">Registry ({filteredApplications.length})</span>
                        <div className="flex items-center gap-2 bg-navblue/5 p-1 rounded-lg">
                            {['all', 'pending', 'active', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filterStatus === status
                                        ? 'bg-white text-navblue shadow-sm'
                                        : 'text-navblue/40 hover:text-navblue'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full max-w-none sm:max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applications..."
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
                                <th className="px-4 sm:px-6 py-4">Applicant Info</th>
                                <th className="hidden sm:table-cell px-6 py-4">Type</th>
                                <th className="hidden md:table-cell px-6 py-4">Contact Details</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Status</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredApplications.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[11px] sm:text-xs leading-tight">{app.companyName || app.schoolName || app.name}</span>
                                            <span className="text-[9px] opacity-40 font-black uppercase tracking-tighter mt-1">{app.id}</span>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${app.entityType === 'supplier' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            {app.entityType}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{app.fullName || app.contactPerson}</span>
                                            <span className="text-[10px] opacity-40">{app.district}, {app.province}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right">
                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleMenu(app.id)}
                                            className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                        >
                                            <HiOutlineDotsVertical className="w-4 h-4" />
                                        </button>

                                        {openMenuId === app.id && (
                                            <div className="absolute right-12 top-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-right-2 duration-200 text-left">
                                                <Link
                                                    to={app.entityType === 'supplier' ? `/suppliers/${app.id}` : `/canteens/register?edit=${app.id}`}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-bold text-navblue hover:bg-navblue/5 transition-colors w-full"
                                                >
                                                    <HiOutlineExternalLink className="w-4 h-4 text-navblue/40" />
                                                    <span>View Details</span>
                                                </Link>
                                                <div className="h-[1px] bg-gray-50 my-1 mx-4"></div>
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'active')}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-bold text-green-600 hover:bg-green-50 transition-colors w-full"
                                                >
                                                    <HiOutlineCheck className="w-4 h-4" />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                    className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase font-bold text-red-500 hover:bg-red-50 transition-colors w-full"
                                                >
                                                    <HiOutlineX className="w-4 h-4" />
                                                    <span>Reject</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredApplications.length === 0 && (
                    <div className="p-12 text-center text-navblue opacity-30 italic">
                        {loading ? 'Crunching data...' : 'No applications matching your criteria.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationsPage;
