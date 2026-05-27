import { createContext, useContext, useState, useMemo } from 'react';

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
    const [activeOrders, setActiveOrders] = useState([]);

    const confirmOrder = (order) => {
        setActiveOrders(prev => {
            const existing = prev.find(o => o.id === order.id);
            if (existing) return prev; // Avoid duplicates
            return [...prev, { ...order, confirmedAt: new Date().toISOString() }];
        });
    };

    const removeOrder = (orderId) => {
        setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const clearDelivery = () => setActiveOrders([]);

    const orderCount = useMemo(() => activeOrders.length, [activeOrders]);

    return (
        <DeliveryContext.Provider value={{
            activeOrders,
            confirmOrder,
            removeOrder,
            clearDelivery,
            orderCount
        }}>
            {children}
        </DeliveryContext.Provider>
    );
};

export const useDelivery = () => useContext(DeliveryContext);
