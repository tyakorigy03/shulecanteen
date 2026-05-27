import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaPhone, FaLock, FaDownload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { HiUserCircle } from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import API_BASE, { IMAGE_BASE, VITE_PLATFORM } from '../config/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, school } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [welcome, setWelcome] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    const sellerApkUrl = `${IMAGE_BASE}/uploads/apks/ShuleCanteen-Seller-latest.apk`;

    console.log(IMAGE_BASE);
    console.log(VITE_PLATFORM);

    if (isAuthenticated && !welcome) {
        return <Navigate to="/" replace />;
    }
    const handleContinue = async () => {
        setIsSyncing(true);
        setSyncMessage('Finding students for this school...');

        try {
            const res = await fetch((API_BASE ? `${API_BASE}/canteen/sync` : `/api/canteen/sync`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schoolCode: school?.schoolCode || school?.code
                })
            });

            const data = await res.json();

            if (!data.success) {
                setSyncMessage(data.message || 'Sync failed');
                setIsSyncing(false);
                return;
            }

            setSyncMessage(`Loaded ${data.count} students successfully...`);

            // small UX delay so user sees success
            setTimeout(() => {
                navigate('/');
            }, 800);

        } catch (err) {
            console.error(err);
            setSyncMessage('Failed to load students');
            setIsSyncing(false);
        }
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
            console.log(result);
            setWelcome(true);
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navblue p-4 text-xs">
            {
                !welcome && (
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-6 md:min-w-[400px]">
                        <div className="flex items-center justify-center space-x-3 mb-12">
                            <img src="/logo_white.png" alt="Logo" className="w-10 h-10" />
                            <h1 className="text-white text-3xl font-bold">
                                <span className="text-shuleamber">Shule</span>Cantine
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

                        {/* APK Download Section (Only on Web) */}
                        {VITE_PLATFORM !== 'mobile' && (
                            <div className="mt-8 p-4 rounded-2xl  flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="bg-white p-2 rounded-lg">
                                    <QRCodeSVG value={sellerApkUrl} size={64} level="H" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-white font-bold text-[13px]">Scan to download APP / </p>
                                    <a
                                        href={sellerApkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-shuleamber font-black text-[11px] flex items-center space-x-1 hover:underline cursor-pointer"
                                    >
                                        <FaDownload className="text-[10px]" />
                                        <span>Click here to download</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        <footer className="flex flex-col items-center space-y-6 mt-12 pb-8">
                            <div className="flex items-center space-x-4">
                                <div className="h-[1px] w-12 bg-linear-to-r from-transparent to-white/10"></div>
                                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                                    <span className="text-white/40 text-xs font-bold">Managed by</span>
                                    <span className="text-white font-black text-lg leading-none tracking-tighter">
                                        EDU<span className="text-shuleamber">POTO</span>
                                    </span>
                                </div>
                                <div className="h-[1px] w-12 bg-linear-to-l from-transparent to-white/10"></div>
                            </div>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex items-center space-x-2 opacity-30">
                                    <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                                    <p className="text-white text-xs  font-bold">
                                        © {new Date().getFullYear()} Edupoto Global. All rights reserved.
                                    </p>
                                    <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                                </div>
                            </div>
                        </footer>
                    </form>
                )
            }
            {welcome && !school && (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
                    <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                    <div className="h-4 w-48 bg-white/10 rounded"></div>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase">
                        Loading school data...
                    </p>
                </div>
            )}

            {welcome && school && (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-6 space-y-5 md:min-w-[420px]">

                    {/* Header */}
                    <div className="px-2 py-3 border-b border-white/10 w-full">
                        <div className="flex items-center space-x-3">
                            <img src="/logo_white.png" alt="Logo" className="w-10 h-10" />
                            <div>
                                <h1 className="text-white text-2xl font-bold leading-tight">
                                    <span className="text-shuleamber">Shule</span>Cantine
                                </h1>
                                <p className="text-white/50 text-xs font-medium">
                                    Access verified — ready to continue
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* School Card */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">

                        {/* School Logo Placeholder */}
                        <div className="w-11 h-11 rounded-xl bg-navblue/40 flex items-center justify-center text-white font-black overflow-hidden">
                            <img src={'https://babyeyi.rw/' + school?.logo} className='w-full h-full object-cover' alt="school logo" />
                        </div>

                        <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                                School
                            </p>
                            <p className="text-white font-bold text-sm">
                                {school?.schoolName || school?.name || "Unknown School"}
                            </p>
                            <p className="text-white/40 text-xs">
                                Code: {school?.schoolCode || school?.code || "—"}
                            </p>
                        </div>
                    </div>
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
                                    {user?.role}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        disabled={isSyncing}
                        className="w-full bg-white text-navblue font-black py-3 px-6 rounded-full hover:bg-shuleamber hover:text-white transition-all text-sm disabled:opacity-50"
                    >
                        {isSyncing ? 'Preparing System...' : 'Continue to Dashboard'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
