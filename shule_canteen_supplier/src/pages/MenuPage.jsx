import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlinePlus,
    HiOutlineChevronLeft,
    HiOutlineChevronRight
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MenuPage = () => {
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 6;

    useEffect(() => {
        const supplierId = user?.supplierId || supplier?.id;
        
        if (!supplierId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'products'),
            where('supplierId', '==', supplierId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMenuItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, supplier]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteDoc(doc(db, 'products', id));
                setOpenMenuId(null);
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    const supplierId = user?.supplierId || supplier?.id;

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Product <span className="text-shuleamber">Catalog</span></h2>
                    <p className="text-sm opacity-60 mt-1">Manage your product listings for canteens</p>
                </div>
                <button
                    onClick={() => navigate('/menu/add')}
                    className="w-full sm:w-auto justify-center bg-shuleamber text-navblue px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-shuleamber/10"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Table Header / Action Bar */}
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white">
                    <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest whitespace-nowrap mr-4">
                        Product Catalog ({filteredItems.length})
                    </span>
                    <div className="relative w-full max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-navblue/5 border-none rounded-xl py-2 pl-10 pr-4 text-xs text-navblue focus:ring-1 focus:ring-navblue transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
                            <span className="ml-3 text-navblue/40 text-sm">Loading catalog...</span>
                        </div>
                    ) : (
                        <table className="w-full text-left text-navblue text-xs relative">
                            <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-bold">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Product Name</th>
                                    <th className="hidden sm:table-cell px-6 py-4">Category</th>
                                    <th className="hidden md:table-cell px-6 py-4">Unit</th>
                                    <th className="px-4 sm:px-6 py-4">Price (RWF)</th>
                                    <th className="px-4 sm:px-6 py-4 text-center">Status</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[11px] sm:text-xs leading-tight">{item.name}</span>
                                                <span className="sm:hidden text-[9px] opacity-40 font-medium mt-0.5">
                                                    {item.category} • {item.unit} • RWF {item.price?.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 font-medium opacity-60">{item.category}</td>
                                        <td className="hidden md:table-cell px-6 py-4 italic text-[10px] opacity-40">{item.unit}</td>
                                        <td className="px-4 sm:px-6 py-4 font-black text-[11px] sm:text-xs">RWF {item.price?.toLocaleString()}</td>
                                        <td className="px-4 sm:px-6 py-4 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                                item.status === 'active' 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                {item.status === 'active' ? 'Listed' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => toggleMenu(item.id)}
                                                className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                            >
                                                <HiOutlineDotsVertical className="w-4 h-4" />
                                            </button>

                                            {openMenuId === item.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    ></div>
                                                    <div className="absolute right-6 top-10 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <button
                                                            onClick={() => navigate(`/menu/edit/${item.id}`)}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-bold text-navblue hover:bg-navblue/5 transition-colors uppercase tracking-widest"
                                                        >
                                                            Edit
                                                        </button>
                                                        <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && filteredItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <HiOutlineSearch className="w-16 h-16 text-navblue/20" />
                            <p className="text-navblue/40 italic">No products in your catalog.</p>
                            <button
                                onClick={() => navigate('/menu/add')}
                                className="mt-2 bg-shuleamber text-navblue px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all"
                            >
                                <HiOutlinePlus className="w-4 h-4" />
                                Add Your First Product
                            </button>
                        </div>
                    </div>
                ) : !loading && filteredItems.length > 0 && (
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-white">
                        <span className="text-[10px] text-navblue/40 font-bold">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length}
                        </span>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    currentPage === 1 
                                        ? 'opacity-20 cursor-not-allowed' 
                                        : 'bg-navblue/5 text-navblue hover:bg-navblue/10'
                                }`}
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                        currentPage === i + 1
                                            ? 'bg-navblue text-white shadow-md'
                                            : 'bg-navblue/5 text-navblue hover:bg-navblue/10'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    currentPage === totalPages 
                                        ? 'opacity-20 cursor-not-allowed' 
                                        : 'bg-navblue/5 text-navblue hover:bg-navblue/10'
                                }`}
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuPage;