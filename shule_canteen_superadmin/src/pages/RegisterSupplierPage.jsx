import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
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
    HiOutlineQrcode,
    HiOutlineLocationMarker,
    HiOutlinePhotograph,
    HiOutlineShieldCheck
} from 'react-icons/hi';

const RegisterSupplierPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [provisionedAccounts, setProvisionedAccounts] = useState([]);
    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
    const [formData, setFormData] = useState({
        businessName: '',
        category: '',
        tinNumber: '',
        contactPerson: '',
        phone: '',
        email: '',
        province: '',
        district: '',
        logoUrl: '', // base64 placeholder for now
    });
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [supplierId, setSupplierId] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const newId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
            const submissionData = {
                id: newId,
                companyName: formData.businessName,
                name: formData.businessName, // Standardized
                category: formData.category,
                tinNumber: formData.tinNumber,
                fullName: formData.contactPerson,
                contactPerson: formData.contactPerson, // Standardized
                phone: formData.phone,
                email: formData.email,
                province: formData.province,
                district: formData.district,
                logoUrl: formData.logoUrl,
                status: 'active',
                entityType: 'supplier',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'onboarding_requests', newId), submissionData);

            // 2. Provision Supplier Account (as role 'supplier')
            const staffResponse = await fetch(`${API_BASE}/canteen/provision-staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schoolCode: 'SUPPLIER_HUB', // Dummy school code for suppliers
                    staffList: [{
                        id: 'SUP-ADMIN',
                        name: formData.contactPerson,
                        phone: formData.phone,
                        email: formData.email,
                        role: 'Supplier'
                    }]
                })
            });

            const staffData = await staffResponse.json();
            if (staffData.success) {
                setProvisionedAccounts(staffData.accounts);
            }

            setSupplierId(newId);
            setIsOnboarded(true);
        } catch (err) {
            console.error('Registration Error:', err);
            alert('Failed to register supplier. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/suppliers')}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-2xl sm:text-3xl font-black italic text-white">
                        {isOnboarded ? 'Onboarding' : 'Onboard'} <span className="text-shuleamber">{isOnboarded ? 'Complete' : 'New Supplier'}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1 text-white">Vendor Network Activation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {!isOnboarded ? (
                        <>
                            {/* Step Indicator */}
                            <div className="px-12 pb-6">
                                <div className="flex items-center justify-center text-white">
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
                                                <div className="absolute top-12 w-40 text-center pointer-events-none">
                                                    <span className={`text-xs font-semibold  ${step >= item.step ? 'text-white' : 'text-white/30'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </div>
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

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col mt-8">
                                <div className="p-8 sm:p-10 flex-1 text-navblue">
                                    {step === 1 ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold italic">Legal Business Identity</h3>
                                                <p className="text-xs text-navblue/40 font-bold uppercase tracking-widest">Verify Corporate Status</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-sm ml-1 font-bold">Business Logo / Identity</label>
                                                    <div className="flex items-center gap-6 bg-navblue/5 border-2 border-dashed border-navblue/10 rounded-2xl p-6 transition-all hover:bg-navblue/[0.08]">
                                                        <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                                                            {formData.logoUrl ? (
                                                                <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <HiOutlinePhotograph className="w-10 h-10 text-navblue opacity-10" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                onChange={handleLogoUpload}
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                accept="image/*"
                                                                id="logo-upload"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <h4 className="text-xs font-black text-navblue">Company Branding</h4>
                                                            <p className="text-[10px] text-navblue/40 font-bold leading-relaxed italic">
                                                                Upload a high-fidelity logo (PNG/JPG). This will appear on all official network documents.
                                                            </p>
                                                            <label htmlFor="logo-upload" className="text-[10px] font-black text-shuleamber uppercase tracking-widest cursor-pointer hover:underline mt-2">
                                                                Select File
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

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
                                                            <option value="Beverages">Beverages</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1 font-bold">Province</label>
                                                    <div className="relative">
                                                        <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <select
                                                            name="province"
                                                            value={formData.province}
                                                            onChange={handleChange}
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-navblue appearance-none"
                                                        >
                                                            <option value="">Select Province...</option>
                                                            <option value="Kigali">Kigali City</option>
                                                            <option value="North">Northern Province</option>
                                                            <option value="South">Southern Province</option>
                                                            <option value="East">Eastern Province</option>
                                                            <option value="West">Western Province</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1 font-bold">District</label>
                                                    <div className="relative">
                                                        <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/20 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="district"
                                                            value={formData.district}
                                                            onChange={handleChange}
                                                            placeholder="District Name"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
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
                                            <button onClick={() => navigate('/suppliers')} className="px-8 py-4 text-sm font-black text-navblue/30 uppercase tracking-widest">Cancel</button>
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
                                                disabled={loading || !formData.email || !formData.phone}
                                                className="bg-shuleamber text-navblue px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-shuleamber/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Register Supplier
                                                        <HiOutlineExternalLink className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Professional Supplier Onboarding Document */
                        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-navblue print:shadow-none print:mt-0 print:rounded-none" id="supplier-document">
                            {/* Footer Actions - Hidden in Print */}
                            <div className="px-8 py-4 bg-gray-100 border-b border-gray-100 flex justify-between items-center no-print">
                                <button
                                    onClick={() => navigate('/suppliers')}
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
                                    <span>Print Documentation</span>
                                </button>
                            </div>

                            {/* Institutional Print View */}
                            <div className="hidden bg-white text-navblue border-[8px] border-double border-navblue/10 m-auto relative h-full flex flex-col print:flex print:static" id="supplier-print-document">
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @media print {
                                        body * { visibility: hidden; }
                                        #supplier-print-document, #supplier-print-document * { visibility: visible; }
                                        #supplier-print-document { 
                                            position: absolute !important;
                                            left: 0 !important;
                                            top: 0 !important;
                                            width: 210mm !important;
                                            height: 297mm !important;
                                            display: flex !important; 
                                            flex-direction: column !important;
                                            background: white !important;
                                            margin: 0 !important;
                                            padding: 15mm !important;
                                            box-sizing: border-box !important;
                                        }
                                        .no-print { display: none !important; }
                                        @page { margin: 0; size: auto; }
                                    }
                                `}} />
                                {/* Decorative Corners */}
                                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-navblue/20"></div>
                                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-navblue/20"></div>
                                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-navblue/20"></div>
                                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-navblue/20"></div>

                                {/* Document Header */}
                                <div className="p-12 pb-8 flex justify-between items-start">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 bg-navblue/5 border-2 border-navblue/10 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
                                                {formData.logoUrl ? (
                                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <HiOutlineOfficeBuilding className="w-12 h-12 text-navblue opacity-20" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h1 className="text-[42px] font-black italic tracking-tighter leading-none text-navblue">
                                                    Supplier <span className="text-shuleamber underline decoration-shuleamber/30 decoration-4 underline-offset-8">Authorization</span>
                                                </h1>
                                                <div className="flex items-center gap-3 mt-4">
                                                    <HiOutlineShieldCheck className="text-shuleamber w-5 h-5" />
                                                    <p className="text-[13px] font-black text-navblue/50 uppercase tracking-[0.4em]">Official Registry Certificate</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-10">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-navblue/30 tracking-widest">Registry ID</span>
                                                <p className="text-sm font-black text-navblue italic">#{supplierId}</p>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-navblue/30 tracking-widest">Issuance Date</span>
                                                <p className="text-sm font-black text-navblue italic">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 translate-y-4">
                                        <div className="p-4 bg-white border-2 border-navblue/5 rounded-[2rem] shadow-xl">
                                            <QRCodeSVG
                                                value={`${import.meta.env.VITE_QR_BASE_URL}/profile/${supplierId}`}
                                                size={140}
                                                level="H"
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-navblue/30 uppercase tracking-[0.3em]">Institutional Verification</span>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 px-12 py-10 relative">
                                    {/* Watermark Expansion */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                                        <h1 className="text-[200px] font-black italic -rotate-15 select-none uppercase tracking-tighter">Authorized</h1>
                                    </div>

                                    <div className="max-w-4xl mx-auto relative z-10">
                                        {/* Information Grid */}
                                        <div className="space-y-10">
                                            {[
                                                { label: 'Registered Entity Name', value: formData.businessName },
                                                { label: 'Vendor Classification', value: formData.category || 'General Supplier' },
                                                { label: 'Tax Identification (TIN)', value: formData.tinNumber || 'UNAVAILABLE' },
                                                { label: 'Primary Focal Person', value: formData.contactPerson },
                                                { label: 'Verified Contact Line', value: formData.phone },
                                                { label: 'Sector Commission Status', value: 'Active / Commissioned' },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-10 border-b border-navblue/5 pb-4">
                                                    <div className="flex flex-col items-start min-w-[280px]">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-navblue/30 leading-none mb-1">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[19px] font-black italic text-navblue tracking-tight">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Staff Credentials Table */}
                                        {provisionedAccounts.length > 0 && (
                                            <div className="mt-12 pt-12 border-t border-gray-100 no-print">
                                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-navblue mb-6">Portal Access Credentials</h4>
                                                <div className="overflow-hidden border border-gray-100 rounded-2xl">
                                                    <table className="w-full text-left text-[11px] border-collapse bg-white">
                                                        <thead className="bg-navblue text-white text-[9px] uppercase tracking-widest font-black">
                                                            <tr>
                                                                <th className="px-5 py-3 border-r border-white/10 uppercase">Identity / Role</th>
                                                                <th className="px-5 py-3 border-r border-white/10 uppercase">System Username</th>
                                                                <th className="px-5 py-3 uppercase text-shuleamber">Temp Password</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {provisionedAccounts.map((acc) => (
                                                                <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-black text-navblue uppercase tracking-tighter">{acc.name}</span>
                                                                            <span className="text-[8px] font-bold text-navblue/40 uppercase tracking-widest">{acc.role}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-4 font-mono font-bold text-navblue opacity-80">{acc.phone}</td>
                                                                    <td className="px-5 py-4 font-mono font-black text-shuleamber tracking-wider">{acc.tempPassword}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <p className="mt-4 text-[9px] text-navblue/40 font-bold italic">Please use these credentials to access the Shule Canteen Supplier Portal.</p>
                                            </div>
                                        )}

                                        {/* Statement & Legality */}
                                        <div className="mt-16 flex gap-12 items-start">
                                            <div className="w-1 bg-shuleamber h-24 rounded-full opacity-20"></div>
                                            <div className="flex-1">
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-navblue mb-4">Official Commissioning Statement</h4>
                                                <p className="text-[13px] text-navblue/60 leading-relaxed italic font-medium">
                                                    This document certifies that the organization listed above is officially recognized as an authorized supplier within the Shule Canteen ecosystem. The entity has PASSED all compliance audits and is authorized to participate in procurement cycles across the network.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Signature Block */}
                                        <div className="mt-24 flex justify-between items-end border-t border-navblue/5 pt-12">
                                            <div className="flex flex-col items-start">
                                                <div className="h-20 w-48 border-b-2 border-navblue/20 relative">
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 italic text-navblue select-none font-bold">Authorized Signature</div>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-navblue/30 mt-3">Registrar General</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="w-32 h-32 border-4 border-navblue/5 rounded-full flex items-center justify-center border-dashed">
                                                    <div className="w-24 h-24 border-2 border-shuleamber/10 rounded-full flex items-center justify-center italic text-[9px] font-black text-shuleamber/20 uppercase tracking-widest text-center">Digital<br />Stamp</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Branding Area */}
                                <div className="p-12 border-t-2 border-navblue/10 flex justify-between items-end bg-navblue/5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-navblue text-shuleamber rounded-[15px] flex items-center justify-center shadow-xl">
                                                <HiOutlineOfficeBuilding className="text-2xl" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black uppercase text-navblue tracking-widest italic leading-none">Shule Canteen</span>
                                                <span className="text-[9px] font-black text-navblue/40 uppercase tracking-[0.4em] mt-2">Official Network Protocol</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-navblue/10 uppercase tracking-[0.5em] mb-2">Authentic Physical Record</p>
                                        <p className="text-[12px] text-navblue/30 font-bold tracking-tight">System Infrastructure Powered by <span className="text-navblue/60 underline decoration-shuleamber/30 decoration-2 underline-offset-4">EduPoto</span></p>
                                    </div>
                                </div>
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
