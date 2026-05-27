import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
    HiOutlineArrowLeft, 
    HiOutlineShoppingCart, 
    HiOutlineOfficeBuilding,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineTag,
    HiOutlineCheckCircle,
    HiOutlinePlus,
    HiOutlineMinus,
    HiX,
    HiOutlineArrowRight
} from 'react-icons/hi';
import { usePurchase } from '../context/PurchaseContext';

const DiscoverPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToPurchase, purchaseItems, totalQuantity, totalAmount } = usePurchase();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [currentQuantityInCart, setCurrentQuantityInCart] = useState(0);
    const [addedQuantity, setAddedQuantity] = useState(0); // Track what was just added

    const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productRef = doc(db, 'products', id);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                    setProduct({ id: productSnap.id, ...productSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Check current quantity in cart
    useEffect(() => {
        if (product && purchaseItems) {
            const existingItem = purchaseItems.find(item => item.id === product.id);
            if (existingItem) {
                setCurrentQuantityInCart(existingItem.quantity);
            } else {
                setCurrentQuantityInCart(0);
            }
        }
    }, [product, purchaseItems]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            // Store the quantity being added before modifying cart
            const qtyToAdd = quantity;
            setAddedQuantity(qtyToAdd);
            
            // Add the product with selected quantity
            for (let i = 0; i < qtyToAdd; i++) {
                addToPurchase(product);
            }
            
            // Show success modal
            setShowSuccessModal(true);
            // Reset quantity to 1 after adding
            setQuantity(1);
        }
    };

    const handleContinueShopping = () => {
        setShowSuccessModal(false);
        navigate('/purchases/new');
    };

    const handleGoToCheckout = () => {
        setShowSuccessModal(false);
        navigate('/purchases/checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <img src="https://shulecantine.babyeyi.rw/cantine/empty_inventory.png" alt="Not found" className="w-48 mb-6" />
                <p className="text-slate-400 italic">Product not found</p>
                <button 
                    onClick={() => navigate('/purchases/new')}
                    className="mt-6 text-shuleamber font-bold hover:underline"
                >
                    Back to Catalog
                </button>
            </div>
        );
    }

    const totalPrice = product.price * quantity;
    // Calculate the new totals based on what's being added
    const newTotalQuantity = totalQuantity + quantity;
    const newTotalAmount = totalAmount + totalPrice;
    // New quantity in cart for this specific product after addition
    const newProductQuantityInCart = currentQuantityInCart + quantity;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Success Icon */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <HiOutlineCheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-black text-navblue">Added to Cart!</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {quantity} × {product.name} added to your purchase order
                            </p>
                        </div>

                        {/* Cart Summary */}
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500">This product in cart:</span>
                                <span className="font-bold text-navblue">{newProductQuantityInCart} {product.unit}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500">Cart Total Items:</span>
                                <span className="font-bold text-navblue">{newTotalQuantity} items</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Total Amount:</span>
                                <span className="font-bold text-shuleamber text-lg">RWF {newTotalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGoToCheckout}
                                className="w-full bg-shuleamber text-navblue py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95"
                            >
                                <HiOutlineShoppingCart className="w-5 h-5" />
                                Go to Checkout
                                <HiOutlineArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleContinueShopping}
                                className="w-full bg-white border-2 border-navblue/20 text-navblue py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                            >
                                Continue Shopping
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
                        >
                            <HiX className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Sticky Bottom Bar for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-lg z-20 lg:hidden">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-slate-400">Total for {quantity} {quantity === 1 ? 'item' : 'items'}</p>
                        <p className="text-xl font-black text-navblue">RWF {totalPrice.toLocaleString()}</p>
                        {currentQuantityInCart > 0 && (
                            <p className="text-[10px] text-shuleamber">
                                Already {currentQuantityInCart} in cart
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="bg-shuleamber text-navblue px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <HiOutlineShoppingCart className="w-5 h-5" />
                        Add {quantity} to Cart
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Product Image & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Image Card */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                            <div className="aspect-square bg-slate-50 flex items-center justify-center p-8">
                                {product.image && getImageUrl(product.image) ? (
                                    <img 
                                        src={getImageUrl(product.image)} 
                                        alt={product.name}
                                        className="w-full h-full object-contain max-h-[400px]"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><HiOutlineTag className="text-6xl text-slate-300" /></div>';
                                        }}
                                    />
                                ) : (
                                    <HiOutlineTag className="text-6xl text-slate-300" />
                                )}
                            </div>
                        </div>

                        {/* Product Details Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-navblue">{product.name}</h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="text-xs bg-shuleamber/10 text-shuleamber px-2 py-1 rounded-full font-bold">
                                            {product.category}
                                        </span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {product.unit}
                                        </span>
                                        {currentQuantityInCart > 0 && (
                                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">
                                                {currentQuantityInCart} in cart
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-sm text-slate-400">Unit Price</p>
                                    <p className="text-2xl font-black text-navblue">RWF {product.price?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Quantity Selector for Desktop */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-navblue mb-3">Quantity</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={decreaseQuantity}
                                        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-navblue hover:bg-slate-200 transition-all"
                                    >
                                        <HiOutlineMinus className="w-5 h-5" />
                                    </button>
                                    <span className="text-2xl font-black text-navblue w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={increaseQuantity}
                                        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-navblue hover:bg-slate-200 transition-all"
                                    >
                                        <HiOutlinePlus className="w-5 h-5" />
                                    </button>
                                    <div className="ml-4">
                                        <p className="text-sm text-slate-500">
                                            Total: <span className="font-bold text-navblue">RWF {totalPrice.toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-navblue mb-2">Description</h3>
                                    <p className="text-sm text-slate-600">{product.description}</p>
                                </div>
                            )}

                            {/* Desktop Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="hidden lg:flex w-full mt-8 bg-shuleamber text-navblue py-4 rounded-xl font-bold items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95"
                            >
                                <HiOutlineShoppingCart className="w-5 h-5" />
                                Add {quantity} {quantity === 1 ? 'Item' : 'Items'} to Cart
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Supplier Profile */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-navblue/10 flex items-center justify-center">
                                    <HiOutlineOfficeBuilding className="w-6 h-6 text-navblue" />
                                </div>
                                <div>
                                    <h3 className="text-navblue font-bold">Supplier Information</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Verified Vendor</p>
                                </div>
                            </div>

                            {/* Supplier Logo & Name */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                                    {product.supplier?.logo ? (
                                        <img 
                                            src={getImageUrl(product.supplier.logo)} 
                                            alt={product.supplier.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><HiOutlineOfficeBuilding className="text-2xl text-slate-300" /></div>';
                                            }}
                                        />
                                    ) : (
                                        <HiOutlineOfficeBuilding className="text-2xl text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-navblue">{product.supplier?.name || 'Supplier'}</h4>
                                    <p className="text-[10px] text-green-600 flex items-center gap-1 mt-1">
                                        <HiOutlineCheckCircle className="w-3 h-3" />
                                        Verified Supplier
                                    </p>
                                </div>
                            </div>

                            {/* Supplier Contact Info */}
                            <div className="space-y-3">
                                {product.supplier?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                                        <span>{product.supplier.phone}</span>
                                    </div>
                                )}
                                {product.supplier?.email && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <HiOutlineMail className="w-4 h-4 text-slate-400" />
                                        <span>{product.supplier.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-500">Your Cart Total:</span>
                                    <span className="font-bold text-navblue">{totalQuantity} items</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Total Amount:</span>
                                    <span className="font-bold text-shuleamber">RWF {totalAmount.toLocaleString()}</span>
                                </div>
                                {totalQuantity > 0 && (
                                    <button
                                        onClick={() => navigate('/purchases/checkout')}
                                        className="w-full mt-4 bg-navblue text-white py-2 rounded-xl text-sm font-bold hover:bg-shuleamber hover:text-navblue transition-all"
                                    >
                                        Proceed to Checkout
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscoverPage;