import { useState, useEffect } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        // Fetch from suppliers collection, not onboarding_requests
        const q = query(
            collection(db, 'suppliers'),
            where('status', '==', 'active')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setSuppliers(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching suppliers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    return (
        <div className="px-4 pt-2 pb-20 space-y-6">
            <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-navblue font-black text-lg uppercase tracking-tight">Verified Suppliers</h2>
                </div>

                {/* Suppliers List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 italic">Loading suppliers...</div>
                    ) : suppliers.length === 0 ? (
                        <div className="p-10 flex flex-col items-center text-center">
                            <img
                                src="https://shulecantine.babyeyi.rw/cantine/empty_inventory.png"
                                alt="No Suppliers"
                                className="w-40 opacity-90 mb-5"
                            />
                            <p className="text-slate-400 italic mb-2">
                                No verified suppliers found.
                            </p>
                            <p className="text-slate-300 text-xs">
                                Suppliers will appear here once approved.
                            </p>
                        </div>
                    ) : (
                        suppliers.map((supplier, index) => (
                            <div key={supplier.id}>
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Supplier Logo/Image */}
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                            {supplier.logoUrl ? (
                                                <img 
                                                    src={getImageUrl(supplier.logoUrl)} 
                                                    alt={supplier.companyName || supplier.businessName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300"><HiOutlineOfficeBuilding className="text-2xl" /></div>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:text-shuleamber transition-colors">
                                                    <HiOutlineOfficeBuilding className="text-2xl" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Supplier Info */}
                                        <div className="flex-1">
                                            <div className="flex flex-col">
                                                <span className="text-navblue font-bold text-base leading-tight">
                                                    {supplier.companyName || supplier.businessName}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {supplier.category && (
                                                        <span className="text-[9px] bg-shuleamber/10 text-shuleamber px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                                            {supplier.category}
                                                        </span>
                                                    )}
                                                    {supplier.district && (
                                                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                                            <HiOutlineLocationMarker className="w-2.5 h-2.5" />
                                                            {supplier.district}
                                                        </span>
                                                    )}
                                                    {supplier.province && (
                                                        <span className="text-[9px] text-slate-400">
                                                            {supplier.province}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex flex-col items-end">
                                        {supplier.phone && (
                                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                <HiOutlinePhone className="w-3 h-3" />
                                                {supplier.phone}
                                            </span>
                                        )}
                                        {supplier.contactPerson && (
                                            <span className="text-[9px] text-slate-400 mt-1">
                                                Contact: {supplier.contactPerson}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {index < suppliers.length - 1 && (
                                    <div className="mx-4 border-b border-slate-100"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuppliersPage;