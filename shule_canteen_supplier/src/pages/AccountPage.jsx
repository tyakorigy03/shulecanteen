import { useState, useEffect } from 'react';
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineShieldCheck,
    HiOutlineGlobeAlt,
    HiOutlineCamera,
    HiOutlineSave,
    HiOutlineRefresh
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const AccountPage = () => {
    const { user, supplier, refreshSupplier } = useAuth();
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        province: '',
        district: '',
        logoUrl: ''
    });

    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        if (supplier) {
            setFormData({
                companyName: supplier.companyName || supplier.businessName || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                province: supplier.province || '',
                district: supplier.district || '',
                logoUrl: supplier.logoUrl || ''
            });
        }
    }, [supplier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const supplierId = user?.supplierId || supplier?.id;
        if (!supplierId) {
            alert('Supplier ID not found');
            return;
        }

        setUploadingLogo(true);

        const formDataImg = new FormData();
        formDataImg.append('image', file);
        formDataImg.append('supplierId', supplierId);

        try {
            const response = await fetch(`${API_BASE}/images/upload`, {
                method: 'POST',
                body: formDataImg
            });

            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, logoUrl: data.imageUrl }));
                alert('Logo uploaded successfully! Click "Save Changes" to update.');
            } else {
                alert('Failed to upload logo: ' + data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const supplierId = user?.supplierId || supplier?.id;
        if (!supplierId) {
            alert('Supplier ID not found');
            return;
        }

        setUpdating(true);
        
        try {
            // 1. Update supplier in onboarding_requests
            const onboardingRef = doc(db, 'onboarding_requests', supplierId);
            await updateDoc(onboardingRef, {
                companyName: formData.companyName,
                businessName: formData.companyName,
                email: formData.email,
                phone: formData.phone,
                province: formData.province,
                district: formData.district,
                logoUrl: formData.logoUrl,
                updatedAt: new Date().toISOString()
            });

            // 2. Update supplier in suppliers collection if exists
            const supplierRef = doc(db, 'suppliers', supplierId);
            const supplierDoc = await getDoc(supplierRef);
            if (supplierDoc.exists()) {
                await updateDoc(supplierRef, {
                    companyName: formData.companyName,
                    businessName: formData.companyName,
                    email: formData.email,
                    phone: formData.phone,
                    province: formData.province,
                    district: formData.district,
                    logoUrl: formData.logoUrl,
                    updatedAt: new Date().toISOString()
                });
            }

            // 3. Update ALL products that belong to this supplier
            const productsQuery = query(
                collection(db, 'products'),
                where('supplierId', '==', supplierId)
            );
            const productsSnapshot = await getDocs(productsQuery);
            
            if (!productsSnapshot.empty) {
                const batch = writeBatch(db);
                
                productsSnapshot.docs.forEach(productDoc => {
                    const productRef = doc(db, 'products', productDoc.id);
                    batch.update(productRef, {
                        'supplier.name': formData.companyName,
                        'supplier.logo': formData.logoUrl,
                        'supplier.phone': formData.phone,
                        'supplier.email': formData.email,
                        updatedAt: new Date().toISOString()
                    });
                });
                
                await batch.commit();
                console.log(`Updated ${productsSnapshot.size} products with new supplier info`);
            }

            // 4. Refresh auth context
            if (refreshSupplier) {
                await refreshSupplier();
            }

            alert('Profile updated successfully! Changes reflected in all products.');
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update profile: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (!supplier && loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">My <span className="text-shuleamber">Account</span></h2>
                    <p className="text-sm opacity-60">Supplier Profile & Identity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-navblue/5 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                                {formData.logoUrl ? (
                                    <img 
                                        src={`${IMAGE_BASE}${formData.logoUrl}`}
                                        alt="Supplier Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <HiOutlineUser className="w-16 h-16 text-navblue/20" />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-shuleamber text-navblue rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-all cursor-pointer">
                                {uploadingLogo ? (
                                    <div className="w-4 h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                ) : (
                                    <HiOutlineCamera className="w-5 h-5" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    disabled={uploadingLogo}
                                />
                            </label>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-navblue text-2xl font-black">{formData.companyName || 'Supplier Name'}</h3>
                            <p className="text-xs uppercase opacity-60">Supplier ID: {supplier?.id || user?.supplierId}</p>
                        </div>
                        <div className="w-full h-[1px] bg-gray-50 my-6"></div>
                        <div className="w-full flex flex-col gap-4 text-left">
                            <div className="flex items-center gap-3 text-navblue">
                                <div className="w-8 h-8 rounded-lg bg-navblue/5 flex items-center justify-center shrink-0">
                                    <HiOutlineMail className="w-4 h-4 opacity-40" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-30">Email Address</span>
                                    <span className="text-xs font-bold leading-tight">{formData.email || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-navblue">
                                <div className="w-8 h-8 rounded-lg bg-navblue/5 flex items-center justify-center shrink-0">
                                    <HiOutlinePhone className="w-4 h-4 opacity-40" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-30">Phone Number</span>
                                    <span className="text-xs font-bold leading-tight">{formData.phone || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-navblue">
                                <div className="w-8 h-8 rounded-lg bg-navblue/5 flex items-center justify-center shrink-0">
                                    <HiOutlineLocationMarker className="w-4 h-4 opacity-40" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-30">Location</span>
                                    <span className="text-xs font-bold leading-tight">
                                        {formData.province && formData.district 
                                            ? `${formData.province}, ${formData.district}`
                                            : 'Not set'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Profile Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-navblue">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center">
                                <HiOutlineRefresh className="w-6 h-6 text-shuleamber" />
                            </div>
                            <div>
                                <h3 className="text-sm opacity-30">Company Information</h3>
                                <p className="text-xs font-bold mt-0.5">Update your business details</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2 sm:col-span-2">
                                    <label className="text-sm opacity-30 ml-1">Company/Business Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Your business name"
                                        className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm opacity-30 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@business.com"
                                        className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm opacity-30 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+250 XXX XXX XXX"
                                        className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm opacity-30 ml-1">Province</label>
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all appearance-none"
                                    >
                                        <option value="">Select Province</option>
                                        <option value="Kigali">Kigali City</option>
                                        <option value="North">Northern Province</option>
                                        <option value="South">Southern Province</option>
                                        <option value="East">Eastern Province</option>
                                        <option value="West">Western Province</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm opacity-30 ml-1">District</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        placeholder="District name"
                                        className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="bg-navblue text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-shuleamber hover:text-navblue transition-all shadow-xl shadow-navblue/10 disabled:opacity-50"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineSave className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-navblue">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center">
                                <HiOutlineShieldCheck className="w-6 h-6 text-shuleamber" />
                            </div>
                            <div>
                                <h3 className="text-sm opacity-30">Security & Access</h3>
                                <p className="text-xs font-bold mt-0.5">Password management</p>
                            </div>
                        </div>

                        <p className="text-xs text-navblue/40 italic mb-6">
                            For security reasons, password changes must be requested through the administrator.
                            Contact support to reset your password.
                        </p>

                        <button className="bg-navblue/10 text-navblue px-8 py-2 rounded-lg text-sm hover:bg-navblue/20 transition-all">
                            Request Password Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;