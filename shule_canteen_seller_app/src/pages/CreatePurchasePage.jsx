import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineTag, HiOutlinePlus, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { usePurchase } from '../context/PurchaseContext';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const CreatePurchasePage = () => {
    const navigate = useNavigate();
    const { addToPurchase } = usePurchase();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSticky, setIsSticky] = useState(false);
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const q = query(collection(db, 'products'), where('status', '==', 'active'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredItems = allItems.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProductClick = (productId) => {
        navigate(`/purchase/discover/${productId}`);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            {/* Sticky Search Area */}
            <div className={`sticky top-[64px] z-40 transition-all duration-300 ${isSticky ? 'px-0 py-0' : 'px-4 pt-4 pb-2'
                }`}>
                <div className={`relative bg-white border-slate-100 shadow-sm transition-all duration-300 ${isSticky ? 'rounded-none border-b py-4' : 'rounded-2xl border'
                    }`}>
                    <HiOutlineSearch className={`absolute transition-all duration-300 text-slate-400 text-xl ${isSticky ? 'left-6 top-1/2 -translate-y-1/2' : 'left-4 top-1/2 -translate-y-1/2'
                        }`} />
                    <input
                        type="text"
                        placeholder="Search items to purchase..."
                        className={`w-full bg-transparent focus:outline-none font-medium transition-all duration-300 ${isSticky ? 'pl-16 pr-6' : 'pl-12 pr-4 py-4'
                            }`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Results Grid/List */}
            <div className="px-4 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-navblue/40 font-bold uppercase text-[10px] tracking-widest px-2">
                        Product Catalog ({filteredItems.length})
                    </h2>
                    <button className="text-shuleamber text-[11px] font-black uppercase tracking-wider px-3 py-1 hover:bg-shuleamber/5 rounded-lg transition-all">
                        + Add New Item
                    </button>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 italic">Loading product catalog...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-10 flex flex-col items-center text-center">
                            <img
                                src="https://shulecantine.babyeyi.rw/cantine/search_empty.png"
                                alt="No products found"
                                className="w-40 opacity-90 mb-5"
                            />
                            <p className="text-slate-400 italic mb-2">
                                No products found matching your search.
                            </p>
                        </div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <div key={item.id}>
                                <div
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    {/* Product Info - Clickable to details */}
                                    <div 
                                        className="flex items-center space-x-4 flex-1"
                                        onClick={() => handleProductClick(item.id)}
                                    >
                                        {/* Product Image */}
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                            {item.image && getImageUrl(item.image) ? (
                                                <img 
                                                    src={getImageUrl(item.image)} 
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300"><HiOutlineTag className="text-2xl" /></div>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:bg-shuleamber/10 group-hover:text-shuleamber transition-colors">
                                                    <HiOutlineTag className="text-2xl" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Product Details */}
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-navblue font-bold text-base leading-tight">{item.name}</span>
                                                {/* Supplier badge */}
                                                {item.supplier && (
                                                    <span className="text-[8px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                        {item.supplier.name}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                                                {item.category} • RWF {item.price?.toLocaleString()} • {item.unit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-navblue bg-navblue/10 hover:scale-110 transition-all active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToPurchase(item);
                                        }}
                                    >
                                        <HiOutlinePlus className="text-lg" />
                                    </button>
                                </div>
                                {index < filteredItems.length - 1 && (
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

export default CreatePurchasePage;