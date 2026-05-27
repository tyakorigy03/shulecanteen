import { useState } from 'react';
import { HiHome, HiDotsHorizontal, HiOutlineUserCircle, HiOutlineBell, HiOutlineTrash, HiX, HiPlus, HiOutlineTag, HiChevronLeft, HiOutlineShoppingBag, HiOutlineTruck, HiOutlineQrcode } from 'react-icons/hi';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { useKeyboardStatus } from '../hooks/useKeyboardStatus';
import QRScanner from './QRScanner';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isKeyboardVisible = useKeyboardStatus();

    // Delivery Context
    const { activeOrders, removeOrder, clearDelivery, orderCount } = useDelivery();

    // Context switching logic
    const isVerificationMode = location.pathname.startsWith('/delivery/');

    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const handleScanResult = (result) => {
        console.log("Scanned:", result);
        // Add vibrate feedback if available
        if ('vibrate' in navigator) navigator.vibrate(200);
        // Logic for confirming delivery would go here
    };

    const isCartActive = orderCount > 0;
    const isHomePage = location.pathname === '/';

    const getTitle = () => {
        switch (location.pathname) {
            case '/': return 'Driver Hub';
            case '/account': return 'My Profile';
            case '/notifications': return 'Notifications';
            default: return 'Driver App';
        }
    };

    const navItems = [
        { label: 'Home', icon: HiHome, path: '/' },
        { label: 'Scan', icon: HiOutlineQrcode, path: '/scan', isSpecial: true },
        { label: 'Account', icon: HiOutlineUserCircle, path: '/account' },
    ];

    const handleNavClick = (item) => {
        if (item.isAction && item.label === 'More') {
            setIsMoreMenuOpen(!isMoreMenuOpen);
            return;
        }
        if (item.label === 'Scan' || item.label === 'Verify') {
            setIsScanModalOpen(!isScanModalOpen);
            setIsMoreMenuOpen(false);
            return;
        }
        setIsMoreMenuOpen(false);
        setIsScanModalOpen(false);
        navigate(item.path);
    };

    const moreMenuItems = [
        { label: 'Logout', icon: HiX, path: '/login', isDestructive: true },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* More Menu Overlay */}
            {isMoreMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] animate-in fade-in duration-300"
                    onClick={() => setIsMoreMenuOpen(false)}
                >
                    <div
                        className="absolute bottom-20 right-4 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col py-1">
                            {moreMenuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsMoreMenuOpen(false);
                                        navigate(item.path);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3.5 transition-all active:bg-slate-100 ${item.isDestructive
                                        ? 'text-red-500 border-t border-slate-50'
                                        : 'text-navblue'
                                        }`}
                                >
                                    <item.icon className={`text-lg ${item.isDestructive ? 'opacity-80' : 'opacity-40'}`} />
                                    <span className={`text-sm ${item.isDestructive ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Scan Popover Modal */}
            {isScanModalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-end pb-36 px-4 bg-navblue/20 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsScanModalOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md bg-shuleamber rounded-[32px] p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex flex-col max-h-[75vh] min-h-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col">
                                <span className="text-navblue/40 text-[10px] font-black uppercase tracking-widest leading-none">Orders Ready</span>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-navblue text-2xl font-black">{orderCount} {orderCount === 1 ? 'Order' : 'Orders'}</span>
                                    <HiPlus className="text-navblue/40" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <span className="text-navblue/40 text-[9px] font-bold uppercase tracking-wider">Tap to close</span>
                                </div>
                                <button
                                    onClick={() => setIsScanModalOpen(false)}
                                    className="bg-navblue/10 p-2 rounded-full text-navblue hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <HiX className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Items List inside Popover */}
                        <div className="bg-white/40 backdrop-blur-md rounded-[24px] overflow-hidden mb-4 sm:mb-6 overflow-y-auto border border-white/20 flex-shrink min-h-0 max-h-40">
                            {activeOrders.length > 0 ? (
                                activeOrders.map((order, index) => (
                                    <div key={order.id}>
                                        <div className="flex items-center justify-between p-4 px-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-9 h-9 bg-white/40 rounded-xl flex items-center justify-center text-navblue">
                                                    <HiOutlineTruck className="text-lg opacity-40" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-navblue leading-tight">{order.school}</span>
                                                    <span className="text-[10px] font-black text-navblue/40 uppercase">
                                                        {order.id} • {order.items} Items
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeOrder(order.id)}
                                                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-navblue/40 hover:text-red-500 transition-colors"
                                            >
                                                <HiX className="text-xs" />
                                            </button>
                                        </div>
                                        {index < activeOrders.length - 1 && (
                                            <div className="mx-5 border-b border-navblue/5"></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-navblue/30 italic text-sm font-bold uppercase tracking-widest">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <HiOutlineShoppingBag className="text-3xl" />
                                        <div className="flex flex-col items-center space-y-3">
                                            <span className="text-navblue/60 text-xs font-bold uppercase tracking-wider">No Active Orders.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Scanner Viewfinder Box */}
                        {
                            activeOrders.length > 0 && (
                                <div className="aspect-square bg-navblue rounded-[28px] relative overflow-hidden flex items-center justify-center group flex-shrink-0 max-h-[30vh]">
                                    <QRScanner onScan={handleScanResult} />
                                    {/* Animated Corners (Overlay) */}
                                    <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-shuleamber rounded-tl-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] z-10"></div>
                                    <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-shuleamber rounded-tr-xl z-10"></div>
                                    <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-shuleamber rounded-bl-xl z-10"></div>
                                    <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-shuleamber rounded-br-xl z-10"></div>
                                    {/* Scanner Line Animation */}
                                    <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-shuleamber/40 shadow-[0_0_20px_#F59E0B] animate-pulse z-10"></div>
                                </div>
                            )
                        }
                        {/* Tooltip Triangle */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-shuleamber rotate-45 rounded-sm lg:rounded-md shadow-2xl"></div>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg ${isCartActive
                ? (isVerificationMode ? 'bg-shuleamber text-navblue' : 'bg-navblue text-white')
                : 'bg-navblue text-white'
                }`}>
                <header
                    className="px-6 py-3 flex items-center justify-between cursor-pointer min-h-[64px]"
                    onClick={() => isCartActive && setIsCartExpanded(!isCartExpanded)}
                >
                    {isCartActive ? (
                        <>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isVerificationMode ? 'opacity-60' : 'text-white/40'}`}>
                                    {isVerificationMode ? 'Orders Progress' : 'Active Manifest'}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl font-black leading-none">{orderCount} {orderCount === 1 ? 'Order' : 'Orders'}</span>
                                    <div className={`transition-transform duration-300 ${isCartExpanded ? 'rotate-180' : ''}`}>
                                        <HiPlus className={`text-sm ${isVerificationMode ? 'opacity-50' : 'text-white/40'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex flex-col items-end">
                                    <span className={`text-[9px] font-bold uppercase ${isVerificationMode ? 'opacity-60' : 'text-white/40'}`}>
                                        Tap to {isCartExpanded ? 'close' : 'view'}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearDelivery();
                                        setIsCartExpanded(false);
                                    }}
                                    className={`${isVerificationMode ? 'bg-navblue/10' : 'bg-white/10'} p-2 rounded-full hover:bg-red-500 hover:text-white transition-all`}
                                >
                                    <HiOutlineTrash className="text-lg" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {isHomePage ? (
                                <>
                                    <button
                                        onClick={() => navigate('/account')}
                                        className="flex flex-col items-center hover:text-shuleamber transition-colors"
                                    >
                                        <HiOutlineUserCircle className="text-2xl" />
                                        <span className="font-bold ">Account</span>
                                    </button>

                                    <div className="flex items-center justify-center">
                                        <img src="/logo_white.png" alt="Shule Logo" className="h-8 w-auto" />
                                    </div>

                                    <button
                                        onClick={() => navigate('/notifications')}
                                        className="flex flex-col items-center hover:text-shuleamber transition-colors"
                                    >
                                        <HiOutlineBell className="text-2xl" />
                                        <span className="font-bold">Notifications</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4 w-full">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(-1);
                                        }}
                                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        <HiChevronLeft className="text-2xl" />
                                    </button>
                                    <h1 className="text-xl font-black">{getTitle()}</h1>
                                </div>
                            )}
                        </>
                    )}
                </header>

                {/* Expandable Cart Details */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCartExpanded && isCartActive ? 'max-h-screen border-t border-black/5' : 'max-h-0'
                    }`}>
                    <div className={`p-4 space-y-4 backdrop-blur-md h-[calc(100vh-64px)] overflow-y-auto outline-none ${isVerificationMode ? 'bg-white/20' : 'bg-navblue/95 border-t border-white/10'
                        }`}>
                        <div className={`rounded-[24px] overflow-hidden space-y-2 ${isVerificationMode ? 'bg-white/40 backdrop-blur-sm' : 'bg-white/5 border border-white/10'
                            }`}>
                            {activeOrders.map((order, index) => (
                                <div key={order.id}>
                                    <div className="flex items-center justify-between p-4 transition-colors group">
                                        <div className="flex items-center space-x-4">
                                            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${isVerificationMode ? 'bg-navblue/10 text-navblue' : 'bg-white/10 text-shuleamber'
                                                }`}>
                                                <HiOutlineTruck className="text-xl opacity-40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-base leading-tight ${isVerificationMode ? 'text-navblue' : 'text-white'}`}>{order.school}</span>
                                                <span className={`text-xs font-semibold uppercase tracking-wider ${isVerificationMode ? 'text-navblue/40' : 'text-white/40'}`}>
                                                    {order.id} • {order.items} Items
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeOrder(order.id); }}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${isVerificationMode ? 'bg-navblue/5 text-navblue/40 hover:bg-red-500 hover:text-white' : 'bg-white/5 text-white/40 hover:bg-red-500 hover:text-white'
                                                }`}
                                        >
                                            <HiX className="text-lg" />
                                        </button>
                                    </div>
                                    {index < activeOrders.length - 1 && (
                                        <div className={`mx-4 border-b ${isVerificationMode ? 'border-navblue/10' : 'border-white/5'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setIsCartExpanded(false);
                                setIsScanModalOpen(true);
                            }}
                            className={`w-full font-black py-4 rounded-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center space-x-2 ${isVerificationMode ? 'bg-shuleamber text-navblue' : 'bg-navblue text-white'
                                }`}
                        >
                            <span>Scan & Finalize Deliveries</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 pt-20 pb-20">
                <Outlet />
            </main>

            {/* Bottom Mobile Navigation */}
            {(
                <nav className={`fixed bottom-0 left-0 right-0 transition-all duration-500 ease-in-out ${isKeyboardVisible ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                    } ${isScanModalOpen ? 'z-[70]' : 'z-50'}`}>
                    <div className="relative bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-4 flex items-center justify-between rounded-t-[24px] border-t border-slate-100">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.label === 'More' && isMoreMenuOpen);

                            if (item.isSpecial) {
                                return (
                                    <div key={index} className={`relative -top-7 flex flex-col items-center ${isScanModalOpen ? 'z-[70]' : 'z-10'}`}>
                                        <button
                                            onClick={() => handleNavClick(item)}
                                            className={`w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(245,158,11,0.3)] flex items-center justify-center border-4  active:scale-95 transition-all overflow-hidden ${isScanModalOpen ? 'bg-shuleamber border-shuleamber text-navblue' : 'bg-white border-white text-shuleamber'}`}
                                        >
                                            <HiOutlineQrcode className="text-3xl" />
                                        </button>
                                        <span className={`mt-1 text-sm font-bold ${isScanModalOpen ? 'text-shuleamber' : 'text-slate-400'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleNavClick(item)}
                                    className={`flex flex-col items-center justify-center space-y-0.5 w-14 transition-all ${isActive ? 'text-navblue font-bold' : 'text-slate-400 font-medium'
                                        }`}
                                >
                                    {Icon && <Icon className={`text-xl ${isActive ? 'scale-110' : 'opacity-60'}`} />}
                                    <span className={`text-sm text-center ${isActive ? '' : 'opacity-80'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
};

export default MainLayout;
