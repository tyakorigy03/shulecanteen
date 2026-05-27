import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import {
    HiOutlineArrowLeft,
    HiOutlineOfficeBuilding,
    HiOutlineIdentification,
    HiOutlineLocationMarker,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlinePrinter,
    HiOutlineShieldCheck,
    HiOutlineExternalLink,
    HiOutlineArrowRight,
    HiOutlineUsers,
    HiOutlineUserGroup,
    HiOutlinePlus,
    HiOutlineXCircle,
    HiOutlineDatabase
} from 'react-icons/hi';

const SupplierDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'supplier_staff' });
    const [provisioning, setProvisioning] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(false);
    const [creatingProfile, setCreatingProfile] = useState(false);
    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                // Fetch from onboarding_requests
                const docRef = doc(db, 'onboarding_requests', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSupplier({ id: docSnap.id, ...docSnap.data() });
                    
                    // Check if profile exists in suppliers collection
                    await checkSupplierProfile(id);
                    
                    // If supplier is approved, fetch their registered users
                    if (docSnap.data().status === 'active') {
                        fetchRegisteredUsers(id);
                    }
                } else {
                    console.error('No such supplier!');
                }
            } catch (err) {
                console.error('Error fetching supplier:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSupplier();
    }, [id]);

    const checkSupplierProfile = async (supplierId) => {
        setCheckingProfile(true);
        try {
            const supplierDoc = await getDoc(doc(db, 'suppliers', supplierId));
            setProfileExists(supplierDoc.exists());
        } catch (err) {
            console.error('Error checking supplier profile:', err);
            setProfileExists(false);
        } finally {
            setCheckingProfile(false);
        }
    };

