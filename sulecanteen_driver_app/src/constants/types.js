/**
 * SHULE CANTEEN SYSTEM TYPES & CONSTANTS
 * Central source of truth for enums, schemas, and factory templates.
 * Updated: May 24, 2024 - Added Student Manifest & POS Transaction schemas.
 */

// --- 1. ENUMS ---

const USER_ROLES = {
    SUPERADMIN: 'superadmin',
    CANTEEN_ADMIN: 'canteen',
    SUPPLIER: 'supplier',
    DRIVER: 'driver',
    ACCOUNTANT: 'accountant',
    OPERATOR: 'operator'
};

const ENTITY_TYPE = {
    CANTEEN: 'canteen',
    SUPPLIER: 'supplier'
};

const ONBOARDING_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
};

const ORDER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    READY: 'ready',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

const SHIPMENT_STATUS = {
    LOADING: 'loading',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    DELAYED: 'delayed',
    CANCELLED: 'cancelled'
};

// --- 2. SCHEMA FACTORIES (Blueprints) ---

const createUser = (data = {}) => ({
    uid: data.uid || '',
    phone: data.phone || '',
    fullName: data.fullName || '',
    role: data.role || USER_ROLES.OPERATOR,
    schoolCode: data.schoolCode || '',
    status: data.status || ONBOARDING_STATUS.ACTIVE,
    createdAt: data.createdAt || new Date().toISOString()
});

/**
 * Validates a student from the manifest (Firestore: schools/{code}/data/students_manifest)
 */
const createStudentEntry = (data = {}) => ({
    id: data.id || '', // Legacy MySQL ID
    code: data.code || '', // Student/Card Code for QR
    name: data.name || '',
    class: data.class || '',
    balance: data.balance || 0
});

/**
 * Creates a Sales Transaction (Seller POS -> Sales Collection)
 */
const createSale = (data = {}) => ({
    saleId: data.saleId || `TXN-${Date.now()}`,
    canteenId: data.canteenId || '',
    operatorId: data.operatorId || '',
    studentId: data.studentId || '',
    studentName: data.studentName || '',
    items: data.items || [], // Array of { id, name, price, quantity }
    totalAmount: data.totalAmount || 0,
    status: 'successful',
    createdAt: data.createdAt || new Date().toISOString()
});

const createInventoryItem = (data = {}) => ({
    id: data.id || '',
    name: data.name || '',
    category: data.category || '',
    price: data.price || 0,
    stock: data.stock || 0,
    canteenId: data.canteenId || '',
    updatedAt: data.updatedAt || new Date().toISOString()
});

const createPurchaseOrder = (data = {}) => ({
    canteenId: data.canteenId || '',
    canteenName: data.canteenName || '',
    supplierId: data.supplierId || '',
    supplierName: data.supplierName || '',
    paymentMethod: data.paymentMethod || 'Cash',
    total: data.total || 0,
    items: data.items || [],
    status: data.status || ORDER_STATUS.PENDING,
    createdAt: data.createdAt || new Date().toISOString()
});

// --- 3. EXPORTS ---

const SHULE_TYPES = {
    USER_ROLES,
    ENTITY_TYPE,
    ONBOARDING_STATUS,
    ORDER_STATUS,
    SHIPMENT_STATUS,
    createUser,
    createStudentEntry,
    createSale,
    createInventoryItem,
    createPurchaseOrder
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SHULE_TYPES;
}

export {
    USER_ROLES,
    ENTITY_TYPE,
    ONBOARDING_STATUS,
    ORDER_STATUS,
    SHIPMENT_STATUS,
    createUser,
    createStudentEntry,
    createSale,
    createInventoryItem,
    createPurchaseOrder
};

export default SHULE_TYPES;
