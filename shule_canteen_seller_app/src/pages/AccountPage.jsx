import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineUserCircle,
    HiOutlineShieldCheck,
    HiOutlineBell,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineOfficeBuilding,
    HiOutlineCreditCard,
    HiOutlineChevronRight,
    HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
    const navigate = useNavigate();
    const { user: authUser, logout ,school} = useAuth();
    const [profile, setProfile] = useState(null);
    const [cashouts, setCashouts] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch profile from onboarding_requests
    useEffect(() => {
        if (!authUser) return;

        const unsub = onSnapshot(doc(db, 'onboarding_requests', authUser.id || authUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }
            setLoading(false);
        });

        return () => unsub();
    }, [authUser]);

    // Fetch real cashouts from Firestore
    useEffect(() => {
        if (!authUser?.schoolCode) return;

        const q = query(
            collection(db, 'schools', authUser.schoolCode, 'cashouts'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) || 'N/A',
                amount: doc.data().amount || 0,
                status: doc.data().status || 'pending'
            }));
            setCashouts(items);
        });

        return () => unsub();
    }, [authUser?.schoolCode]);

    // Calculate wallet balance from sales - total cashouts
    useEffect(() => {
        if (!authUser?.schoolCode) return;

        const salesQuery = query(
            collection(db, 'schools', authUser.schoolCode, 'sales')
        );

        const unsubSales = onSnapshot(salesQuery, (snapshot) => {
            const totalSales = snapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
            
            // Calculate total cashouts
            const cashoutsQuery = query(
                collection(db, 'schools', authUser.schoolCode, 'cashouts'),
                where('status', '==', 'completed')
            );
            
            const unsubCashouts = onSnapshot(cashoutsQuery, (cashoutSnap) => {
                const totalCashouts = cashoutSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
                setWalletBalance(totalSales - totalCashouts);
            });
            
            return () => unsubCashouts();
        });

        return () => unsubSales();
    }, [authUser?.schoolCode]);

    const user = {
        name: profile?.fullName || profile?.name || authUser?.name || "User",
        email: profile?.email || authUser?.email || "canteen.admin@shule.rw",
        role: profile?.role || "Head of Procurement",
        institution: profile?.schoolName || profile?.companyName || school?.name  || "Loading...",
        joinedDate: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : "Mar 2024"
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-400';
            case 'pending':
                return 'text-shuleamber animate-pulse';
            case 'rejected':
                return 'text-red-400';
            default:
                return 'text-white/40';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'Disbursed';
            case 'pending':
                return 'Pending';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    };

    const sections = [
        {
            title: "Security & Access",
            items: [
                { icon: HiOutlineCog, label: "Change Password", value: null, color: "text-slate-400", action: () => navigate('/account/change-password') },
                { icon: HiOutlineBell, label: "Notifications", value: "On", color: "text-slate-400", action: () => navigate('/notifications') },
            ]
        },
        {
            title: "Business Details",
            items: [
                { icon: HiOutlineOfficeBuilding, label: "School", value: user.institution, color: "text-slate-400", action: null },
                { icon: HiOutlineCreditCard, label: "Registry ID", value: profile?.id || "#CAN-0000", color: "text-slate-400", action: null },
            ]
        },
        {
            title: "Support",
            items: [
                { icon: HiOutlineQuestionMarkCircle, label: "Help Center", value: null, color: "text-slate-400", action: () => window.open('https://support.shulecanteen.rw', '_blank') },
            ]
        }
    ];

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-16 font-sans">
            <div className="max-w-lg mx-auto px-4 space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-navblue/5 border border-slate-100 flex flex-col items-center">
                    <div className="relative">
                        <div className="w-24 h-24 border-2 border-navblue rounded-full flex items-center justify-center text-navblue text-4xl shadow-lg shadow-navblue/20">
                            <HiOutlineUserCircle />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-shuleamber rounded-lg flex items-center justify-center text-navblue border-2 border-white shadow-md">
                            <HiOutlineShieldCheck className="text-lg" />
                        </div>
                    </div>

                    <div className="text-center mt-5 space-y-1">
                        <h2 className="text-navblue font-black text-2xl tracking-tight">{user.name}</h2>
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-shuleamber text-[10px] font-black uppercase tracking-widest bg-shuleamber/10 px-2 py-0.5 rounded-md">
                                {user.role}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs font-bold pt-1">{user.email}</p>
                        <p className="text-slate-300 text-[9px] font-mono">Joined {user.joinedDate}</p>
                    </div>
                </div>

                {/* ShuleCard Wallet Card */}
                <div className="bg-navblue rounded-2xl p-6 shadow-xl shadow-navblue/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-shuleamber/20 rounded-md flex items-center justify-center">
                                        <HiOutlineCreditCard className="text-[10px] text-shuleamber" />
                                    </div>
                                    <p className="text-white/60 font-black text-[9px] uppercase tracking-widest">ShuleCard Wallet</p>
                                </div>
                                <h3 className="text-white text-xl font-black">RWF {walletBalance.toLocaleString()}</h3>
                            </div>
                            <button
                                onClick={() => navigate('/account/cashout')}
                                className="bg-shuleamber px-4 py-2 rounded-xl text-navblue shadow-lg shadow-shuleamber/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider"
                            >
                                Request Cashout
                            </button>
                        </div>

                        {/* Mini History - Real Data */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Recent Cashouts</span>
                                {cashouts.length > 0 && (
                                    <button 
                                        onClick={() => navigate('/account/cashout-history')}
                                        className="text-shuleamber text-[9px] font-black uppercase tracking-widest hover:underline cursor-pointer"
                                    >
                                        View All
                                    </button>
                                )}
                            </div>

                            <div>
                                {cashouts.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-white/30 text-xs italic">No cashout requests yet</p>
                                    </div>
                                ) : (
                                   <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
    {cashouts.map((co, idx) => (
        <div 
            key={co.id} 
            className={`
                flex items-center justify-between p-2.5 hover:bg-white/10 transition-colors
                ${idx !== cashouts.length - 1 ? 'border-b border-white/5' : ''}
            `}
        >
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <HiOutlineLogout className={`text-xs ${co.status === 'pending' ? 'text-shuleamber' : co.status === 'completed' ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div className="flex flex-col">
                    <span className="text-white text-[11px] font-bold">{co.id.slice(-8)}</span>
                    <span className="text-white/30 text-[9px] font-bold uppercase">{co.date}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-white text-sm font-bold">RWF {co.amount.toLocaleString()}</p>
                <span className={`text-[9px] font-bold ${getStatusColor(co.status)}`}>
                    {getStatusBadge(co.status)}
                </span>
            </div>
        </div>
    ))}
</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Sections */}
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                        <h3 className="px-1 text-navblue/40 text-[10px] font-black uppercase tracking-widest">{section.title}</h3>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-navblue/5 overflow-hidden">
                            {section.items.map((item, iOffset) => (
                                <button
                                    key={iOffset}
                                    onClick={item.action}
                                    className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${iOffset !== section.items.length - 1 ? 'border-b border-slate-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-navblue">
                                            <item.icon className="text-lg" />
                                        </div>
                                        <span className="text-navblue text-sm font-bold tracking-tight">{item.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {item.value && (
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${item.color}`}>
                                                {item.value}
                                            </span>
                                        )}
                                        <HiOutlineChevronRight className="text-slate-300" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <button
                    onClick={() => logout()}
                    className="w-full py-4.5 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center space-x-3 border border-red-100 hover:bg-red-100 transition-all active:scale-95 group"
                >
                    <HiOutlineLogout className="text-lg group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-[11px] uppercase tracking-widest">Logout from System</span>
                </button>
            </div>
        </div>
    );
};

export default AccountPage;