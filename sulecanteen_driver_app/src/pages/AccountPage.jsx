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

const AccountPage = () => {
    const navigate = useNavigate();

    const user = {
        name: "Yakin Nsanzumuhire",
        email: "yakin.n@shule.rw",
        role: "Fleet Operations",
        license: "RAA 123 B",
        joinedDate: "Jan 2024"
    };

    const deliveryHistory = [
        { id: 'ORD-762', date: '21 May', status: 'Completed' },
        { id: 'ORD-759', date: '20 May', status: 'Completed' },
        { id: 'ORD-750', date: '19 May', status: 'Completed' },
    ];

    const sections = [
        {
            title: "Operational Status",
            items: [
                { icon: HiOutlineShieldCheck, label: "Verification Status", value: "Verified", color: "text-green-500" },
                { icon: HiOutlineCog, label: "Vehicle Settings", value: "RAA 123 B", color: "text-slate-400" },
                { icon: HiOutlineBell, label: "Dispatch Alerts", value: "Enabled", color: "text-slate-400" },
            ]
        },
        {
            title: "Fleet Details",
            items: [
                { icon: HiOutlineOfficeBuilding, label: "Hub Location", value: "Kigali Logistics Center", color: "text-slate-400" },
            ]
        },
    ];

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
                    </div>
                </div>

                {/* Logistics Stats Card */}
                <div className="bg-navblue rounded-2xl p-6 shadow-xl shadow-navblue/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-shuleamber/20 rounded-md flex items-center justify-center">
                                        <HiOutlineCreditCard className="text-[10px] text-shuleamber" />
                                    </div>
                                    <p className="text-white/60  font-black ">Lifetime Earnings</p>
                                </div>
                                <h3 className="text-white text-xl font-black">RWF 1,240,000</h3>
                            </div>
                        </div>

                        {/* Recent Deliveries */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-white/40 text-sm font-black ">Recent Deliveries</span>
                            </div>

                            <div>
                                {deliveryHistory.map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white/5 p-2.5  border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                                <HiOutlineLogout className="text-xs text-green-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm">{order.id}</span>
                                                <span className="text-white/30 text-xs font-bold uppercase">{order.date}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-green-400/60 lowercase italic">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
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
                    onClick={() => navigate('/login')}
                    className="w-full py-4.5 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center space-x-3 border border-red-100 hover:bg-red-100 transition-all active:scale-95 group"
                >
                    <HiOutlineLogout className="text-lg group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-[11px] uppercase tracking-widest">Logout from System</span>
                </button>

                <div className="text-center pt-4">
                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                        Procurement App • v2.4.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
