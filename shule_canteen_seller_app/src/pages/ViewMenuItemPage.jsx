import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineTag, HiOutlineCurrencyDollar, HiOutlineClipboardList, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { db } from '../config/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import API_BASE, { IMAGE_BASE } from '../config/api';

const ViewMenuItemPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const location = useLocation();
    const [item, setItem] = useState(location.state?.item || null);
    const [loading, setLoading] = useState(!location.state?.item);

    useEffect(() => {
        if (!item && id && user?.schoolCode) {
            const fetchItem = async () => {
                try {
                    const docRef = doc(db, 'schools', user.schoolCode, 'inventory', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setItem({ id: docSnap.id, ...data });
                    }
                } catch (error) {
                    console.error('Error fetching item:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchItem();
        } else if (item) {
            setLoading(false);
        }
    }, [id, user?.schoolCode, item]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Check if it's a Firestore Timestamp object
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString();
        }
        // Check if it's a seconds/nanoseconds object
        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString();
        }
        // Check if it's a string or number
        if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            return new Date(timestamp).toLocaleDateString();
        }
        return 'N/A';
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${item?.name}"?`)) {
            try {
                await deleteDoc(doc(db, 'schools', user.schoolCode, 'inventory', id));
                alert('Item deleted successfully');
                navigate('/listing');
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <p className="text-slate-400">Item not found</p>
                <button onClick={() => navigate('/listing')} className="mt-4 text-shuleamber">Back to Menu</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="max-w-md mx-auto px-4 pt-6">
                {/* Item Image */}
                <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm border border-slate-100">
                    <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                        {item.image ? (
                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <HiOutlineTag className="text-6xl text-slate-300" />
                        )}
                    </div>
                </div>

                {/* Item Details */}
                <div className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-slate-100">
                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Item Name</label>
                        <p className="text-lg font-bold text-navblue mt-1">{item.name}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Category</label>
                        <p className="text-md font-semibold text-navblue mt-1">{item.category}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Price (RWF)</label>
                            <p className="text-xl font-black text-shuleamber mt-1">RWF {item.price?.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Stock</label>
                            <p className={`text-xl font-black mt-1 ${item.stock < 10 ? 'text-red-500' : 'text-navblue'}`}>
                                {item.stock} {item.stockLabel || 'units'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Unit</label>
                        <p className="text-md font-semibold text-navblue mt-1">{item.stockLabel || 'piece'}</p>
                    </div>

                    {item.description && (
                        <div>
                            <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Description</label>
                            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider">Added On</label>
                        <p className="text-sm text-slate-500 mt-1">
                            {formatDate(item.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => navigate(`/menu/edit/${item.id}`, { state: { item } })}
                        className="flex-1 bg-navblue text-white py-3 rounded-xl font-bold text-sm hover:bg-shuleamber hover:text-navblue transition-all flex items-center justify-center gap-2"
                    >
                        <HiOutlinePencil className="text-lg" />
                        Edit Item
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                        <HiOutlineTrash className="text-lg" />
                        Delete Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewMenuItemPage;