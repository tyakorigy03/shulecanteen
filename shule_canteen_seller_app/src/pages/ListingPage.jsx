import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineTag, HiOutlinePlus } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const ListingPage = () => {
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSticky, setIsSticky] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        if (!user?.schoolCode) return;

        const q = query(
            collection(db, 'schools', user.schoolCode, 'inventory')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            const inStockItems = items.filter(item => (item.stock || 0) > 0);
            setInventory(inStockItems);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.schoolCode]);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    // Get quantity of an item in cart
    const getItemQuantity = (itemId) => {
        const cartItem = cartItems.find(item => item.id === itemId);
        return cartItem?.quantity || 0;
    };

    const filteredItems = inventory.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-24">
            {/* Sticky Search Area */}
            <div className={`sticky top-[64px] z-40 transition-all duration-300 ${isSticky ? 'px-0 py-0' : 'px-4 pt-4 pb-2'
                }`}>
                <div className={`relative bg-white border-slate-100 shadow-sm transition-all duration-300 ${isSticky ? 'rounded-none border-b py-4' : 'rounded-2xl border'
                    }`}>
                    <HiOutlineSearch className={`absolute transition-all duration-300 text-slate-400 text-xl ${isSticky ? 'left-6 top-1/2 -translate-y-1/2' : 'left-4 top-1/2 -translate-y-1/2'
                        }`} />
                    <input
                        type="text"
                        placeholder="Search products..."
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
                        {filteredItems.length} Products Available
                    </h2>
                    <button
                        onClick={() => navigate('/menu/add-item')}
                        className="bg-shuleamber text-navblue px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-navblue hover:text-white transition-all shadow-md"
                    >
                        <HiOutlinePlus className="text-base" />
                        Add Item to Menu
                    </button>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <HiOutlineSearch className="text-3xl text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold">Loading menu...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <img src="/empty_menu.png" alt="No items" className="w-40 opacity-90" />
                            </div>
                            <p className="text-slate-400 font-bold mt-4">No items available</p>
                            <button
                                onClick={() => navigate('/menu/add-item')}
                                className="mt-4 text-shuleamber text-sm underline"
                            >
                                + Add your first item
                            </button>
                        </div>
                    ) : (
                        filteredItems.map((item, index) => {
                            const quantityInCart = getItemQuantity(item.id);
                            return (
                                <div key={item.id}>
                                    <div
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                        onClick={() => addToCart(item)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-shuleamber/10 group-hover:text-shuleamber transition-colors overflow-hidden">
                                                {item.image ? (
                                                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <HiOutlineTag className="text-2xl" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-navblue font-bold text-base leading-tight">{item.name}</span>
                                                    {item.stock < 10 && (
                                                        <span className="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                                                    RWF {item.price?.toLocaleString()} 
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="relative w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-shuleamber hover:text-white transition-all active:scale-90"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item);
                                            }}
                                        >
                                            {quantityInCart > 0 && (
                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-shuleamber text-navblue text-[10px] font-black rounded-full flex items-center justify-center">
                                                    {quantityInCart}
                                                </span>
                                            )}
                                            <HiOutlinePlus className="text-xl" />
                                        </button>
                                    </div>
                                    {index < filteredItems.length - 1 && (
                                        <div className="mx-4 border-b border-slate-100"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingPage;