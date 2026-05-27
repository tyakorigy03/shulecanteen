import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDuplicate,
    HiOutlineCloudUpload,
    HiOutlineDownload,
    HiOutlinePhotograph,
    HiOutlineUpload
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AddItemPage = () => {
    const navigate = useNavigate();
    const { user, supplier } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState({});
    const [products, setProducts] = useState([
        { id: Date.now(), image: '', imageFile: null, name: '', category: '', unit: '', price: '', status: 'active' }
    ]);

    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    const categories = ['Grains & Cereals', 'Vegetables', 'Protein', 'Snacks & Drinks', 'Beverages', 'Dairy', 'Bakery', 'General Store'];
    const units = ['kg', 'g', 'L', 'mL', 'piece', 'bundle', 'dozen', 'pack'];

    const addNewRow = () => {
        setProducts([...products, { id: Date.now() + Math.random(), image: '', imageFile: null, name: '', category: '', unit: '', price: '', status: 'active' }]);
    };

    const duplicateRow = (index) => {
        const productToDuplicate = { ...products[index], id: Date.now() + Math.random(), image: '', imageFile: null };
        const newProducts = [...products];
        newProducts.splice(index + 1, 0, productToDuplicate);
        setProducts(newProducts);
    };

    const removeRow = (index) => {
        if (products.length === 1) {
            alert("Keep at least one product row");
            return;
        }
        const newProducts = products.filter((_, i) => i !== index);
        setProducts(newProducts);
    };

    const updateProduct = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const handleImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const supplierId = user?.supplierId || supplier?.id;
        if (!supplierId) {
            alert('Supplier ID not found');
            return;
        }

        setUploadingImages(prev => ({ ...prev, [index]: true }));

        const formData = new FormData();
        formData.append('image', file);
        formData.append('supplierId', supplierId);

        try {
            const response = await fetch(`${API_BASE}/images/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                updateProduct(index, 'image', data.imageUrl);
                updateProduct(index, 'imageFile', null);
            } else {
                alert('Failed to upload image: ' + data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploadingImages(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validProducts = products.filter(p => p.name && p.category && p.price);
        
        if (validProducts.length === 0) {
            alert('Please add at least one product with name, category, and price');
            return;
        }

        setLoading(true);
        
        try {
            const supplierId = user?.supplierId || supplier?.id;
            const supplierData = {
                id: supplierId,
                name: supplier?.companyName || supplier?.businessName,
                logo: supplier?.logoUrl || '',
                phone: supplier?.phone,
                email: supplier?.email
            };

            const batch = writeBatch(db);
            const productsRef = collection(db, 'products');
            
            for (const product of validProducts) {
                const docRef = doc(productsRef);
                batch.set(docRef, {
                    name: product.name,
                    category: product.category,
                    unit: product.unit || 'piece',
                    price: parseFloat(product.price),
                    image: product.image || '',
                    description: '',
                    status: product.status,
                    supplierId: supplierId,
                    supplier: supplierData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            await batch.commit();
            
            alert(`${validProducts.length} product(s) added successfully!`);
            navigate('/menu');
        } catch (error) {
            console.error('Error adding products:', error);
            alert('Failed to add products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkPaste = async () => {
        const text = await navigator.clipboard.readText();
        const rows = text.split('\n');
        const newProducts = [...products];
        
        for (const row of rows) {
            const cols = row.split('\t');
            if (cols.length >= 3 && cols[0].trim()) {
                newProducts.push({
                    id: Date.now() + Math.random(),
                    image: '',
                    imageFile: null,
                    name: cols[0].trim(),
                    category: cols[1]?.trim() || '',
                    price: cols[2]?.trim() || '',
                    unit: cols[3]?.trim() || 'piece',
                    status: 'active'
                });
            }
        }
        
        if (newProducts.length > products.length) {
            setProducts(newProducts);
            alert(`Added ${newProducts.length - products.length} products from clipboard`);
        } else {
            alert('No valid data found. Format: Name\tCategory\tPrice\tUnit');
        }
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header Section */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black">Add <span className="text-shuleamber">Products</span></h2>
                        <p className="text-sm opacity-60">Batch import your catalog items</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleBulkPaste}
                        className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                    >
                        <HiOutlineDownload className="w-4 h-4" />
                        Paste from Excel
                    </button>
                    <button
                        type="button"
                        onClick={addNewRow}
                        className="bg-shuleamber text-navblue px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white transition-all"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Add Row
                    </button>
                </div>
            </div>

            {/* Batch Entry Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-navblue text-sm">
                            <thead className="bg-gray-100 text-navblue">
                                <tr>
                                    <th className="px-4 py-3 w-8">#</th>
                                    <th className="px-4 py-3 w-20">Image</th>
                                    <th className="px-4 py-3">Product Name *</th>
                                    <th className="px-4 py-3">Category *</th>
                                    <th className="px-4 py-3">Unit</th>
                                    <th className="px-4 py-3">Price (RWF) *</th>
                                    <th className="px-4 py-3 w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-gray-400 text-xs">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <label className="cursor-pointer block">
                                                {uploadingImages[index] ? (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200">
                                                        <div className="w-5 h-5 border-2 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
                                                    </div>
                                                ) : product.image ? (
                                                    <div className="relative group">
                                                        <img 
                                                            src={`${IMAGE_BASE}${product.image}`} 
                                                            alt="Preview" 
                                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <HiOutlineUpload className="w-4 h-4 text-white" />
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-200 transition-colors">
                                                        <HiOutlinePhotograph className="w-5 h-5 text-gray-400" />
                                                        <span className="text-[8px] text-gray-400 mt-0.5">Add</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            style={{ width: '48px', height: '48px' }}
                                                        />
                                                    </div>
                                                )}
                                            </label>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={product.name}
                                                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                                placeholder="e.g., Rice 5kg"
                                                className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-shuleamber focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={product.category}
                                                onChange={(e) => updateProduct(index, 'category', e.target.value)}
                                                className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-shuleamber focus:outline-none"
                                            >
                                                <option value="">Select</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={product.unit}
                                                onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                                                className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-shuleamber focus:outline-none"
                                            >
                                                <option value="">Select</option>
                                                {units.map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={product.price}
                                                onChange={(e) => updateProduct(index, 'price', e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-transparent border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-shuleamber focus:outline-none"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => duplicateRow(index)}
                                                    className="p-1.5 text-gray-400 hover:text-shuleamber transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <HiOutlineDuplicate className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Remove"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="7" className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={addNewRow}
                                            className="text-shuleamber text-sm font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <HiOutlinePlus className="w-4 h-4" />
                                            Add another product
                                        </button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary & Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
                        <div className="text-sm text-navblue/60">
                            <span className="font-bold text-navblue">{products.filter(p => p.name && p.price).length}</span> products ready to add
                            {products.filter(p => !p.name || !p.price).length > 0 && (
                                <span className="ml-2 text-amber-600">
                                    ({products.filter(p => !p.name || !p.price).length} incomplete)
                                </span>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/menu')}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-navblue/60 hover:text-navblue transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-navblue text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-shuleamber hover:text-navblue transition-all shadow-lg disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineCloudUpload className="w-4 h-4" />
                                        Add {products.filter(p => p.name && p.price).length} Product(s)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemPage;