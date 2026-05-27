import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineCube,
    HiOutlineClipboardList,
    HiOutlineUserCircle,
    HiOutlineBell,
    HiOutlineMenuAlt2,
    HiOutlineX,
    HiOutlineQuestionMarkCircle,
    HiOutlineChevronDown,
    HiOutlineTruck,
    HiOutlineUserGroup,
    HiOutlineBookOpen,
    HiOutlineShoppingCart,
    HiOutlineIdentification,
    HiOutlineLibrary
} from 'react-icons/hi';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const navItems = [
        { path: '/', name: 'Dashboard', icon: HiOutlineHome },
        { path: '/suppliers', name: 'Suppliers', icon: HiOutlineUserGroup },
        { path: '/canteens', name: 'Cantines', icon: HiOutlineLibrary },
        { path: '/fleet', name: 'Global Logistics', icon: HiOutlineTruck },
        { path: '/orders', name: 'System Orders', icon: HiOutlineShoppingCart },
        { path: '/account', name: 'Settings', icon: HiOutlineUserCircle },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            className="min-h-screen font-outfit text-white bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
                backgroundImage: 'linear-gradient(to right, #001f3f 0%, rgba(0, 31, 63, 0.9) 15%, rgba(0, 31, 63, 0.7) 100%), url("/preview.png")'
            }}
        >
            {/* Header */}
            <header className={`h-20 flex items-center justify-between px-4 lg:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-navblue/80 backdrop-blur-md border-b border-white/5 shadow-xl' : 'bg-transparent'
                } text-white`}>
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 mr-1 text-white lg:hidden hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenuAlt2 className="w-6 h-6" />}
                    </button>

                    <div className="flex items-center ps-1 lg:ps-2.5">
                        <img src="/logo_white.png" className="h-7 lg:h-8 me-2 lg:me-3" alt="Logo" />
                        <span className="self-center text-lg lg:text-xl font-black whitespace-nowrap text-white">
                            <span className="text-shuleamber">Shule</span><span className="hidden sm:inline">Cantine <span className="text-sm text-white/80 font-normal">(Superadmin Console)</span> </span><span className="sm:hidden">Superadmin</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative shadow-sm hover:bg-gray-50 transition-all">
                        <HiOutlineBell className="w-5 h-5 text-navblue" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-shuleamber text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
                            4
                        </span>
                    </button>

                    {/* Profile Capsule */}
                    <div className="relative">
                        <div
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center bg-white rounded-full p-1 sm:pr-3 shadow-sm border border-white/20 cursor-pointer hover:bg-gray-50 transition-all select-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-navblue/5 flex items-center justify-center sm:mr-2.5 overflow-hidden shrink-0">
                                <HiOutlineUserCircle className="w-7 h-7 text-navblue/40" />
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 focus:outline-none">
                                <span className="text-navblue font-bold text-[13px] whitespace-nowrap">{user?.name || 'Superadmin'}</span>
                                <HiOutlineChevronDown className={`w-3.5 h-3.5 text-navblue/40 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                <Link
                                    to="/account"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-navblue hover:bg-navblue/5 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiOutlineUserCircle className="w-4 h-4 text-navblue/40" />
                                    <span>My Profile</span>
                                </Link>
                                <div className="h-[1px] bg-gray-100 my-1 mx-4"></div>
                                <button
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    <HiOutlineX className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex pt-20">
                {/* Sidebar Overlay (Mobile) */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-navblue/40 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed left-0 z-40 h-[calc(100vh-80px)] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        } w-64 bg-white shadow-xl lg:shadow-none`}
                >
                    <div className="h-full px-3 py-6 flex flex-col">
                        <nav className="space-y-1 font-medium flex-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center p-2 rounded-lg transition-all duration-300 group ${isActive
                                            ? 'bg-navblue/10 text-navblue'
                                            : 'text-navblue/70 hover:bg-navblue/5 hover:text-navblue'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition duration-75 ${isActive ? 'text-navblue' : 'text-navblue/70 group-hover:text-navblue'
                                            }`} />
                                        <span className="text-sm ml-2 ">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="pt-4 mt-auto border-t border-gray-100">
                            <Link to="/support" className="flex items-center w-full p-2 rounded-lg text-navblue/70 hover:bg-navblue/5 transition-all duration-300 group">
                                <HiOutlineQuestionMarkCircle className="w-5 h-5 text-navblue/40 group-hover:text-navblue" />
                                <span className="text-sm ml-2 font-bold">Help & Support</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 transition-all duration-300 min-h-[calc(100vh-80px)] ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64 ml-0'}`}>
                    <div className="p-4 lg:p-8 h-full">
                        <Outlet />
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
