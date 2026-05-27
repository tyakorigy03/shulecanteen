import { useState } from 'react';
import { FaPhone, FaLock } from 'react-icons/fa';
import API_BASE from '../config/api';

// Role → sub-app URL map
const ROLE_DESTINATIONS = {
    canteen:    '/cantine',
    manager:    '/cantine',
    accountant: '/cantine',
    operator:   '/cantine',
    supplier:   '/supplier',
    supplier_admin:  '/supplier',
    supplier_staff:  '/supplier',
    driver:     '/driver',
    superadmin: '/admin',
    admin:      '/admin',
};

// Storage prefixes for each app to prevent conflicts
const STORAGE_PREFIXES = {
    canteen: 'cantine_',
    supplier: 'supplier_',
    driver: 'driver_',
    admin: 'admin_',
};

const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });

            const data = await res.json();

            if (!res.ok || !data.token) {
                setError(data.message || 'Login failed. Please check your credentials.');
                setLoading(false);
                return;
            }

            const { token, user } = data;
            const role = (user.role || '').toLowerCase();
            
            // Determine destination based on role
            let destination = ROLE_DESTINATIONS[role];
            
            if (!destination) {
                setError('Your account role is not recognised. Contact support.');
                setLoading(false);
                return;
            }

            // Determine storage prefix based on destination
            let prefix = '';
            if (destination === '/cantine') prefix = STORAGE_PREFIXES.canteen;
            else if (destination === '/supplier') prefix = STORAGE_PREFIXES.supplier;
            else if (destination === '/driver') prefix = STORAGE_PREFIXES.driver;
            else if (destination === '/admin') prefix = STORAGE_PREFIXES.admin;

            // Store credentials with prefix
            localStorage.setItem(`${prefix}token`, token);
            localStorage.setItem(`${prefix}user`, JSON.stringify(user));
            
            // Also store the role for quick access
            localStorage.setItem('userRole', role);
            localStorage.setItem('userDestination', destination);

            // Navigate to the appropriate sub-app
            window.location.href = destination;

        } catch (err) {
            console.error('Login error:', err);
            setError('Could not reach the server. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navblue p-4 text-xs">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6 rounded-2xl md:min-w-[400px]">
                <div className="flex items-center justify-center space-x-3 mb-12">
                    <img src="/logo_white.png" alt="Logo" className="w-10 h-10" />
                    <h1 className="text-white text-3xl font-bold">
                        <span className="text-shuleamber">Shule</span>Canteen
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="flex flex-col space-y-1">
                    <label htmlFor="phone" className="text-white text-lg md:text-sm">Phone Number</label>
                    <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                        <FaPhone className="text-white text-base" />
                        <input
                            type="tel"
                            id="phone"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
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
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-navblue font-black py-3 px-6 rounded-full hover:bg-shuleamber hover:text-white active:scale-[0.98] transition-all transform duration-300 shadow-xl text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

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
                            <p className="text-white text-xs font-bold">
                                © {new Date().getFullYear()} Edupoto Global. All rights reserved.
                            </p>
                            <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                        </div>
                    </div>
                </footer>
            </form>
        </div>
    );
};

export default LoginPage;