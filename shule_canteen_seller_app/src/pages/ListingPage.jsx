import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineTag, HiOutlinePlus, HiOutlineDotsVertical, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import API_BASE, { IMAGE_BASE } from '../config/api';

const ListingPage = () => {
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSticky, setIsSticky] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
    const menuRef = useRef(null);

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
            setInventory(items);
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
            setContextMenu({ visible: false, x: 0, y: 0, item: null });
        };
        window.addEventListener('scroll', handleScroll);
        
        // Close context menu when clicking outside
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setContextMenu({ visible: false, x: 0, y: 0, item: null });
            }
        };
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    const getItemQuantity = (itemId) => {
        const cartItem = cartItems.find(item => item.id === itemId);
        return cartItem?.quantity || 0;
    };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            item: item
        });
    };

    const handleViewDetails = (item) => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
        navigate(`/menu/item/${item.id}`, { state: { item } });
    };

    const handleEditItem = (item) => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
        navigate(`/menu/edit/${item.id}`, { state: { item } });
    };

    const handleDeleteItem = async (item) => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
        
        if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, 'schools', user.schoolCode, 'inventory', item.id));
                alert('Item deleted successfully');
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item');
            }
        }
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
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    onClick={() => addToCart(item)}
                                    onContextMenu={(e) => handleContextMenu(e, item)}
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

                                    <div className="relative">
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
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    ref={menuRef}
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-2 min-w-[160px] animate-in fade-in zoom-in duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={() => handleViewDetails(contextMenu.item)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-navblue hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                        <HiOutlineEye className="text-lg text-shuleamber" />
                        View Details
                    </button>
                    <button
                        onClick={() => handleEditItem(contextMenu.item)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-navblue hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                        <HiOutlinePencil className="text-lg text-shuleamber" />
                        Edit Item
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                        onClick={() => handleDeleteItem(contextMenu.item)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                        <HiOutlineTrash className="text-lg" />
                        Delete Item
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListingPage;