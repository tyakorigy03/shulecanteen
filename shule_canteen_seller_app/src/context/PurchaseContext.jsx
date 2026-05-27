import { createContext, useContext, useState, useMemo } from 'react';

const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
    const [purchaseItems, setPurchaseItems] = useState([]);

    const addToPurchase = (product) => {
        setPurchaseItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromPurchase = (id) => {
        setPurchaseItems(prev => prev.filter(item => item.id !== id));
    };

    const updatePurchaseQuantity = (id, delta) => {
        setPurchaseItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearPurchase = () => setPurchaseItems([]);

    const totalQuantity = useMemo(() => purchaseItems.reduce((acc, item) => acc + item.quantity, 0), [purchaseItems]);
    const totalAmount = useMemo(() => purchaseItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [purchaseItems]);

    return (
        <PurchaseContext.Provider value={{
            purchaseItems,
            addToPurchase,
            removeFromPurchase,
            updatePurchaseQuantity,
            clearPurchase,
            totalQuantity,
            totalAmount
        }}>
            {children}
        </PurchaseContext.Provider>
    );
};

export const usePurchase = () => useContext(PurchaseContext);
