import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineLibrary,
    HiOutlineLocationMarker,
    HiOutlineUser,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineExternalLink,
    HiOutlineCheck,
    HiOutlineArrowRight,
    HiOutlineQrcode,
    HiOutlineOfficeBuilding,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineX
} from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const RegisterCanteenPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolId: '',
        location: '',
        manager: '',
        capacity: '',
        block: '',
        canteenEmail: '',
        canteenPhone: '',
    });
    const [staffList, setStaffList] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: '', role: 'Manager', phone: '' });
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [registryId, setRegistryId] = useState('');
    const [provisionedAccounts, setProvisionedAccounts] = useState([]);

    const [schools, setSchools] = useState([]);
    const [fetchingSchools, setFetchingSchools] = useState(true);

    const API_BASE = '/api';

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch(`${API_BASE}/canteen/schools`);
                const data = await response.json();
                if (data.success) {
                    setSchools(data.schools);
                }
            } catch (err) {
                console.error('Error fetching schools:', err);
            } finally {
                setFetchingSchools(false);
            }
        };
        fetchSchools();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Handle school selection auto-fill
        if (name === 'schoolName') {
            handleSchoolSelectionByName(value);
        }
    };

    const handleSchoolSelectionByName = async (schoolName) => {
        const school = schools.find(s => s.name === schoolName);
        if (school) {
            const schoolLoc = `${school.sector}, ${school.district}, ${school.province}`;
            setFormData(prev => ({
                ...prev,
                schoolName: school.name,
                schoolCode: school.code,
                location: schoolLoc,
                province: school.province,
                district: school.district,
                sector: school.sector
            }));
            // Fetch stats
            try {
                const response = await fetch(`${API_BASE}/canteen/school-stats/${school.id}`);
                const data = await response.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        schoolName: school.name,
                        schoolCode: school.code,
                        location: schoolLoc,
                        capacity: data.count,
                        province: school.province,
                        district: school.district,
                        sector: school.sector
                    }));
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        }
    };

    const addStaff = () => {
        if (!newStaff.name || !newStaff.phone) return;
        setStaffList([...staffList, { ...newStaff, id: Date.now() }]);
        setNewStaff({ name: '', role: 'Manager', phone: '' });
    };

    const removeStaff = (sid) => {
        setStaffList(staffList.filter(s => s.id !== sid));
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const newId = `CAN-${Math.floor(1000 + Math.random() * 9000)}`;
            const submissionData = {
                ...formData,
                fullName: staffList[0]?.name || 'Not Assigned',
                email: formData.canteenEmail || '',
                phone: formData.canteenPhone || '',
                staffList,
                entityType: 'canteen',
                status: 'active',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'onboarding_requests', newId), submissionData);

            // 2. Provision Staff Accounts
            if (staffList.length > 0) {
                const staffResponse = await fetch(`${API_BASE}/canteen/provision-staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        schoolCode: formData.schoolCode,
                        staffList: staffList
                    })
                });
                const staffData = await staffResponse.json();
                if (staffData.success) {
                    setProvisionedAccounts(staffData.accounts);
                }
            }

            setRegistryId(newId);
            setIsOnboarded(true);
        } catch (err) {
            console.error('Canteen Registration Error:', err);
            alert('Failed to register canteen. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/canteens')}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-2xl sm:text-3xl font-black italic">
                        {isOnboarded ? 'Onboarding' : 'Onboard'} <span className="text-shuleamber">{isOnboarded ? 'Complete' : 'Canteen Facility'}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1">Registry Management System</p>
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
                                        { step: 1, label: 'Facility Info' },
                                        { step: 2, label: 'Operations & Staff' }
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

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col mt-8">
                                <div className="p-8 sm:p-10 flex-1 text-navblue">
                                    {step === 1 ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-semibold">School Selection</h3>
                                                <p className="text-xs text-navblue/80 font-semibold ">Identify the school hosting the facility</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-sm ml-1">Select School</label>
                                                    <div className="relative">
                                                        <HiOutlineLibrary className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <select
                                                            name="schoolName"
                                                            value={formData.schoolName}
                                                            onChange={handleChange}
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-navblue focus:ring-2 focus:ring-shuleamber transition-all appearance-none disabled:opacity-50"
                                                            disabled={fetchingSchools}
                                                        >
                                                            <option value="">{fetchingSchools ? 'Loading schools...' : 'Choose a registered school...'}</option>
                                                            {schools.map(s => <option key={s.id || s.code} value={s.name}>{s.name} ({s.code})</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1">Canteen Email (Optional)</label>
                                                    <div className="relative">
                                                        <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                                                        <input
                                                            type="email"
                                                            name="canteenEmail"
                                                            value={formData.canteenEmail}
                                                            onChange={handleChange}
                                                            placeholder="canteen@school.com"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1">Canteen Phone (Optional)</label>
                                                    <div className="relative">
                                                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="canteenPhone"
                                                            value={formData.canteenPhone}
                                                            onChange={handleChange}
                                                            placeholder="+250..."
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1">Specific Location (Optional)</label>
                                                    <div className="relative">
                                                        <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={formData.location}
                                                            onChange={handleChange}
                                                            placeholder="e.g. Building B, Ground Floor"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm ml-1">Facility Block ID (Optional)</label>
                                                    <div className="relative">
                                                        <HiOutlineOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-navblue/30 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            name="block"
                                                            value={formData.block}
                                                            onChange={handleChange}
                                                            placeholder="e.g. BLK-10"
                                                            className="w-full bg-navblue/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-navblue uppercase"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Small Metadata Table */}
                                                {(formData.schoolName || formData.location) && (
                                                    <div className="md:col-span-2 bg-navblue/5 p-4 rounded-2xl border border-navblue/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-navblue/40 mb-3 block">Facility Snapshot</span>
                                                        <table className="w-full text-left text-[11px] font-bold text-navblue">
                                                            <tbody className="divide-y divide-navblue/5">
                                                                <tr>
                                                                    <td className="py-2 opacity-50 uppercase tracking-tighter w-1/3">Target School</td>
                                                                    <td className="py-2 italic">{formData.schoolName || '---'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="py-2 opacity-50 uppercase tracking-tighter">Verified Location</td>
                                                                    <td className="py-2 italic">{formData.location || '---'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="py-2 opacity-50 uppercase tracking-tighter">Capacity PAX</td>
                                                                    <td className="py-2 text-shuleamber">{formData.capacity || '0'} Students</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-semibold">Staffing & Operations</h3>
                                                <p className="text-xs text-navblue/80 font-semibold ">Identify and add facility manager(s)</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-sm ml-1 font-bold">Facility Managers / Staff</label>
                                                    <div className="bg-navblue/5 p-4 rounded-2xl border border-navblue/10">
                                                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                                            <input
                                                                type="text"
                                                                value={newStaff.name}
                                                                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                                                placeholder="Full Name"
                                                                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold font-outfit text-navblue outline-none"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={newStaff.phone}
                                                                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                                                placeholder="Phone Number"
                                                                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold font-outfit text-navblue outline-none"
                                                            />
                                                            <select
                                                                value={newStaff.role}
                                                                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                                                className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold font-outfit text-navblue outline-none"
                                                            >
                                                                <option>Manager</option>
                                                                <option>Accountant</option>
                                                                <option>Operator</option>
                                                            </select>
                                                            <button
                                                                onClick={addStaff}
                                                                className="bg-navblue text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-shuleamber hover:text-navblue transition-all"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>

                                                        {staffList.length > 0 ? (
                                                            <div className="overflow-hidden border border-gray-100 rounded-xl">
                                                                <table className="w-full text-left text-xs border-collapse bg-white">
                                                                    <thead className="bg-navblue text-white text-[9px] uppercase tracking-widest font-black">
                                                                        <tr>
                                                                            <th className="px-4 py-2 border-r border-white/10">Full Name</th>
                                                                            <th className="px-4 py-2 border-r border-white/10">Phone Number</th>
                                                                            <th className="px-4 py-2 border-r border-white/10 text-center">Role</th>
                                                                            <th className="px-4 py-2 text-center">Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-50">
                                                                        {staffList.map((s) => (
                                                                            <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                                                                                <td className="px-4 py-3 font-bold text-navblue">{s.name}</td>
                                                                                <td className="px-4 py-3 font-medium opacity-60 italic">{s.phone}</td>
                                                                                <td className="px-4 py-3 text-center">
                                                                                    <span className="px-2 py-0.5 rounded-full bg-navblue/5 text-[8px] font-black uppercase tracking-tighter text-navblue">
                                                                                        {s.role}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-center">
                                                                                    <button onClick={() => removeStaff(s.id)} className="w-6 h-6 rounded-md bg-red-50 text-red-500 mx-auto hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                                                                        <HiOutlineX className="w-3 h-3" />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-center text-navblue/20 italic p-6 font-bold tracking-widest uppercase">No staff members registered in current session</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 md:col-span-2">
                                                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                                        VERIFICATION: Ensure the facility managers are certified staff members with active employment IDs in the backend system.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-between gap-4">
                                    {step === 1 ? (
                                        <>
                                            <button onClick={() => navigate('/canteens')} className="px-8 py-4 text-sm font-bold text-navblue/40 uppercase tracking-widest">Cancel</button>
                                            <button
                                                onClick={handleNext}
                                                disabled={!formData.schoolName}
                                                className="bg-navblue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-shuleamber hover:text-navblue transition-all disabled:opacity-20"
                                            >
                                                Next Step
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleBack} className="px-8 py-4 text-sm font-bold text-navblue/40 uppercase tracking-widest">Back</button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading || !formData.schoolName}
                                                className="bg-shuleamber text-navblue px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-shuleamber/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Complete Onboarding
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
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-navblue print:shadow-none print:mt-0 print:rounded-none" id="registry-document">
                            <div className="px-8 py-4 bg-gray-200 border-b border-gray-100 flex justify-between items-center no-print">
                                <button
                                    onClick={() => navigate('/canteens')}
                                    className="px-6 py-2 bg-navblue text-white rounded-xl text-sm hover:bg-shuleamber hover:text-navblue transition-all shadow-sm flex items-center gap-2"
                                >
                                    <HiOutlineArrowRight className="w-4 h-4 rotate-180" />
                                    <span>Return to Registry</span>
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2 bg-white border border-gray-200 text-navblue rounded-xl text-xs hover:text-navblue hover:border-gray-300 transition-all flex items-center gap-2"
                                >
                                    <HiOutlineExternalLink className="w-4 h-4" />
                                    <span>Print Registration</span>
                                </button>
                            </div>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                @media print {
                                    body * { visibility: hidden; }
                                    #canteen-print-document,
                                    #canteen-print-document * { visibility: visible; }
                                    #canteen-print-document {
                                        position: absolute !important;
                                        left: 0 !important;
                                        top: 0 !important;
                                        width: 100% !important;
                                        max-width: 210mm !important;
                                        min-height: 297mm !important;
                                        display: flex !important;
                                        flex-direction: column !important;
                                        background: white !important;
                                        margin: 0 !important;
                                        padding: 15mm !important;
                                        box-sizing: border-box !important;
                                        color: #111 !important;
                                    }
                                    .no-print { display: none !important; }
                                    @page { margin: 0; size: A4 portrait; }
                                }
                            `}} />

                            {/* ── Standardized Print Document ────────────────────────────────────────── */}
                            <div
                                id="canteen-print-document"
                                style={{
                                    display: 'none',
                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                    color: '#111',
                                    background: '#fff',
                                    fontSize: '12pt',
                                    lineHeight: '1.6',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <p style={{ fontSize: '9pt', color: '#555', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>SHULE CANTEEN FACILITY REGISTRY</p>
                                        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 4px 0' }}>Canteen Authorization Profile</h1>
                                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Official School Facility Record</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ border: '1px solid #ddd', padding: '8px', display: 'inline-block' }}>
                                            <QRCodeSVG
                                                value={`${import.meta.env.VITE_QR_BASE_URL}/profile/canteen/${registryId}`}
                                                size={90}
                                                level="H"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '40px', marginBottom: '28px', fontSize: '9pt', color: '#444' }}>
                                    <div>
                                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Facility ID</span>
                                        <span style={{ fontWeight: 'bold', color: '#111' }}>#{registryId}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Registry Status</span>
                                        <span style={{ fontWeight: 'bold', color: '#111', textTransform: 'capitalize' }}>ACTIVE</span>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '11pt' }}>
                                    <tbody>
                                        {[
                                            { label: 'Institution / School Name', value: formData.schoolName },
                                            { label: 'Facility Manager', value: staffList[0]?.name || 'Assigned Manager' },
                                            { label: 'Email Address', value: formData.canteenEmail || 'N/A' },
                                            { label: 'Phone Contact', value: formData.canteenPhone || 'N/A' },
                                            { label: 'Geographic Province', value: formData.province || '—' },
                                            { label: 'Administrative District', value: formData.district || '—' },
                                            { label: 'Student Serving Capacity', value: `${formData.capacity || '0'} Pax` },
                                        ].map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '9px 12px 9px 0', width: '40%', fontSize: '9pt', color: '#555', fontFamily: 'Arial, sans-serif', verticalAlign: 'top' }}>
                                                    {row.label}
                                                </td>
                                                <td style={{ padding: '9px 0', fontWeight: 'bold', color: '#111', verticalAlign: 'top' }}>
                                                    {row.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ borderLeft: '3px solid #bbb', paddingLeft: '14px', margin: '0 0 40px 0', color: '#333', fontSize: '10pt', lineHeight: '1.7' }}>
                                    This document serves as proof of authorization for the canteen facility within the specified institution.
                                    The facility is permitted to operate under the Shule Canteen digital ecosystem, providing nutritional
                                    services and accepting student card payments as per the national guidelines.
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                                    <div>
                                        <div style={{ borderBottom: '1px solid #111', width: '200px', marginBottom: '6px' }}></div>
                                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Onboarding Officer</p>
                                    </div>
                                    <div>
                                        <div style={{ borderBottom: '1px solid #111', width: '180px', marginBottom: '6px' }}></div>
                                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Registry Date</p>
                                    </div>
                                </div>
                            </div>

                            {/* UI Preview (Keep the beautiful UI card for the screen) */}
                            <div className="p-10 sm:p-12 border-b border-gray-100 flex justify-between items-start italic font-outfit no-print">
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-3xl font-black leading-none">
                                        Canteen Registry <br />
                                        <span className="text-shuleamber uppercase tracking-tighter">Certificate</span>
                                    </h1>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-navblue/80 font-black uppercase tracking-widest">Registry ID: {registryId}</p>
                                        <p className="text-xs text-navblue/40 font-bold uppercase tracking-widest">Issue Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                    <QRCodeSVG
                                        value={`${import.meta.env.VITE_QR_BASE_URL}/profile/canteen/${registryId}`}
                                        size={96}
                                        level="H"
                                        includeMargin={false}
                                        className="w-24 h-24"
                                    />
                                </div>
                            </div>

                            <div className="p-10 sm:p-16 relative min-h-[400px] no-print">
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                    <HiOutlineLibrary className="text-[200px] -rotate-12" />
                                </div>
                                <div className="space-y-8 relative z-10">
                                    {[
                                        { label: 'Licensed Facility Name', value: `${formData.schoolName} Canteen` },
                                        { label: 'Physical Premises', value: formData.location },
                                        { label: 'Assigned Registry Block', value: formData.block || 'SEC-01' },
                                        { label: 'Operational Manager', value: staffList[0]?.name || 'Assigned Staff' },
                                        { label: 'Authorized Capacity', value: `${formData.capacity} PAX` },
                                        { label: 'Onboarding Status', value: 'Verified & Active' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-navblue/40 min-w-[200px]">
                                                {item.label}
                                            </span>
                                            <div className="flex-1 border-b border-dashed border-navblue/10 h-1"></div>
                                            <span className="text-sm font-black italic">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Staff Credentials Table */}
                                    {provisionedAccounts.length > 0 && (
                                        <div className="mt-12 pt-12 border-t border-gray-100 no-print">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-navblue mb-6">Provisioned Access Credentials</h4>
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
                                            <p className="mt-4 text-[9px] text-navblue/40 font-bold italic line-clamp-1">Please distribute these encrypted access keys to the authorized facility personnel.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-10 py-8 border-t border-gray-50 flex justify-between items-end bg-slate-50/50 no-print">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-navblue text-shuleamber rounded-xl flex items-center justify-center">
                                        <HiOutlineLibrary className="text-xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-navblue tracking-widest">Shule Canteen</span>
                                        <span className="text-[8px] font-bold text-navblue/40 uppercase">Superadmin Authority</span>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-navblue/20 uppercase">Digital Signature Verified</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="no-print">
                    <div className="bg-navblue rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-navblue/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex flex-col gap-6 z-10 relative">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <HiOutlineLibrary className="w-6 h-6 text-shuleamber" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-shuleamber text-navblue text-[9px] font-black uppercase tracking-widest">
                                    Live Registry
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs opacity-50 font-bold uppercase tracking-widest">Facility Details</span>
                                <h4 className="text-xl font-black italic">{formData.schoolName || 'Awaiting School...'}</h4>
                                <span className="text-xs text-shuleamber font-black uppercase tracking-widest">{formData.location || 'Location Pending'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterCanteenPage;