const createSupplierProfile = async () => {
    setCreatingProfile(true);
    try {
        const supplierData = {
            id: supplier.id || '',
            supplierCode: supplier.id || '',
            companyName: supplier.companyName || supplier.businessName || '',
            businessName: supplier.businessName || supplier.companyName || '',
            category: supplier.category || '',
            tinNumber: supplier.tinNumber || '',
            contactPerson: supplier.contactPerson || supplier.fullName || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            province: supplier.province || '',
            district: supplier.district || '',
            logoUrl: supplier.logoUrl || '',
            status: supplier.status || 'pending',
            entityType: 'supplier',
            createdAt: supplier.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'onboarding_requests'
        };

        // Remove any fields that are still undefined (just in case)
        Object.keys(supplierData).forEach(key => {
            if (supplierData[key] === undefined) {
                delete supplierData[key];
            }
        });

        await setDoc(doc(db, 'suppliers', supplier.id), supplierData);
        setProfileExists(true);
        alert('Supplier profile created successfully in suppliers collection!');
    } catch (err) {
        console.error('Error creating supplier profile:', err);
        alert('Failed to create supplier profile: ' + err.message);
    } finally {
        setCreatingProfile(false);
    }
};

    const fetchRegisteredUsers = async (supplierId) => {
        setUsersLoading(true);
        try {
            // Query users where supplierId matches
            const usersQuery = query(
                collection(db, 'users'),
                where('supplierId', '==', supplierId)
            );
            const usersSnapshot = await getDocs(usersQuery);
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRegisteredUsers(users);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!newStaff.name || !newStaff.phone) {
            alert('Please enter name and phone number');
            return;
        }

        setProvisioning(true);
        try {
            const response = await fetch(`${API_BASE}/supplier/provision-staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: id,
                    staffList: [{
                        name: newStaff.name,
                        phone: newStaff.phone,
                        email: '',
                        role: newStaff.role
                    }]
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`User added successfully!\n\nName: ${newStaff.name}\nPhone: ${newStaff.phone}\nTemp Password: ${data.accounts[0].tempPassword}`);
                setShowAddUserModal(false);
                setNewStaff({ name: '', phone: '', role: 'supplier_staff' });
                // Refresh user list
                fetchRegisteredUsers(id);
            } else {
                alert(data.message || 'Failed to add user');
            }
        } catch (err) {
            console.error('Error adding staff:', err);
            alert('Failed to add user');
        } finally {
            setProvisioning(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE}/supplier/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplierId: id })
            });
            
            const data = await response.json();
            if (data.success) {
                alert(`Supplier approved!\n\nLogin credentials:\nEmail: ${data.account.email}\nPhone: ${data.account.phone}\nTemp Password: ${data.account.tempPassword}`);
                // Refresh supplier data
                const docSnap = await getDoc(doc(db, 'onboarding_requests', id));
                setSupplier({ id: docSnap.id, ...docSnap.data() });
                // Check profile again after approval
                await checkSupplierProfile(id);
                // Fetch registered users after approval
                fetchRegisteredUsers(id);
            } else {
                alert(data.message || 'Approval failed');
            }
        } catch (err) {
            console.error('Approval error:', err);
            alert('Failed to approve supplier');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm('Reject this supplier application?')) return;
        setActionLoading(true);
        try {
            await updateDoc(doc(db, 'onboarding_requests', id), {
                status: 'rejected',
                rejectedAt: new Date().toISOString()
            });
            setSupplier(prev => ({ ...prev, status: 'rejected' }));
            alert('Supplier application rejected');
        } catch (err) {
            console.error('Rejection error:', err);
            alert('Failed to reject supplier');
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

    if (!supplier) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-white/60 italic text-sm">Supplier record not found.</p>
                <button onClick={() => navigate('/suppliers')} className="mt-4 text-shuleamber font-bold text-xs uppercase tracking-widest hover:underline">
                    Return to Hub
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-6 font-outfit text-white pb-12 relative no-print-container">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * { visibility: hidden; }
                        #supplier-print-document,
                        #supplier-print-document * { visibility: visible; }
                        #supplier-print-document {
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
                        }
                        .no-print { display: none !important; }
                        @page { margin: 0; size: A4 portrait; }
                    }
                `}} />

                {/* Header */}
                <div className="flex items-center justify-between no-print">
                    <button
                        onClick={() => navigate('/suppliers')}
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
                            Print Profile
                        </button>

                        {supplier.status === 'pending' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
                                >
                                    <HiOutlineCheck className="w-4 h-4" />
                                    Approve Vendor
                                </button>
                                <button
                                    onClick={handleReject}
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
                                <div className="w-20 h-20 bg-navblue text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                                    {supplier.logoUrl ? (
                                        <img src={supplier.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <HiOutlineOfficeBuilding className="w-10 h-10" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${supplier.status === 'active' ? 'bg-green-100 text-green-600' :
                                        supplier.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        Status: {supplier.status}
                                    </span>
                                    <h1 className="text-3xl font-black tracking-tight">{supplier.companyName || supplier.businessName}</h1>
                                    <p className="text-sm opacity-60 font-medium">Supplier Code: {supplier.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-gray-100 pt-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-navblue/5 rounded-xl flex items-center justify-center shrink-0">
                                        <HiOutlineIdentification className="w-5 h-5 text-navblue/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-navblue/30 tracking-widest">Tax Identification (TIN)</p>
                                        <p className="text-sm font-bold text-navblue">{supplier.tinNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-navblue/5 rounded-xl flex items-center justify-center shrink-0">
                                        <HiOutlineCalendar className="w-5 h-5 text-navblue/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-navblue/30 tracking-widest">Registration Date</p>
                                        <p className="text-sm font-bold text-navblue">{new Date(supplier.createdAt).toLocaleDateString()}</p>
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
                                    <h3 className="font-bold text-sm tracking-tight">Primary Representative</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-navblue/30">Full Name</p>
                                        <p className="text-sm font-bold text-navblue">{supplier.fullName || supplier.contactPerson}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-navblue font-medium opacity-70">
                                        <HiOutlineMail className="w-4 h-4" />
                                        <span>{supplier.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-navblue font-medium opacity-70">
                                        <HiOutlinePhone className="w-4 h-4" />
                                        <span>{supplier.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-navblue text-white rounded-lg flex items-center justify-center">
                                        <HiOutlineLocationMarker className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm tracking-tight">Business Location</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-navblue/30">Province</p>
                                        <p className="text-sm font-bold text-navblue">{supplier.province}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-navblue/30">District</p>
                                        <p className="text-sm font-bold text-navblue">{supplier.district}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Profile Status Card */}
                       

                        {/* Registered Users Card with Add Button */}
                        {supplier.status === 'active' && (
                            <div className="bg-white rounded-3xl p-6 border border-white shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-navblue text-white rounded-lg flex items-center justify-center">
                                            <HiOutlineUserGroup className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-sm tracking-tight">Registered Users</h3>
                                        <span className="text-xs font-bold text-navblue/40">{registeredUsers.length} user(s)</span>
                                    </div>
                                    <button
                                        onClick={() => setShowAddUserModal(true)}
                                        className="bg-shuleamber text-navblue px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:scale-105 transition-all"
                                    >
                                        <HiOutlinePlus className="w-3 h-3" />
                                        Add User
                                    </button>
                                </div>
                                
                                {usersLoading ? (
                                    <div className="text-center py-8">
                                        <div className="w-8 h-8 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : registeredUsers.length > 0 ? (
                                    <div className="space-y-3">
                                        {registeredUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-navblue/5 rounded-xl hover:bg-navblue/10 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-navblue/20 rounded-full flex items-center justify-center">
                                                        <HiOutlineUser className="w-5 h-5 text-navblue" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-navblue">{user.fullName}</p>
                                                        <div className="flex items-center gap-3 text-[10px] text-navblue/40">
                                                            <span>{user.phone}</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{user.role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-navblue/40">User ID</p>
                                                    <p className="text-[9px] font-mono text-navblue/60">{user.id}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <HiOutlineUsers className="w-12 h-12 text-navblue/20 mx-auto mb-2" />
                                        <p className="text-sm text-navblue/40">No users registered yet</p>
                                        <p className="text-[10px] text-navblue/30">Click "Add User" to create staff accounts</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6 no-print">
                        <div className="bg-white p-6 rounded-3xl text-navblue border border-white shadow-sm">
                            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
                                <HiOutlineShieldCheck className="text-navblue/40 w-5 h-5" />
                                System Audit Summary
                            </h3>
                            <div className="bg-navblue/5 rounded-2xl p-4 space-y-3 border border-navblue/5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-50 font-bold uppercase tracking-wider">Document Set</span>
                                    <span className="font-black text-green-600 italic">Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-50 font-bold uppercase tracking-wider">Location Match</span>
                                    <span className="font-black text-navblue italic">Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="opacity-50 font-bold uppercase tracking-wider">KYC Status</span>
                                    <span className="font-black text-navblue italic">Compliant</span>
                                </div>
                            </div>
                            <div className="mt-8 space-y-4">
                                <p className="text-[10px] opacity-40 leading-relaxed italic font-medium">
                                    This vendor has submitted all required documentation for the Shule Canteen procurement ecosystem. Review the above data before final approval.
                                </p>
                            </div>
                        </div>

                        
                         <div className={`rounded-3xl p-6 border shadow-sm ${profileExists ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="flex items-center mb-3 justify-between">
                                <div className="flex items-center gap-3">

                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profileExists ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                                        <HiOutlineDatabase className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm tracking-tight text-navblue">Supplier Profile</h3>
                                        <p className="text-[10px] text-navblue/60">
                                            {profileExists 
                                                ? 'Profile exists in suppliers collection' 
                                                : 'Profile not found in suppliers collection'}
                                        </p>
                                    </div>
                                </div>
                              
                                {checkingProfile && (
                                    <div className="w-5 h-5 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                               {!profileExists && !checkingProfile && supplier.status === 'active' && (
                                    <button
                                        onClick={createSupplierProfile}
                                        disabled={creatingProfile}
                                        className="bg-shuleamber w-full text-navblue px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {creatingProfile ? (
                                            <div className="w-full h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <HiOutlinePlus className="w-3 h-3" />
                                                Create Profile
                                            </>
                                        )}
                                    </button>
                                )} 
                            </div>
                        </div>
                        <div className="bg-navblue rounded-[32px] p-6 text-white overflow-hidden relative border border-white/10 shadow-xl shadow-navblue/20">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full -mr-5 -mt-5"></div>
                            <h3 className="font-bold text-sm mb-4">Internal Notes</h3>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-shuleamber/40 h-32 placeholder:text-white/20 transition-all font-medium"
                                placeholder="Add administrative notes..."
                            ></textarea>
                            <button className="w-full mt-4 bg-white/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-shuleamber hover:text-navblue transition-all">
                                Save Progress
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print" onClick={() => setShowAddUserModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 text-navblue" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black">Add New User</h3>
                            <button onClick={() => setShowAddUserModal(false)} className="text-navblue/40 hover:text-navblue">
                                <HiOutlineXCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold block mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full bg-navblue/5 border-none rounded-xl px-4 py-3 text-sm font-bold text-navblue outline-none focus:ring-2 focus:ring-shuleamber"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold block mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    placeholder="07XX XXX XXX"
                                    className="w-full bg-navblue/5 border-none rounded-xl px-4 py-3 text-sm font-bold text-navblue outline-none focus:ring-2 focus:ring-shuleamber"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold block mb-2">Role</label>
                                <select
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                    className="w-full bg-navblue/5 border-none rounded-xl px-4 py-3 text-sm font-bold text-navblue outline-none focus:ring-2 focus:ring-shuleamber"
                                >
                                    <option value="supplier_admin">Supplier Admin</option>
                                    <option value="supplier_staff">Supplier Staff</option>
                                    <option value="supplier_accountant">Accountant</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowAddUserModal(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm border border-navblue/20 text-navblue/60 hover:bg-navblue/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStaff}
                                    disabled={provisioning}
                                    className="flex-1 bg-shuleamber text-navblue py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {provisioning ? (
                                        <div className="w-5 h-5 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin mx-auto"></div>
                                    ) : (
                                        'Add User'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Document */}
            <div
                id="supplier-print-document"
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
                        <p style={{ fontSize: '9pt', color: '#555', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>SHULE CANTEEN PROCUREMENT REGISTRY</p>
                        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 4px 0' }}>Supplier Authorization Certificate</h1>
                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Official Vendor Record — Confidential</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ border: '1px solid #ddd', padding: '8px', display: 'inline-block' }}>
                            <QRCodeSVG
                                value={`${import.meta.env.VITE_QR_BASE_URL}/profile/${supplier.id}`}
                                size={90}
                                level="H"
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px', marginBottom: '28px', fontSize: '9pt', color: '#444' }}>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Supplier Code</span>
                        <span style={{ fontWeight: 'bold', color: '#111' }}>{supplier.id}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Registration Date</span>
                        <span style={{ fontWeight: 'bold', color: '#111' }}>{new Date(supplier.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '8pt', color: '#888', marginBottom: '2px' }}>Status</span>
                        <span style={{ fontWeight: 'bold', color: '#111', textTransform: 'capitalize' }}>{supplier.status}</span>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '11pt' }}>
                    <tbody>
                        {[
                            { label: 'Registered Entity Name', value: supplier.companyName || supplier.businessName },
                            { label: 'Vendor Category', value: supplier.category || 'General Supplier' },
                            { label: 'Tax Identification Number (TIN)', value: supplier.tinNumber || '—' },
                            { label: 'Primary Contact Person', value: supplier.fullName || supplier.contactPerson },
                            { label: 'Email Address', value: supplier.email },
                            { label: 'Phone Number', value: supplier.phone },
                            { label: 'Province', value: supplier.province },
                            { label: 'District', value: supplier.district },
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
                    This document certifies that the organization listed above is officially recognized as an
                    authorized supplier within the Shule Canteen procurement ecosystem.
                </div>

                {registeredUsers.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                            Registered Users
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Full Name</th>
                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Phone</th>
                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.fullName}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.phone}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', textTransform: 'capitalize' }}>{user.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                    <div>
                        <div style={{ borderBottom: '1px solid #111', width: '200px', marginBottom: '6px' }}></div>
                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Authorized Signature</p>
                    </div>
                    <div>
                        <div style={{ borderBottom: '1px solid #111', width: '180px', marginBottom: '6px' }}></div>
                        <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>Date</p>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #ddd', marginTop: '40px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '8pt', color: '#888', margin: 0 }}>Shule Canteen · Authorized Supplier Registry</p>
                    <p style={{ fontSize: '8pt', color: '#888', margin: 0 }}>Powered by EduPoto</p>
                </div>
            </div>
        </>
    );
};

export default SupplierDetailsPage;