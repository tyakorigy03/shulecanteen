import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineOfficeBuilding,
    HiOutlineIdentification,
    HiOutlineTag,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineExternalLink,
    HiOutlineArrowRight,
    HiOutlineQrcode
} from 'react-icons/hi';

const RegisterSupplierPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: '',
        category: '',
        tinNumber: '',
        contactPerson: '',
        phone: '',
        email: '',
    });
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [supplierId, setSupplierId] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = () => {
        const newId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        setSupplierId(newId);
        setIsOnboarded(true);
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-navblue">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/clients')}
                    className="w-10 h-10 rounded-xl bg-navblue/5 flex items-center justify-center hover:bg-navblue/10 transition-all border border-navblue/10 shrink-0"
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-navblue" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-2xl sm:text-3xl font-black italic">
                        {isOnboarded ? 'Onboarding' : 'Onboard'} <span className="text-shuleamber">{isOnboarded ? 'Complete' : 'New Supplier'}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-navblue/40 uppercase tracking-widest leading-none mt-1">Vendor Network Activation</p>
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
                                        { step: 1, label: 'Legal Entity' },
                                        { step: 2, label: 'Contact Mapping' }
                                    ].map((item, idx, arr) => (
                                        <div key={item.step} className={`flex ${idx !== arr.length - 1 ? 'flex-1' : ''} items-center relative h-10`}>
                                            <div className="flex flex-col items-center z-10 w-10">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step > item.step
                                                        ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30'
                                                        : step === item.step
                                                            ? 'bg-shuleamber border-shuleamber shadow-lg shadow-shuleamber/20'
                                                            : 'bg-navblue/5 border-navblue/10'
                                                        }`}
                                                >
                                                    {step > item.step ? (
                                                        <HiOutlineCheck className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <span className={`text-[13px] font-bold ${step === item.step ? 'text-navblue' : 'text-navblue/30'}`}>
                                                            {item.step}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute top-12 w-40 text-center pointer-events-none">
                                                    <span className={`text-xs font-semibold  ${step >= item.step ? 'text-navblue' : 'text-navblue/20'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </div>
                                            {idx !== arr.length - 1 && (
                                                <div className="flex-1 h-[2px] bg-navblue/5 mx-[-2px] relative z-0 mt-0">
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

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col mt-8">
                                <div className="p-8 sm:p-10 flex-1">
                                    {step === 1 ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold italic">Legal Business Identity</h3>
                                                <p className="text-xs text-navblue/40 font-bold uppercase tracking-widest">Verify Corporate Status</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-sm ml-1 font-bold">Registered Business Name</label>
                                                    <div className="relative">
                                                        <HiOutlineOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="businessName"
                                                            value={formData.businessName}
                                                            onChange={handleChange}
                                                            placeholder="Official Registered Name"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1 font-bold">Tax PIN / TIN</label>
                                                    <div className="relative">
                                                        <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="tinNumber"
                                                            value={formData.tinNumber}
                                                            onChange={handleChange}
                                                            placeholder="9-digit TIN"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue uppercase"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1 font-bold">Sector Category</label>
                                                    <div className="relative">
                                                        <HiOutlineTag className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <select
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleChange}
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-navblue appearance-none"
                                                        >
                                                            <option value="">Select Sector...</option>
                                                            <option value="Vegetables">Vegetables & Fruits</option>
                                                            <option value="Meat">Meat & Poultry</option>
                                                            <option value="Dry Goods">Dry Goods & grains</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold italic">Primary Contact Focal Point</h3>
                                                <p className="text-xs text-navblue/40 font-bold uppercase tracking-widest">Account Management Details</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-sm ml-1 font-bold">Focal Person Name</label>
                                                    <div className="relative">
                                                        <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="contactPerson"
                                                            value={formData.contactPerson}
                                                            onChange={handleChange}
                                                            placeholder="Full Business Contact Name"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1 font-bold">Business Phone</label>
                                                    <div className="relative">
                                                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            placeholder="07XX XXX XXX"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1 font-bold">Email Address</label>
                                                    <div className="relative">
                                                        <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            placeholder="vendor@shulecanteen.rw"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-between gap-4">
                                    {step === 1 ? (
                                        <>
                                            <button onClick={() => navigate('/clients')} className="px-8 py-4 text-sm font-black text-navblue/30 uppercase tracking-widest">Cancel</button>
                                            <button
                                                onClick={handleNext}
                                                disabled={!formData.businessName || !formData.tinNumber}
                                                className="bg-navblue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-shuleamber hover:text-navblue transition-all disabled:opacity-20"
                                            >
                                                Next Step
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleBack} className="px-8 py-4 text-sm font-black text-navblue/30 uppercase tracking-widest">Back</button>
                                            <button
                                                onClick={handleSubmit}
                                                className="bg-shuleamber text-navblue px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-shuleamber/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                Register Supplier
                                                <HiOutlineExternalLink className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-navblue print:shadow-none print:mt-0 print:rounded-none" id="supplier-certificate">
                            <div className="px-8 py-4 bg-gray-100 border-b border-gray-100 flex justify-between items-center no-print">
                                <button
                                    onClick={() => navigate('/clients')}
                                    className="px-6 py-2 bg-navblue text-white rounded-xl text-sm hover:bg-shuleamber hover:text-navblue transition-all shadow-sm flex items-center gap-2"
                                >
                                    <HiOutlineArrowRight className="w-4 h-4 rotate-180" />
                                    <span>Return to Hub</span>
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2 bg-white border border-gray-200 text-navblue rounded-xl text-xs hover:border-gray-300 transition-all flex items-center gap-2 font-bold"
                                >
                                    <HiOutlineExternalLink className="w-4 h-4" />
                                    <span>Print Certificate</span>
                                </button>
                            </div>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                @media print {
                                    body * { visibility: hidden; }
                                    #supplier-certificate, #supplier-certificate * { visibility: visible; }
                                    #supplier-certificate { position: absolute; left: 0; top: 0; width: 100%; }
                                    .no-print { display: none !important; }
                                }
                            `}} />

                            <div className="p-12 border-b border-gray-100 flex justify-between items-start">
                                <div className="flex flex-col gap-5">
                                    <h1 className="text-4xl font-black italic tracking-tighter">
                                        Supplier Network <br />
                                        <span className="text-shuleamber">Authorization</span>
                                    </h1>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-navblue/40 uppercase tracking-[0.2em]">Registry ID: {supplierId}</p>
                                        <p className="text-[10px] font-black text-navblue/20 uppercase tracking-[0.1em]">Onboarded: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                                    <HiOutlineQrcode className="w-28 h-28 text-navblue" />
                                </div>
                            </div>

                            <div className="p-12 sm:p-20 relative min-h-[500px]">
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                    <HiOutlineOfficeBuilding className="text-[300px] -rotate-12" />
                                </div>
                                <div className="space-y-10 relative z-10">
                                    {[
                                        { label: 'Registered Entity Name', value: formData.businessName },
                                        { label: 'Vendor Classification', value: formData.category },
                                        { label: 'Tax Identification (TIN)', value: formData.tinNumber },
                                        { label: 'Primary Focal Person', value: formData.contactPerson },
                                        { label: 'Verified Contact Line', value: formData.phone },
                                        { label: 'Activation Status', value: 'Active / Commissioned' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-8">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navblue/30 min-w-[220px]">
                                                {item.label}
                                            </span>
                                            <div className="flex-1 border-b border-dashed border-navblue/10 h-1"></div>
                                            <span className="text-base font-black italic">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-12 py-10 border-t border-gray-50 flex justify-between items-end bg-slate-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-navblue text-shuleamber rounded-[18px] flex items-center justify-center shadow-lg">
                                        <HiOutlineOfficeBuilding className="text-2xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase text-navblue tracking-widest italic">Shule Canteen</span>
                                        <span className="text-[8px] font-bold text-navblue/30 uppercase tracking-widest">Network Protocol Authorized</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-navblue/10 uppercase tracking-widest">Official Document</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="no-print">
                    <div className="bg-navblue rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-navblue/30">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="flex flex-col gap-8 z-10 relative">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <HiOutlineOfficeBuilding className="w-7 h-7 text-shuleamber" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-shuleamber text-navblue text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    Live Preview
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">New Entity</span>
                                <h4 className="text-2xl font-black italic leading-tight">{formData.businessName || 'Business Name'}</h4>
                                <span className="text-xs text-shuleamber font-bold uppercase tracking-widest">{formData.category || 'Category Pending'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterSupplierPage;
