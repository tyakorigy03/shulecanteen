import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineTag, HiOutlineClock, HiOutlineCube, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineShoppingBag, HiChevronRight } from 'react-icons/hi';

const NotificationsPage = () => {
    const navigate = useNavigate();

    const notifications = [
        {
            id: 1,
            type: 'Inventory',
            title: 'Low Stock Alert',
            message: 'Samosa Extra is below the minimum threshold (5 units remaining).',
            time: '08:30 AM',
            date: 'Today',
            icon: <HiOutlineExclamation />,
            color: 'bg-red-500'
        },
        {
            id: 2,
            type: 'Finance',
            title: 'Cashout Disbursed',
            message: 'Your request for RWF 450,000 has been successfully disbursed to your mobile number.',
            time: '11:45 AM',
            date: 'Today',
            icon: <HiOutlineCheckCircle />,
            color: 'bg-green-600'
        },
        {
            id: 3,
            type: 'Procurement',
            title: 'New Order Confirmed',
            message: 'Procurement order #PROC-9081 has been confirmed by the supplier.',
            time: '04:20 PM',
            date: 'Yesterday',
            icon: <HiOutlineShoppingBag />,
            color: 'bg-navblue'
        },
        {
            id: 4,
            type: 'System',
            title: 'Weekly Report Ready',
            message: 'Your weekly sales & inventory performance report is now available for download.',
            time: '09:00 AM',
            date: 'Yesterday',
            icon: <HiOutlineInformationCircle />,
            color: 'bg-shuleamber'
        }
    ];

    const sections = ['Today', 'Yesterday'];

    return (
        <div className="bg-slate-50 min-h-screen pb-24 pt-4">
            <div className="max-w-xl mx-auto px-4 space-y-8">

                {sections.map(section => (
                    <div key={section} className="space-y-3">
                        <h3 className="text-navblue/40 text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                            {section}
                        </h3>

                        {/* Grouped Notifications Container */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            {notifications.filter(n => n.date === section).map((notif, index, filteredArr) => (
                                <div key={notif.id}>
                                    <div
                                        className="p-5 flex items-start space-x-4 active:bg-slate-50 transition-all cursor-pointer group relative"
                                    >
                                        {/* Simplified Icon */}
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-navblue/60 group-hover:text-navblue transition-colors">
                                            <div className="text-xl">
                                                {notif.icon}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-1 pr-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${notif.color}`}></span>
                                                    <h4 className="text-navblue font-black text-sm">{notif.title}</h4>
                                                </div>
                                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">{notif.time}</span>
                                            </div>
                                            <p className="text-slate-500 text-xs leading-relaxed font-medium line-clamp-2 pr-4">
                                                {notif.message}
                                            </p>
                                        </div>

                                        <HiChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-shuleamber transition-colors" />
                                    </div>

                                    {/* Inline Divider */}
                                    {index < filteredArr.length - 1 && (
                                        <div className="mx-5 border-b border-slate-50"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-30">
                        <HiOutlineBell className="text-6xl text-navblue" />
                        <p className="text-navblue font-black text-[10px] uppercase tracking-widest">No New Notifications</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default NotificationsPage;
