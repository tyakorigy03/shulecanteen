import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineArrowLeft,
    HiOutlineUser,
    HiOutlineTruck,
    HiOutlineIdentification,
    HiOutlinePhone,
    HiOutlineCheckCircle,
    HiOutlineQrcode,
    HiOutlineExternalLink,
    HiOutlineCheck,
    HiOutlineArrowRight
} from 'react-icons/hi';

const RegisterDriverPage = () => {
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        vehicleType: '',
        plateNumber: '',
        idNumber: '',
    });
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [driverId, setDriverId] = useState('');
    const [tempPassword, setTempPassword] = useState('');

    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/driver/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    supplierId: user?.supplierId || supplier?.id
                })
            });

            const data = await response.json();
            if (data.success) {
                setDriverId(data.driverId);
                setTempPassword(data.account.tempPassword);
                setIsOnboarded(true);
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Failed to register driver');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/fleet')}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-2xl sm:text-3xl font-black italic">
                        {isOnboarded ? 'Onboarding' : 'Onboard'} <span className="text-shuleamber">{isOnboarded ? 'Complete' : 'New Driver'}</span>
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {!isOnboarded ? (
                        <>
                            {/* Step Indicator */}
                            <div className="px-12 pb-6">
                                <div className="flex items-center justify-center">
                                    {[
                                        { step: 1, label: 'Personnel Details' },
                                        { step: 2, label: 'Account Activation' }
                                    ].map((item, idx, arr) => (
                                        <div key={item.step} className={`flex ${idx !== arr.length - 1 ? 'flex-1' : ''} items-center relative h-10`}>
                                            <div className="flex flex-col items-center z-10 w-10">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step > item.step ? 'bg-green-500 border-green-500' : step === item.step ? 'bg-shuleamber border-shuleamber' : 'bg-white/10 border-white/10'}`}>
                                                    {step > item.step ? (
                                                        <HiOutlineCheck className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <span className={`text-[13px] font-bold ${step === item.step ? 'text-navblue' : 'text-white/30'}`}>
                                                            {item.step}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute top-12 w-40 text-center">
                                                    <span className={`text-xs font-semibold ${step >= item.step ? 'text-white' : 'text-white/30'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </div>
                                            {idx !== arr.length - 1 && (
                                                <div className="flex-1 h-[2px] bg-white/10 mx-[-2px] relative z-0">
                                                    <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500" style={{ width: step > item.step ? '100%' : '0%' }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                                <div className="p-8 sm:p-10 flex-1">
                                    {step === 1 ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-semibold text-navblue">Driver Information</h3>
                                                <p className="text-xs text-navblue/80 font-semibold">Fill in the basic identification details</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-navblue ml-1">Full Name</label>
                                                    <div className="relative">
                                                        <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleChange}
                                                            placeholder="e.g. John Doe"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-navblue focus:ring-2 focus:ring-shuleamber transition-all font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-navblue ml-1">Phone Number</label>
                                                    <div className="relative">
                                                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            placeholder="e.g. 0788000000"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-navblue focus:ring-2 focus:ring-shuleamber transition-all font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-navblue ml-1">Vehicle Type</label>
                                                    <div className="relative">
                                                        <HiOutlineTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="vehicleType"
                                                            value={formData.vehicleType}
                                                            onChange={handleChange}
                                                            placeholder="e.g. Toyota Dyna"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-navblue focus:ring-2 focus:ring-shuleamber transition-all font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-navblue ml-1">Plate Number</label>
                                                    <div className="relative">
                                                        <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="plateNumber"
                                                            value={formData.plateNumber}
                                                            onChange={handleChange}
                                                            placeholder="e.g. RAE 123A"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-navblue focus:ring-2 focus:ring-shuleamber transition-all font-bold uppercase"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-sm text-navblue ml-1">ID / Passport Number</label>
                                                    <div className="relative">
                                                        <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="idNumber"
                                                            value={formData.idNumber}
                                                            onChange={handleChange}
                                                            placeholder="1 19XX X XXXXXXX X XX"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-navblue focus:ring-2 focus:ring-shuleamber transition-all font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex flex-col gap-1 text-center">
                                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                                    <HiOutlineCheckCircle className="w-10 h-10 text-green-500" />
                                                </div>
                                                <h3 className="text-2xl font-black text-navblue">Activate Account</h3>
                                                <p className="text-sm text-navblue/60 max-w-sm mx-auto leading-relaxed">
                                                    The driver will use their phone number <span className="font-black text-navblue">{formData.phone}</span> to log in to the Driver App.
                                                </p>
                                            </div>

                                            {tempPassword && (
                                                <div className="bg-shuleamber/10 rounded-2xl p-6 text-center border border-shuleamber/20">
                                                    <p className="text-[10px] text-navblue/60 mb-1">Temporary PIN</p>
                                                    <p className="text-3xl font-black text-shuleamber tracking-wider">{tempPassword}</p>
                                                    <p className="text-[9px] text-navblue/40 mt-2">Share this PIN with the driver securely</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-between gap-4">
                                    {step === 1 ? (
                                        <>
                                            <button onClick={() => navigate('/fleet')} className="px-8 py-4 text-sm font-bold text-navblue/40 hover:text-navblue transition-colors">
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                disabled={!formData.fullName || !formData.phone || !formData.vehicleType || !formData.plateNumber || !formData.idNumber}
                                                className="px-8 py-4 bg-navblue text-white rounded-2xl font-bold text-sm hover:bg-shuleamber hover:text-navblue transition-all shadow-lg active:scale-95 disabled:opacity-20"
                                            >
                                                Next Step
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleBack} className="px-8 py-4 text-sm font-bold text-navblue/40 hover:text-navblue transition-colors">
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="flex-1 max-w-[280px] px-8 py-4 bg-shuleamber text-navblue rounded-2xl font-black text-sm hover:bg-white hover:shadow-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {loading ? 'Processing...' : 'Onboard & Send PIN'}
                                                <HiOutlineExternalLink className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-navblue">
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <HiOutlineCheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-navblue mb-2">Driver Onboarded Successfully!</h3>
                                <p className="text-navblue/60 mb-6">Driver ID: {driverId}</p>
                                
                                <div className="bg-shuleamber/10 rounded-2xl p-6 mb-8 text-left">
                                    <p className="text-sm font-bold text-navblue mb-2">Login Credentials:</p>
                                    <p className="text-sm">Phone: <span className="font-bold">{formData.phone}</span></p>
                                    <p className="text-sm">Temporary PIN: <span className="font-bold text-shuleamber">{tempPassword}</span></p>
                                </div>

                                <button
                                    onClick={() => navigate('/fleet')}
                                    className="bg-navblue text-white px-8 py-3 rounded-xl font-bold hover:bg-shuleamber hover:text-navblue transition-all"
                                >
                                    Return to Fleet Hub
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Preview */}
                <div className="flex flex-col gap-6 no-print">
                    <div className="bg-navblue rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-navblue/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="flex flex-col gap-6 z-10 relative">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <HiOutlineTruck className="w-6 h-6 text-shuleamber" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest">Preview</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs opacity-50 font-bold uppercase">Assigned Personnel</span>
                                <h4 className="text-xl font-black">{formData.fullName || 'New Driver'}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] opacity-40 font-bold">Phone</span>
                                    <span className="text-xs font-bold">{formData.phone || '---'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] opacity-40 font-bold">Plate</span>
                                    <span className="text-xs font-bold">{formData.plateNumber || '---'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterDriverPage;