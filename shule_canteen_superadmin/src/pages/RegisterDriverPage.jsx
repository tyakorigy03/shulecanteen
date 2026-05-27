import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineUser,
    HiOutlineTruck,
    HiOutlineIdentification,
    HiOutlinePhone,
    HiOutlineCheckCircle,
    HiOutlineQrcode,
    HiOutlineExternalLink,
    HiOutlineMail,
    HiOutlineCheck,
    HiOutlineArrowRight
} from 'react-icons/hi';

const RegisterDriverPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        vehicleType: '',
        plateNumber: '',
        idNumber: '',
    });
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [driverId, setDriverId] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = () => {
        // Generate a mock driver ID
        const newId = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
        setDriverId(newId);
        setIsOnboarded(true);
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
                {/* Left Column: Form or Document */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {!isOnboarded ? (
                        <>
                            <div className="px-12 pb-6">
                                <div className="flex items-center justify-center">
                                    {[
                                        { step: 1, label: 'Personnel Details' },
                                        { step: 2, label: 'Account Activation' }
                                    ].map((item, idx, arr) => (
                                        <div key={item.step} className={`flex ${idx !== arr.length - 1 ? 'flex-1' : ''} items-center relative h-10`}>
                                            <div className="flex flex-col items-center z-10 w-10">
                                                {/* Circle */}
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step > item.step
                                                        ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30'
                                                        : step === item.step
                                                            ? 'bg-shuleamber border-shuleamber shadow-lg shadow-shuleamber/20'
                                                            : 'bg-white/10 border-white/10'
                                                        }`}
                                                >
                                                    {step > item.step ? (
                                                        <HiOutlineCheck className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <span className={`text-[13px] font-bold ${step === item.step ? 'text-navblue' : 'text-white/30'}`}>
                                                            {item.step}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Label */}
                                                <div className="absolute top-12 w-40 text-center pointer-events-none">
                                                    <span className={`text-xs font-semibold  ${step >= item.step ? 'text-white' : 'text-white/30'
                                                        }`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Connecting Line */}
                                            {idx !== arr.length - 1 && (
                                                <div className="flex-1 h-[2px] bg-white/10 mx-[-2px] relative z-0 mt-0">
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
                                                        style={{ width: step > item.step ? '100%' : '0%' }}
                                                    />
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
                                                <p className="text-xs text-navblue/80 font-semibold ">Fill in the basic identification details</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-navblue  ml-1">Full Name</label>
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
                                                    <label className="text-sm text-navblue  ml-1">Phone Number</label>
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

                                            <div className="bg-navblue/5 rounded-3xl p-6 border border-dashed border-navblue/10">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-shuleamber/20 rounded-xl flex items-center justify-center shrink-0">
                                                        <HiOutlineMail className="w-5 h-5 text-shuleamber" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-navblue">Instant Notification</h4>
                                                        <p className="text-xs text-navblue/50 mt-1 leading-relaxed">
                                                            We will send an SMS to {formData.phone} containing a temporary PIN and a download link for the driver application.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                                    NOTE: Drivers are required to change their temporary PIN upon first login for security purposes.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-between gap-4">
                                    {step === 1 ? (
                                        <>
                                            <button
                                                onClick={() => navigate('/fleet')}
                                                className="px-8 py-4 text-sm font-bold text-navblue/40 hover:text-navblue transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                disabled={!formData.fullName || !formData.phone || !formData.vehicleType || !formData.plateNumber || !formData.idNumber}
                                                className="px-8 py-4 bg-navblue text-white rounded-2xl font-bold text-sm hover:bg-shuleamber hover:text-navblue transition-all shadow-lg active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
                                            >
                                                Next Step
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleBack}
                                                className="px-8 py-4 text-sm font-bold text-navblue/40 hover:text-navblue transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                className="flex-1 max-w-[280px] px-8 py-4 bg-shuleamber text-navblue rounded-2xl font-black text-sm hover:bg-white hover:shadow-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span>Onboard & Send PIN</span>
                                                <HiOutlineExternalLink className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Driver Onboarding Document - Inline View */
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-navblue print:shadow-none print:mt-0 print:rounded-none" id="onboarding-document">
                            {/* Footer Actions - Hidden in Print */}
                            <div className="px-8 py-4 bg-gray-200 border-b border-gray-100 flex justify-between items-center no-print">
                                <button
                                    onClick={() => navigate('/fleet')}
                                    className="px-6 py-2 bg-navblue text-white rounded-xl text-sm hover:bg-shuleamber hover:text-navblue transition-all shadow-sm flex items-center gap-2"
                                >
                                    <HiOutlineArrowRight className="w-4 h-4 rotate-180" />
                                    <span>Return to Fleet Hub</span>
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2 bg-white border border-gray-200 text-navblue rounded-xl  text-xs hover:text-navblue hover:border-gray-300 transition-all flex items-center gap-2"
                                >
                                    <HiOutlineExternalLink className="w-4 h-4" />
                                    <span>Print Documentation</span>
                                </button>
                            </div>
                            {/* Print-specific Styles */}
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                @media print {
                                    body * { visibility: hidden; }
                                    #onboarding-document, #onboarding-document * { visibility: visible; }
                                    #onboarding-document { position: absolute; left: 0; top: 0; width: 100%; }
                                    .no-print { display: none !important; }
                                }
                            `}} />

                            {/* Document Header with QR and Date on Right */}
                            <div className="p-10 sm:p-12 border-b border-gray-100 flex justify-between items-start">
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-3xl font-bold leading-none">
                                        Staff Onboarding <br />
                                        <span className="text-shuleamber">Document</span>
                                    </h1>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-navblue/80 font-medium">Driver ID: {driverId}</p>
                                        <p className="text-xs text-navblue/80 font-medium">Issued Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <HiOutlineQrcode className="w-[100px] h-[100px] text-navblue" />
                                    </div>
                                    <span className="text-[8px] font-medium text-navblue/20 tracking-wider">Portal ID Verification</span>
                                </div>
                            </div>

                            {/* Document Body Area */}
                            <div className="p-10 sm:p-16 relative min-h-[500px]">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                    <h1 className="text-[100px] font-bold italic -rotate-12 select-none uppercase">Verified</h1>
                                </div>

                                <div className="max-w-3xl space-y-10 relative z-10">
                                    {/* Data Rows */}
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Personnel Full Name', value: formData.fullName },
                                            { label: 'Primary Contact Number', value: formData.phone },
                                            { label: 'Identity Document No', value: formData.idNumber },
                                            { label: 'Assigned Vehicle Unit', value: formData.vehicleType },
                                            { label: 'License Plate Registration', value: formData.plateNumber },
                                            { label: 'Employment Status', value: 'Active / Onboarded' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-6 group">
                                                <span className="text-sm  text-navblue min-w-[200px]">
                                                    {item.label}
                                                </span>
                                                <div className="flex-1 border-b border-dashed border-gray-200 h-4 mx-2 opacity-20"></div>
                                                <span className={`text-sm font-semibold ${item.label.includes('Plate') ? 'text-shuleamber bg-navblue px-3 py-1 rounded-lg' : ''}`}>
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Authentication Message */}
                                    <div className="pt-10">
                                        <p className="text-xs text-navblue/40 leading-relaxed italic max-w-xl">
                                            The individual listed above is officially recognized as a commissioned personnel within the Shule Canteen Supplier Network. Digital credentials have been dispatched to the verified contact number.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Document Footer Branding - Visible in Print */}
                            <div className="px-10 sm:px-16 py-8 border-t border-gray-50 flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <img src="/logo.png" alt="Shule Canteen" className="w-8 h-8 object-contain" />
                                        <span className="text-xs font-bold text-navblue">Shule Canteen</span>
                                    </div>
                                    <span className="text-[9px] text-navblue/40 font-medium">Official Supplier Portal</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-navblue/30 font-medium">Powered by <span className="font-bold text-navblue/60">EduPoto</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar area - Persistent */}
                <div className="flex flex-col gap-6 no-print">
                    {/* Live Preview Card */}
                    <div className="bg-navblue rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-navblue/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex flex-col gap-6 z-10 relative">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <HiOutlineTruck className="w-6 h-6 text-shuleamber" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/10">
                                    Preview
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs opacity-50 font-bold uppercase tracking-widest">Assigned Personnel</span>
                                <h4 className="text-xl font-black">{formData.fullName || 'New Driver'}</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] opacity-40 font-bold uppercase">Phone</span>
                                    <span className="text-xs font-bold">{formData.phone || '---'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] opacity-40 font-bold uppercase">Plate</span>
                                    <span className="text-xs font-bold">{formData.plateNumber || '---'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center gap-6 shadow-sm">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <HiOutlineQrcode className="w-10 h-10 text-navblue/20" />
                            <h4 className="text-sm font-black text-navblue uppercase tracking-widest">Driver Application</h4>
                            <p className="text-[10px] text-navblue/40 font-bold leading-relaxed px-4">
                                Scan the QR code to download the official Shule Canteen Driver App
                            </p>
                        </div>

                        <div className="w-32 h-32 bg-navblue/5 rounded-2xl flex items-center justify-center border-2 border-dashed border-navblue/10 relative group cursor-pointer hover:border-shuleamber/40 transition-all">
                            {/* Mock QR Code UI */}
                            <div className="grid grid-cols-4 gap-1 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className={`w-4 h-4 rounded-sm ${i % 3 === 0 ? 'bg-navblue' : 'bg-transparent'}`}></div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                    <div className="w-4 h-4 bg-shuleamber rounded-sm"></div>
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
