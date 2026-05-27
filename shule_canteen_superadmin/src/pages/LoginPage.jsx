import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaPhone, FaLock } from 'react-icons/fa';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const formData = new FormData(e.target);
        const phone = formData.get('phone');
        const password = formData.get('password');

        const result = await login(phone, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navblue p-4 text-xs">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6 rounded-2xl w-full max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-12">
                    <img src="/logo_white.png" alt="Logo" className="w-12 h-12" />
                    <h1 className="text-white text-2xl sm:text-3xl font-bold text-center leading-tight">
                        <span className="text-shuleamber">Shule</span>Canteen<span className="opacity-50"> - Superadmin</span>
                    </h1>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">Systems Control</span>
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

                <Footer />
            </form>
        </div>
    );
};

export default LoginPage;
