import { HiOutlineTruck, HiOutlineClock, HiOutlineChevronRight, HiOutlineLocationMarker, HiOutlineBell, HiOutlineCheckCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { confirmOrder, activeOrders } = useDelivery();

    // Mock data for assigned deliveries
    const activeAssignments = [
        {
            id: 'ORD-772',
            school: 'GS Rugunga',
            destination: 'Loading Dock A',
            time: '08:30 AM',
            items: 12,
            status: 'Assigned'
        },
        {
            id: 'ORD-845',
            school: 'Lycee de Kigali',
            destination: 'Storage B - Kitchen',
            time: '11:15 AM',
            items: 8,
            status: 'Pending'
        },
    ];

    const isConfirmed = (id) => activeOrders.some(o => o.id === id);

    const handleOrderClick = (assignment) => {
        if (!isConfirmed(assignment.id)) {
            confirmOrder(assignment);
        } else {
            navigate(`/delivery/${assignment.id}`);
        }
    };

    return (
        <div className="px-4 pt-2 pb-20 space-y-6">
            {/* Driver Identity & Status */}
            <div className="bg-navblue rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Driver</span>
                    <h2 className="text-2xl font-black">Yakin Nsanzumuhire</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Shift Active</span>
                    </div>
                </div>
            </div>

            {/* Assignments Section */}
            <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-navblue font-black text-lg">Active Assignments</h2>
                    <span className="bg-shuleamber/10 text-shuleamber text-[10px] font-black px-2 py-1 rounded-md uppercase">
                        {activeAssignments.length} Deliveries
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {activeAssignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer active:scale-[0.98] ${isConfirmed(assignment.id) ? 'border-green-500/30 bg-green-50/10' : 'border-slate-100'
                                }`}
                            onClick={() => handleOrderClick(assignment)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConfirmed(assignment.id) ? 'bg-green-500 text-white' : 'bg-navblue/5 text-navblue'
                                        }`}>
                                        {isConfirmed(assignment.id) ? <HiOutlineCheckCircle className="text-xl" /> : <HiOutlineTruck className="text-xl" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-navblue font-black text-base">{assignment.school}</span>
                                            {isConfirmed(assignment.id) && (
                                                <span className="text-[8px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Active</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-navblue/40 uppercase tracking-widest">{assignment.id}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-shuleamber font-black text-xs uppercase">{assignment.time}</span>
                                    <span className="text-[9px] font-bold text-navblue/30 uppercase">Expected</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HiOutlineLocationMarker className="text-navblue/20" />
                                    <span className="text-xs font-bold text-navblue/60">{assignment.destination}</span>
                                </div>
                                <div className="flex items-center gap-1 text-navblue">
                                    <span className="text-xs font-black">{assignment.items} Items</span>
                                    <HiOutlineChevronRight className="text-navblue/20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications Hint */}
            <div className="bg-shuleamber/5 border border-shuleamber/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-shuleamber flex items-center justify-center text-navblue shadow-lg shadow-shuleamber/20">
                    <HiOutlineBell className="text-xl" />
                </div>
                <div className="flex flex-col">
                    <span className="text-navblue font-black text-sm">Logistics Update</span>
                    <span className="text-[10px] font-bold text-navblue/60">New route optimization suggested for ORD-845.</span>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
