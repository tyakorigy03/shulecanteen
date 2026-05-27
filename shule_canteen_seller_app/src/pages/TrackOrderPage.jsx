import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineTruck, HiOutlineCheckCircle, HiOutlineCog, HiOutlineHome, HiOutlineArrowLeft, HiOutlineShieldCheck } from 'react-icons/hi';

const TrackOrderPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderData = location.state?.orderData || {
        orderId: "PR-2026-0042",
        supplier: "Inyange Industries",
        delivery: "Green Hills Academy",
        itemsCount: 4,
        total: 145000
    };

    const steps = [
        { title: 'Order Confirmed', description: 'Procurement voucher generated', icon: HiOutlineCheckCircle, status: 'completed', time: '10:14 AM' },
        { title: 'Processing', description: 'Vendor is preparing your items', icon: HiOutlineCog, status: 'completed', time: '10:25 AM' },
        { title: 'Quality Checked', description: 'Certified for distribution', icon: HiOutlineShieldCheck, status: 'current', time: '11:05 AM' },
        { title: 'Out for Delivery', description: 'Assigned to logistics team', icon: HiOutlineTruck, status: 'pending', time: 'Expected 2:00 PM' },
        { title: 'Delivered', description: 'Designated drop-off point', icon: HiOutlineHome, status: 'pending', time: 'Expected 3:30 PM' },
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-24 font-sans px-4">
            <div className="max-w-lg mx-auto space-y-6">
                {/* Status Header */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xl shadow-navblue/5">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Tracking</span>
                            <h2 className="text-navblue font-black text-2xl">#{orderData.orderId}</h2>
                        </div>
                        <div className="bg-shuleamber/10 text-shuleamber px-3 py-1.5 rounded-lg">
                            <span className="text-[10px] font-black uppercase tracking-wider">In Progress</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 text-slate-500">
                        <HiOutlineTruck className="text-xl" />
                        <span className="text-xs font-bold">Estimated Delivery: <span className="text-navblue">Today, 3:30 PM</span></span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-xl shadow-navblue/5 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

                    <div className="relative space-y-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex group">
                                {/* Line and Icon */}
                                <div className="flex flex-col items-center mr-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                                            step.status === 'current' ? 'bg-navblue text-white shadow-lg shadow-navblue/20 animate-pulse' :
                                                'bg-slate-100 text-slate-300'
                                        }`}>
                                        <step.icon className="text-xl" />
                                    </div>
                                    {idx !== steps.length - 1 && (
                                        <div className={`w-[2px] h-full my-2 rounded-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-slate-100'
                                            }`}></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-sm font-black uppercase tracking-tight ${step.status === 'pending' ? 'text-slate-400' : 'text-navblue'
                                            }`}>{step.title}</h3>
                                        <span className="text-[9px] font-bold text-slate-400 tabular-nums">{step.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => navigate('/purchases')}
                    className="w-full py-4.5 bg-navblue text-white rounded-xl flex items-center justify-center space-x-3 shadow-xl shadow-navblue/20 group uppercase font-black text-[11px] tracking-widest active:scale-95 transition-all"
                >
                    <HiOutlineArrowLeft className="text-shuleamber group-hover:-translate-x-1 transition-transform" />
                    <span>Return to Dashboard</span>
                </button>
            </div>
        </div>
    );
};

export default TrackOrderPage;
