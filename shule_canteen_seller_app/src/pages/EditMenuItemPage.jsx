import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCloudUpload, HiOutlineTag, HiOutlineCurrencyDollar, HiOutlineClipboardList, HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import API_BASE, { IMAGE_BASE } from '../config/api';

const EditMenuItemPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        unit: 'piece',
        description: ''
    });
    const [initialLoading, setInitialLoading] = useState(!location.state?.item);

    const categories = ['Food', 'Beverage', 'Snack', 'Dessert', 'Breakfast', 'Lunch'];

    // Load item data
    useEffect(() => {
        const loadItem = async () => {
            if (location.state?.item) {
                const item = location.state.item;
                setFormData({
                    name: item.name || '',
                    category: item.category || '',
                    price: item.price || '',
                    stock: item.stock || '',
                    unit: item.stockLabel || 'piece',
                    description: item.description || ''
                });
                setImageUrl(item.image || '');
                setInitialLoading(false);
            } else if (id && user?.schoolCode) {
                try {
                    const docRef = doc(db, 'schools', user.schoolCode, 'inventory', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const item = docSnap.data();
                        setFormData({
                            name: item.name || '',
                            category: item.category || '',
                            price: item.price || '',
                            stock: item.stock || '',
                            unit: item.stockLabel || 'piece',
                            description: item.description || ''
                        });
                        setImageUrl(item.image || '');
                    }
                } catch (error) {
                    console.error('Error loading item:', error);
                } finally {
                    setInitialLoading(false);
                }
            }
        };
        loadItem();
    }, [id, user?.schoolCode, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formDataImg = new FormData();
        formDataImg.append('image', file);
        formDataImg.append('supplierId', user.schoolCode || 'canteen');

        try {
            const response = await fetch(`${API_BASE}/images/upload`, {
                method: 'POST',
                body: formDataImg
            });

            const data = await response.json();
            if (data.success) {
                setImageUrl(data.imageUrl);
            } else {
                alert('Failed to upload image: ' + data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = () => {
        setImageUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.price || !formData.category) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        
        try {
            const itemRef = doc(db, 'schools', user.schoolCode, 'inventory', id);
            const updateData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                stockLabel: formData.unit,
                description: formData.description,
                image: imageUrl,
                updatedAt: serverTimestamp()
            };

            await updateDoc(itemRef, updateData);
            
            alert('✅ Item updated successfully!');
            navigate('/listing');
            
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${IMAGE_BASE}${path}`;
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="max-w-md mx-auto px-4 pt-6">
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Item Image</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-shuleamber transition-all">
                            {imageUrl ? (
                                <div className="relative inline-block">
                                    <img 
                                        src={getImageUrl(imageUrl)} 
                                        alt="Preview" 
                                        className="w-32 h-32 object-cover rounded-xl mx-auto"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                                    >
                                        <HiOutlineX className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <div className="flex flex-col items-center gap-2 py-4">
                                        {uploadingImage ? (
                                            <div className="w-10 h-10 border-2 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <HiOutlinePhotograph className="w-10 h-10 text-slate-300" />
                                                <p className="text-sm text-slate-400">Click to upload new image</p>
                                                <p className="text-[10px] text-slate-300">PNG, JPG up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Item Name */}
                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Item Name *</label>
                        <div className="relative">
                            <HiOutlineTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Chapati, Rice, Juice"
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-navblue focus:outline-none focus:border-shuleamber transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-navblue focus:outline-none focus:border-shuleamber transition-all"
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Price (RWF) *</label>
                            <div className="relative">
                                <HiOutlineCurrencyDollar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-navblue focus:outline-none focus:border-shuleamber transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-navblue focus:outline-none focus:border-shuleamber transition-all"
                            />
                        </div>
                    </div>

                    {/* Unit */}
                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Unit</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-navblue focus:outline-none focus:border-shuleamber transition-all"
                        >
                            <option value="piece">Piece</option>
                            <option value="plate">Plate</option>
                            <option value="cup">Cup</option>
                            <option value="bottle">Bottle</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="g">Gram (g)</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Describe the item..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-navblue focus:outline-none focus:border-shuleamber transition-all resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="w-full bg-shuleamber text-navblue py-4 rounded-xl font-bold text-sm hover:bg-navblue hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin mx-auto"></div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </form>

               
            </div>
        </div>
    );
};

export default EditMenuItemPage;