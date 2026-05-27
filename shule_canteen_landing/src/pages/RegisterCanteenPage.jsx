import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaUser, FaSchool, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { Provinces, Districts } from 'rwanda';
import axios from 'axios';
import API_BASE from '../config/api';

const RegisterCanteenPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const [location, setLocation] = useState({
        province: '',
        district: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.target);
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            canteenName: formData.get('canteenName'),
            estimatedStudents: formData.get('estimatedStudents'),
            location: location
        };

        try {
            const response = await axios.post(`${API_BASE}/register/canteen`, data);
            if (response.data.success) {
                setSubmitted(true);
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLocationChange = (field, value) => {
        const updated = { ...location, [field]: value };
        if (field === 'province') {
            updated.district = '';
        }
        setLocation(updated);
    };

    if (submitted) {
        // ... rest of success state ...
        return (
            <div className="min-h-screen flex items-center justify-center bg-navblue p-4 text-white font-outfit">
                <div className="flex flex-col items-center space-y-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-shuleamber/20 rounded-full flex items-center justify-center animate-pulse">
                        <FaSchool className="text-shuleamber text-3xl" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black italic tracking-tighter">REGISTRATION RECEIVED</h1>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Your canteen's request to join the ShuleCanteen network is being processed.
                            Our institutional team will verify your school details and contact you to set up your digital portal.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white text-navblue font-black py-4 px-12 rounded-full hover:bg-shuleamber hover:text-white transition-all transform active:scale-95 shadow-2xl uppercase text-xs tracking-widest"
                    >
                        Back to Landing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-navblue p-4 text-xs font-outfit py-20">
            <div className="flex flex-col space-y-10 w-full max-w-[450px]">
                {/* Brand Identity */}
                <div
                    className="flex items-center justify-center space-x-3 cursor-pointer group mb-12"
                    onClick={() => navigate('/')}
                >
                    <img src="/logo_white.png" alt="Logo" className="w-10 h-10 transition-transform duration-500" />
                    <h1 className="text-white text-3xl font-black italic tracking-tighter">
                        Shule<span className="text-shuleamber">Canteen</span>
                    </h1>
                </div>

                {/* Onboarding Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col space-y-6"
                >
                    <div className="space-y-1 mb-4">
                        <h2 className="text-white text-2xl font-black tracking-tight italic">Canteen Registration</h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Modernize your school's dining ecosystem</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Administrator Name */}
                    <div className="flex flex-col space-y-1">
                        <label className="text-white text-lg md:text-sm">Administrator Name</label>
                        <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                            <FaUser className="text-white text-base" />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full name of canteen lead"
                                className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                                required
                            />
                        </div>
                    </div>

                    {/* School Name */}
                    <div className="flex flex-col space-y-1">
                        <label className="text-white text-lg md:text-sm">School / Institution</label>
                        <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                            <FaSchool className="text-white text-base" />
                            <input
                                type="text"
                                name="canteenName"
                                placeholder="Official name of the school"
                                className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Number */}
                    <div className="flex flex-col space-y-1">
                        <label className="text-white text-lg md:text-sm">Contact Number</label>
                        <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                            <FaPhone className="text-white text-base" />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Primary contact for the canteen"
                                className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                                required
                            />
                        </div>
                    </div>

                    {/* Student Base */}
                    <div className="flex flex-col space-y-1">
                        <label className="text-white text-lg md:text-sm">Approx. Student Base</label>
                        <div className="flex items-center space-x-3 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                            <FaUsers className="text-white text-base" />
                            <input
                                type="number"
                                name="estimatedStudents"
                                placeholder="Total students served"
                                className="bg-transparent text-white outline-none w-full placeholder:text-white/20 text-sm py-1"
                                required
                            />
                        </div>
                    </div>

                    {/* Dynamic Location Selection */}
                    <div className="flex flex-col space-y-3">
                        <label className="text-white text-lg md:text-sm">Institutional Location</label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Province */}
                            <div className="flex items-center space-x-2 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                                <select
                                    className="bg-transparent text-white outline-none w-full text-xs py-1 [&>option]:bg-navblue [&>option]:text-white cursor-pointer"
                                    value={location.province}
                                    onChange={(e) => handleLocationChange('province', e.target.value)}
                                    required
                                >
                                    <option value="">Province</option>
                                    {Provinces().map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* District */}
                            <div className="flex items-center space-x-2 border-b border-white/30 pb-1 focus-within:border-shuleamber transition-all duration-300">
                                <select
                                    className="bg-transparent text-white outline-none w-full text-xs py-1 [&>option]:bg-navblue [&>option]:text-white cursor-pointer disabled:opacity-30"
                                    value={location.district}
                                    onChange={(e) => handleLocationChange('district', e.target.value)}
                                    disabled={!location.province}
                                    required
                                >
                                    <option value="">District</option>
                                    {location.province && Districts(location.province.toLowerCase())?.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-white text-navblue font-black py-4 px-6 rounded-full hover:bg-shuleamber hover:text-white active:scale-[0.98] transition-all transform duration-300 shadow-xl text-xs uppercase tracking-widest mt-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-navblue border-t-transparent rounded-full animate-spin"></div>
                                Registering Institution...
                            </>
                        ) : (
                            "Submit Application"
                        )}
                    </button>

                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="group flex flex-col items-center space-y-1"
                        >
                            <span className="text-white/40 text-lg">Already part of the network?</span>
                            <span className="text-white text-lg group-hover:text-shuleamber transition-colors">LOGIN HERE</span>
                        </button>
                    </div>

                    <footer className="flex flex-col items-center space-y-6 mt-12 pb-8">
                        <div className="flex items-center space-x-4">
                            <div className="h-[1px] w-12 bg-linear-to-r from-transparent to-white/10"></div>
                            <div className="flex items-center space-x-1.5 whitespace-nowrap">
                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Managed by</span>
                                <span className="text-white font-black text-lg leading-none tracking-tighter">
                                    EDU<span className="text-shuleamber">POTO</span>
                                </span>
                            </div>
                            <div className="h-[1px] w-12 bg-linear-to-l from-transparent to-white/10"></div>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-2 opacity-30">
                                <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                                <p className="text-white text-xs font-bold leading-relaxed">
                                    © {new Date().getFullYear()} Edupoto Global. All rights reserved.
                                </p>
                                <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                            </div>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default RegisterCanteenPage;
