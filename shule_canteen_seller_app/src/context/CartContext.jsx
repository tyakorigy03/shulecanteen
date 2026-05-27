import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalQuantity = useMemo(() =>
        cartItems.reduce((total, item) => total + item.quantity, 0)
        , [cartItems]);

    const totalAmount = useMemo(() =>
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
        , [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalQuantity,
        totalAmount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
