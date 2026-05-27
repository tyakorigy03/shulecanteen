import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import {
    HiOutlineArrowLeft,
    HiOutlineLibrary,
    HiOutlineIdentification,
    HiOutlineLocationMarker,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineBadgeCheck,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlinePrinter,
    HiOutlineOfficeBuilding,
    HiOutlineDatabase,
    HiOutlineRefresh,
    HiOutlineKey,
    HiOutlineDocumentText
} from 'react-icons/hi';

const CanteenDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [canteen, setCanteen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [schoolCodeInput, setSchoolCodeInput] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStats, setSyncStats] = useState(null);
    const [operatorForm, setOperatorForm] = useState({ fullName: '', email: '', phone: '' });
    const [tempOperator, setTempOperator] = useState(null);
    const [schoolData, setSchoolData] = useState(null);

    const API_BASE = '/api';

    useEffect(() => {
        const fetchCanteen = async () => {
            try {
                const docRef = doc(db, 'onboarding_requests', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCanteen({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error('No such canteen!');
                }
                // Fetch school data
                const schoolRef = doc(db, 'schools', docSnap.data().schoolCode);
                const schoolSnap = await getDoc(schoolRef);
                if (schoolSnap.exists()) {
                    setSchoolData(schoolSnap.data());
                }
            } catch (err) {
                console.error('Error fetching canteen:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCanteen();
    }, [id]);

    const handleConnectLegacy = async () => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE}/canteen/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schoolCode: schoolCodeInput, canteenId: id })
            });
            const data = await response.json();
            if (data.success) {
                setCanteen(prev => ({ ...prev, schoolCode: schoolCodeInput, isLive: true }));
                setShowConnectModal(false);
                alert('Successfully connected to legacy school!');
            } else {
                alert(data.message || 'Connection failed');
            }
        } catch (err) {
            console.error('Connect error:', err);
            alert('Failed to connect to legacy system');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSyncData = async () => {
        if (!canteen?.schoolCode) return;
        setIsSyncing(true);
        try {
            const response = await fetch(`${API_BASE}/canteen/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schoolCode: canteen.schoolCode })
            });
            const data = await response.json();
            if (data.success) {
                setSyncStats({ count: data.count, time: new Date().toLocaleTimeString() });
                alert(`Successfully synced ${data.count} students!`);
            } else {
                alert(data.message || 'Sync failed');
            }
        } catch (err) {
            console.error('Sync error:', err);
            alert('Data synchronization failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateOperator = async () => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE}/canteen/configure-operator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...operatorForm, schoolCode: canteen.schoolCode })
            });
            const data = await response.json();
            if (data.success) {
                setTempOperator(data.operator);
                setOperatorForm({ fullName: '', email: '', phone: '' });
                alert('Operator account created!');
            } else {
                alert(data.message || 'Failed to create operator');
            }
        } catch (err) {
            console.error('Operator error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            const docRef = doc(db, 'onboarding_requests', id);
            await updateDoc(docRef, { status: newStatus, updatedAt: new Date().toISOString() });
            setCanteen(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!canteen) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-white/60 italic text-sm">Canteen record not found.</p>
                <button onClick={() => navigate('/canteens')} className="mt-4 text-shuleamber font-bold text-xs uppercase tracking-widest hover:underline">
                    Return to Registry
                </button>
            </div>
        );
    }

    return (
        <>
            {/* ── Screen UI ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 font-outfit text-white pb-12 relative no-print-container">
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
                            width: 210mm !important;
                            min-height: 297mm !important;
                            display: flex !important;
                            flex-direction: column !important;
                            background: white !important;
                            margin: 0 !important;
                            padding: 20mm !important;
                            box-sizing: border-box !important;
                            color: #111 !important;
                        }
                        .no-print { display: none !important; }
                        @page { margin: 0; size: A4 portrait; }
                    }
                `}} />

                {/* Header / Breadcrumb */}
                <div className="flex items-center justify-between no-print">
                    <button
                        onClick={() => navigate('/canteens')}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
                    >
                        <HiOutlineArrowLeft className="w-4 h-4" />
                        Back to Registry
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:bg-white/20 transition-all shadow-lg"
                        >
                            <HiOutlinePrinter className="w-4 h-4 text-shuleamber" />
                            Print Sheet
                        </button>

                        {canteen.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate('active')}
                                    disabled={actionLoading}
                                    className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
                                >
                                    <HiOutlineCheck className="w-4 h-4" />
                                    Approve Facility
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={actionLoading}
                                    className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                >
                                    <HiOutlineX className="w-4 h-4" />
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Hero Card */}
                        <div className="bg-white rounded-3xl p-8 text-navblue shadow-xl shadow-navblue/5 border border-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-navblue/5 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="w-20 h-20 bg-navblue text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-black text-3xl">
                                    <HiOutlineLibrary className="w-10 h-10" />
                                </div>
                                <div className="flex-1">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${canteen.status === 'active' ? 'bg-green-100 text-green-600' :
                                        canteen.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        Status: {canteen.status}
                                    </span>
                                    <h1 className="text-3xl font-black tracking-tight">{canteen.schoolName || canteen.name}</h1>
                                    <p className="text-sm opacity-60 font-medium">#{canteen.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-gray-100 pt-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-navblue/5 rounded-xl flex items-center justify-center shrink-0">
                                        <HiOutlineOfficeBuilding className="w-5 h-5 text-navblue/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-navblue/30 tracking-widest">Facility Type</p>
                                        <p className="text-sm font-bold text-navblue">School Canteen / Mess</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-navblue/5 rounded-xl flex items-center justify-center shrink-0">
                                        <HiOutlineCalendar className="w-5 h-5 text-navblue/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-navblue/30 tracking-widest">Submission Date</p>
                                        <p className="text-sm font-bold text-navblue">{canteen.createdAt ? new Date(canteen.createdAt).toLocaleDateString() : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-navblue">
                            <div className="bg-white rounded-3xl p-6 border border-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-navblue text-white rounded-lg flex items-center justify-center">
                                        <HiOutlineUser className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm tracking-tight">Canteen Manager</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-navblue/30">Responsible Official</p>
                                        <p className="text-sm font-bold text-navblue">{canteen.fullName || canteen.manager || 'Not Assigned'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-navblue font-medium opacity-70">
                                        <HiOutlineMail className="w-4 h-4" />
                                        <span>{canteen.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-navblue font-medium opacity-70">
                                        <HiOutlinePhone className="w-4 h-4" />
                                        <span>{canteen.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-navblue text-white rounded-lg flex items-center justify-center">
                                        <HiOutlineLocationMarker className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm tracking-tight">School Location</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-navblue/30">Province & District</p>
                                        <p className="text-sm font-bold text-navblue">{canteen.district}, {canteen.province}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-navblue/30">Capacity Estimate</p>
                                        <p className="text-sm font-bold text-navblue">{canteen.capacity || '0'} Students</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6 no-print">
                        <div className="bg-white p-6 rounded-3xl text-navblue border border-white shadow-sm">
                            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
                                <HiOutlineBadgeCheck className="text-navblue/40 w-5 h-5" />
                                Compliance Status
                            </h3>
                            <div className="bg-navblue/5 rounded-2xl p-4 space-y-3 border border-navblue/5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-50 font-bold uppercase tracking-wider">Health Permit</span>
                                    <span className="font-black text-green-600 italic">Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-50 font-bold uppercase tracking-wider">Trading License</span>
                                    <span className="font-black text-navblue italic">Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-50 font-bold uppercase tracking-wider">Fire Safety</span>
                                    <span className="font-black text-navblue italic">Compliant</span>
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-[10px] opacity-40 leading-relaxed italic font-medium">
                                    This facility onboarding request is based on school-level verification. Please ensure the manager profile is correctly linked.
                                </p>
                            </div>
                        </div>

                        <div className="bg-navblue rounded-[32px] p-6 text-white overflow-hidden relative border border-white/10 shadow-xl shadow-navblue/20">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full -mr-5 -mt-5"></div>
                            <h3 className="font-bold text-sm mb-4">Onboarding Notes</h3>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-shuleamber/40 h-32 placeholder:text-white/20 transition-all font-medium"
                                placeholder="Add administrative notes..."
                            ></textarea>
                            <button className="w-full mt-4 bg-white/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-shuleamber hover:text-navblue transition-all">
                                Save Progress
                            </button>
                        </div>

                        {/* Connection Card */}
                        <div className="bg-white p-6 rounded-3xl text-navblue border border-white shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-navblue/5 rounded-full -mr-16 -mt-16"></div>
                            <h3 className="font-bold text-sm mb-6 flex items-center gap-2 relative">
                                <HiOutlineDatabase className="text-navblue/40 w-5 h-5" />
                                Legacy Integration
                            </h3>

                            {!canteen.schoolCode ? (
                                <div className="relative">
                                    <p className="text-[11px] text-navblue/60 mb-6 leading-relaxed">
                                        This canteen is not yet linked to a legacy school record. Link it now to sync students and wallets.
                                    </p>
                                    <button
                                        onClick={() => setShowConnectModal(true)}
                                        className="w-full bg-navblue text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-shuleamber hover:text-navblue transition-all flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineIdentification className="w-4 h-4" />
                                        Connect to Legacy
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 relative">
                                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                                <HiOutlineCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-green-600/50">Linked School Code</p>
                                                <p className="text-sm font-black text-green-700">{canteen.schoolCode}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleSyncData}
                                            disabled={isSyncing}
                                            className="w-full bg-navblue/5 text-navblue py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-navblue hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <HiOutlineRefresh className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                            {isSyncing ? 'Synchronizing...' : 'Sync Students'}
                                        </button>

                                        <button
                                            onClick={() => setShowOperatorModal(true)}
                                            className="w-full bg-white border border-gray-100 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-shuleamber transition-all flex items-center justify-center gap-2"
                                        >
                                            <HiOutlineKey className="w-4 h-4 text-shuleamber" />
                                            Manage Operators
                                        </button>
                                    </div>

                                    {syncStats && (
                                        <p className="text-[10px] text-center text-navblue/40 font-medium italic">
                                            Last sync: {syncStats.time} ({syncStats.count} records)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0 no-print">
                    <div className="absolute inset-0 bg-navblue/60 backdrop-blur-sm" onClick={() => setShowConnectModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[32px] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-navblue mb-2">Connect to Legacy</h2>
                        <p className="text-sm text-navblue/60 mb-8 font-medium">Link this canteen to a Babyeyi school database record.</p>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] uppercase font-black text-navblue/30 tracking-widest block mb-2 px-1">Institutional Code</label>
                                <input
                                    type="text"
                                    value={schoolCodeInput}
                                    onChange={(e) => setSchoolCodeInput(e.target.value)}
                                    placeholder="e.g. SCH-1234"
                                    className="w-full bg-navblue/5 border border-transparent focus:border-shuleamber/40 focus:bg-white rounded-2xl p-4 text-navblue font-bold outline-none transition-all placeholder:text-navblue/20"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConnectModal(false)}
                                    className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-navblue/40 hover:text-navblue transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConnectLegacy}
                                    disabled={actionLoading || !schoolCodeInput}
                                    className="flex-[2] bg-navblue text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-shuleamber hover:text-navblue transition-all disabled:opacity-50 shadow-xl shadow-navblue/20"
                                >
                                    {actionLoading ? 'Connecting...' : 'Verify & Connect'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Operator Modal */}
            {showOperatorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0 no-print">
                    <div className="absolute inset-0 bg-navblue/60 backdrop-blur-sm" onClick={() => setShowOperatorModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[32px] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-navblue">Access Configuration</h2>
                                <p className="text-sm text-navblue/60 font-medium">Provision operator accounts for this canteen.</p>
                            </div>
                            <button onClick={() => setShowOperatorModal(false)} className="w-10 h-10 bg-navblue/5 rounded-full flex items-center justify-center text-navblue/40 hover:bg-red-50 hover:text-red-500 transition-all">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {!tempOperator ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] uppercase font-black text-navblue/30 tracking-widest block mb-2">Operator Full Name</label>
                                        <input
                                            type="text"
                                            value={operatorForm.fullName}
                                            onChange={(e) => setOperatorForm({ ...operatorForm, fullName: e.target.value })}
                                            className="w-full bg-navblue/5 border border-transparent focus:border-shuleamber/40 focus:bg-white rounded-2xl p-4 text-navblue font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-navblue/30 tracking-widest block mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            value={operatorForm.phone}
                                            onChange={(e) => setOperatorForm({ ...operatorForm, phone: e.target.value })}
                                            className="w-full bg-navblue/5 border border-transparent focus:border-shuleamber/40 focus:bg-white rounded-2xl p-4 text-navblue font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-navblue/30 tracking-widest block mb-2">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={operatorForm.email}
                                            onChange={(e) => setOperatorForm({ ...operatorForm, email: e.target.value })}
                                            className="w-full bg-navblue/5 border border-transparent focus:border-shuleamber/40 focus:bg-white rounded-2xl p-4 text-navblue font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreateOperator}
                                    disabled={actionLoading || !operatorForm.fullName || !operatorForm.phone}
                                    className="w-full bg-navblue text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-shuleamber hover:text-navblue transition-all disabled:opacity-50 shadow-xl shadow-navblue/20"
                                >
                                    {actionLoading ? 'Provisioning...' : 'Generate Operator Account'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-shuleamber/5 border-2 border-dashed border-shuleamber/30 rounded-[32px] p-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                                <div className="w-16 h-16 bg-shuleamber text-navblue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                                    <HiOutlineKey className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-black text-navblue mb-2">Provisioning Success!</h4>
                                <p className="text-sm text-navblue/60 mb-8 font-medium">Please share these temporary credentials with the operator.</p>
                                <div className="bg-white rounded-2xl p-6 space-y-4 shadow-xl border border-shuleamber/10">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-navblue/30">
                                        <span>Full Name</span>
                                        <span className="text-navblue">{tempOperator.fullName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold border-t border-gray-50 pt-4">
                                        <span className="text-navblue/30 uppercase tracking-widest">Login Phone</span>
                                        <span className="text-navblue">{operatorForm.phone}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold border-t border-gray-50 pt-4">
                                        <span className="text-navblue/30 uppercase tracking-widest">Temp Password</span>
                                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm select-all">{tempOperator.tempPassword}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setTempOperator(null)}
                                    className="mt-8 text-[11px] font-black uppercase tracking-widest text-navblue/40 hover:text-shuleamber transition-all"
                                >
                                    Done / Add Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Print Document ───────────────────────────────────────────────────
                Hidden on screen. Revealed only during window.print().
                Uses document-standard defaults: Georgia serif, normal weights,
                standard tracking, no decorative Tailwind utilities.
            ──────────────────────────────────────────────────────────────────── */}
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
                {/* Letterhead */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                        <p style={{ fontSize: '9pt', color: '#555', margin: '0 0 4px 0' }}>Shule Canteen Facility Registry</p>
                        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 4px 0' }}>Canteen Authorization Profile</h1>
                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Official School Facility Record — Confidential</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ border: '1px solid #ddd', padding: '8px', display: 'inline-block' }}>
                            <QRCodeSVG
                                value={`${window.location.origin}/canteens/${canteen.id}`}
                                size={90}
                                level="H"
                            />
                        </div>
                        <p style={{ fontSize: '8pt', color: '#888', margin: '4px 0 0 0' }}>Scan to verify</p>
                    </div>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '40px', marginBottom: '28px', fontSize: '9pt', color: '#444' }}>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Facility ID</span>
                        <span style={{ fontWeight: 'bold', color: '#111' }}>#{canteen.id}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Submission Date</span>
                        <span style={{ fontWeight: 'bold', color: '#111' }}>
                            {canteen.createdAt ? new Date(canteen.createdAt).toLocaleDateString() : '—'}
                        </span>
                    </div>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Status</span>
                        <span style={{ fontWeight: 'bold', color: '#111', textTransform: 'capitalize' }}>{canteen.status}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Printed</span>
                        <span style={{ fontWeight: 'bold', color: '#111' }}>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Details table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '11pt' }}>
                    <tbody>
                        {[
                            { label: 'Institution / School Name', value: canteen.schoolName || canteen.name },
                            { label: 'Facility Manager', value: canteen.fullName || canteen.manager || '—' },
                            { label: 'Email Address', value: canteen.email },
                            { label: 'Phone Contact', value: canteen.phone },
                            { label: 'Province', value: canteen.province },
                            { label: 'District', value: canteen.district },
                            { label: 'Student Serving Capacity', value: `${canteen.capacity || '0'} students` },
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

                {/* Commissioning statement */}
                <div style={{ borderLeft: '3px solid #bbb', paddingLeft: '14px', margin: '0 0 40px 0', color: '#333', fontSize: '10pt', lineHeight: '1.7' }}>
                    This document serves as proof of authorization for the canteen facility within the specified institution.
                    The facility is permitted to operate under the Shule Canteen digital ecosystem, providing nutritional
                    services and accepting student card payments as per the national guidelines.
                </div>

                {/* Signature block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                    <div>
                        <div style={{ borderBottom: '1px solid #111', width: '200px', marginBottom: '6px' }}></div>
                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Onboarding Officer</p>
                    </div>
                    <div>
                        <div style={{ borderBottom: '1px solid #111', width: '180px', marginBottom: '6px' }}></div>
                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Date</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #ddd', marginTop: '40px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '8pt', color: '#888', margin: 0 }}>Shule Canteen · Facility Authorization Registry</p>
                    <p style={{ fontSize: '8pt', color: '#888', margin: 0 }}>Powered by EduPoto</p>
                </div>
            </div>
        </>
    );
};

export default CanteenDetailsPage;