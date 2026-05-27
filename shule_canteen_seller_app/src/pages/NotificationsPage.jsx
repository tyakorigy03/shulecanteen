import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineTag, HiOutlineClock, HiOutlineCube, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineShoppingBag, HiChevronRight } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { user, school } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.schoolCode) return;

        // Fetch notifications from school bucket
        const q = query(
            collection(db, 'schools', user.schoolCode, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A',
                date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'
            }));
            
            // Group by date
            const grouped = {};
            items.forEach(item => {
                const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                
                let group = 'Earlier';
                if (item.date === today) group = 'Today';
                else if (item.date === yesterdayStr) group = 'Yesterday';
                
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push(item);
            });
            
            setNotifications(grouped);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.schoolCode]);

    const getIconByType = (type) => {
        switch (type) {
            case 'inventory':
                return { icon: <HiOutlineExclamation />, color: 'bg-red-500' };
            case 'finance':
                return { icon: <HiOutlineCheckCircle />, color: 'bg-green-600' };
            case 'procurement':
                return { icon: <HiOutlineShoppingBag />, color: 'bg-navblue' };
            case 'order':
                return { icon: <HiOutlineCube />, color: 'bg-shuleamber' };
            default:
                return { icon: <HiOutlineInformationCircle />, color: 'bg-gray-500' };
        }
    };

    const markAsRead = async (notificationId) => {
        if (!user?.schoolCode) return;
        
        try {
            const notifRef = doc(db, 'schools', user.schoolCode, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        
        // Navigate based on notification type
        if (notification.link) {
            navigate(notification.link);
        } else if (notification.type === 'inventory') {
            navigate('/inventory');
        } else if (notification.type === 'procurement') {
            navigate('/purchases');
        } else if (notification.type === 'finance') {
            navigate('/account/cashout');
        }
    };

    const sections = Object.keys(notifications).sort((a, b) => {
        const order = { 'Today': 0, 'Yesterday': 1, 'Earlier': 2 };
        return (order[a] || 3) - (order[b] || 3);
    });

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen pb-24 pt-4 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-24 pt-4">
            <div className="max-w-xl mx-auto px-4 space-y-8">

                {sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <img 
                            src="https://shulecantine.babyeyi.rw/cantine/search_empty.png" 
                            alt="No notifications" 
                            className="w-48 opacity-90"
                        />
                        <p className="text-slate-400 font-bold text-sm">No notifications yet</p>
                        <p className="text-slate-300 text-[10px] font-medium text-center max-w-[200px]">
                            When something happens, you'll see it here
                        </p>
                    </div>
                ) : (
                    sections.map(section => (
                        <div key={section} className="space-y-3">
                            <h3 className="text-navblue/40 text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                                {section}
                            </h3>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                {notifications[section].map((notif, index, filteredArr) => {
                                    const { icon, color } = getIconByType(notif.type);
                                    return (
                                        <div key={notif.id}>
                                            <div
                                                className={`p-5 flex items-start space-x-4 active:bg-slate-50 transition-all cursor-pointer group relative ${!notif.read ? 'bg-shuleamber/5' : ''}`}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                {/* Unread indicator dot */}
                                                {!notif.read && (
                                                    <div className="absolute top-5 left-5 w-2 h-2 rounded-full bg-shuleamber animate-pulse"></div>
                                                )}
                                                
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl ${color}/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <div className={`text-xl ${color === 'bg-navblue' ? 'text-navblue' : color === 'bg-shuleamber' ? 'text-shuleamber' : color === 'bg-red-500' ? 'text-red-500' : color === 'bg-green-600' ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {icon}
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-1 pr-6">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
                                                            <h4 className="text-navblue font-black text-sm">{notif.title}</h4>
                                                        </div>
                                                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">{notif.time}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs leading-relaxed font-medium line-clamp-2 pr-4">
                                                        {notif.message}
                                                    </p>
                                                    {notif.type === 'procurement' && notif.orderId && (
                                                        <p className="text-[9px] text-shuleamber font-bold mt-1">
                                                            Order #{notif.orderId.slice(-8)}
                                                        </p>
                                                    )}
                                                    {notif.type === 'inventory' && notif.itemName && (
                                                        <p className="text-[9px] text-red-500 font-bold mt-1">
                                                            Stock: {notif.stockRemaining} {notif.unit} left
                                                        </p>
                                                    )}
                                                </div>

                                                <HiChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-shuleamber transition-colors" />
                                            </div>

                                            {index < filteredArr.length - 1 && (
                                                <div className="mx-5 border-b border-slate-50"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
};

export default NotificationsPage;