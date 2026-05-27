import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { FaPhone, FaLock } from 'react-icons/fa';
import { HiUserCircle, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, supplier, loading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [welcome, setWelcome] = useState(false);

    if (isAuthenticated && !welcome) {
        return <Navigate to="/" replace />;
    }

    const handleContinue = async () => {
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const formData = new FormData(e.target);
        const phone = formData.get('phone');
        const password = formData.get('password');

        const result = await login(phone, password);

        if (result.success) {
            setWelcome(true);
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    // Show loading while supplier profile is being fetched
    if (welcome && authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-navblue p-4">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-8 space-y-5 w-full max-w-md">
                    <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
                    <p className="text-white/60 text-sm font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-navblue p-4 text-xs">
            {!welcome ? (
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6 rounded-2xl w-full max-w-md">
                    <div className="flex flex-col items-center justify-center gap-3 mb-12">
                        <img src="/logo_white.png" alt="Logo" className="w-12 h-12" />
                        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center leading-tight">
                            <span className="text-shuleamber">Shule</span>Canteen<span className="opacity-50"> - Supplier</span>
                        </h1>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col space-y-1">
                        <label htmlFor="phone" className="text-white text-lg md:text-sm">Phone Number</label>
                        <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                            <FaPhone className="text-white text-base" />
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                placeholder="Enter your phone number"
                                className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label htmlFor="password" className="text-white text-lg md:text-sm">Password</label>
                        <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                            <FaLock className="text-white text-base" />
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Enter your password"
                                className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-white text-navblue font-black py-3 px-6 rounded-full hover:bg-shuleamber hover:text-white active:scale-[0.98] transition-all transform duration-300 shadow-xl text-sm mt-6 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div className="flex flex-col items-center gap-1 mt-4">
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Interested in joining our network?</p>
                        <Link
                            to="/register-supplier"
                            className="text-shuleamber font-black uppercase tracking-widest hover:underline transition-all"
                        >
                            Onboard as New Supplier
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 space-y-5 w-full max-w-md">
                    {/* Header */}
                    <div className="px-2 py-3 border-b border-white/10 w-full">
                        <div className="flex items-center space-x-3">
                            <img src="/logo_white.png" alt="Logo" className="w-10 h-10" />
                            <div>
                                <h1 className="text-white text-2xl font-bold leading-tight">
                                    <span className="text-shuleamber">Shule</span>Canteen
                                </h1>
                                <p className="text-white/50 text-xs font-medium">
                                    Supplier Portal — ready to continue
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Supplier Card - only show when supplier data is loaded */}
                    {supplier ? (
                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                            {/* Supplier Logo Placeholder */}
                            <div className="w-11 h-11 rounded-xl bg-navblue/40 flex items-center justify-center text-white font-black overflow-hidden">
                                {supplier.logoUrl ? (
                                    <img src={supplier.logoUrl} className='w-full h-full object-cover' alt="supplier logo" />
                                ) : (
                                    <HiOutlineOfficeBuilding className="w-6 h-6 text-shuleamber" />
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                                    Supplier
                                </p>
                                <p className="text-white font-bold text-sm">
                                    {supplier.companyName || supplier.businessName || "Unknown Supplier"}
                                </p>
                                <p className="text-white/40 text-xs">
                                    Code: {supplier.id || supplier.supplierCode || "—"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                            <div className="w-11 h-11 rounded-xl bg-navblue/20"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 bg-navblue/20 rounded w-16"></div>
                                <div className="h-4 bg-navblue/20 rounded w-32"></div>
                                <div className="h-2 bg-navblue/20 rounded w-24"></div>
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="w-full flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-white/30 text-[10px] uppercase tracking-widest">
                            User
                        </span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>

                    {/* User Card */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        {/* User Icon */}
                        <div className="w-11 h-11 rounded-xl bg-shuleamber/20 flex items-center justify-center text-white">
                            <HiUserCircle className='w-8 h-8 text-shuleamber' />
                        </div>

                        <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                                Logged in as
                            </p>
                            <p className="text-white font-bold text-sm">
                                {user?.fullName || user?.name || "User"}
                            </p>
                            <p className="text-white/40 text-xs">
                                {user?.phone}
                            </p>
                            <p className="text-white/40 text-xs">
                                Role: <span className="text-shuleamber font-bold">
                                    {user?.role?.replace('supplier_', '').toUpperCase() || 'SUPPLIER'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        className="w-full bg-white text-navblue font-black py-3 px-6 rounded-full hover:bg-shuleamber hover:text-white transition-all text-sm"
                    >
                        Continue to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginPage;