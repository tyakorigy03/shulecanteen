import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCloudUpload, HiOutlineTag, HiOutlineCurrencyDollar, HiOutlineClipboardList, HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import API_BASE, { IMAGE_BASE } from '../config/api';

const AddMenuItem = () => {
    const navigate = useNavigate();
    const { user, school } = useAuth();
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


    const categories = ['Food', 'Beverage', 'Snack', 'Dessert', 'Breakfast', 'Lunch'];

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
            const inventoryData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                stockLabel: formData.unit,
                description: formData.description,
                schoolCode: user.schoolCode,
                image: imageUrl,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'schools', user.schoolCode, 'inventory'), inventoryData);
            
            alert('✅ Item added to menu successfully!');
            navigate('/listing');
            
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${IMAGE_BASE}${path}`;
    };

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
                                                <p className="text-sm text-slate-400">Click to upload image</p>
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
                            <label className="text-xs font-bold text-navblue/60 uppercase tracking-wider block mb-2">Initial Stock</label>
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
                            'Add to Menu'
                        )}
                    </button>
                </form>

                {/* Info Note */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                        <HiOutlineClipboardList className="text-blue-500 text-lg mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-blue-700">Note</p>
                            <p className="text-[10px] text-blue-600 mt-0.5">
                                Items added here will appear in your canteen menu and can be sold to students.
                                You can also add items by purchasing from suppliers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMenuItem;