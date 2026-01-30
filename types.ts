
export type Role = 'admin' | 'cashier' | 'manager';
export type CurrencyCode = 'USD' | 'BWP' | 'ZAR';

export interface AppSettings {
  currency: CurrencyCode;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface PermissionMatrix {
  accessPOS: boolean;
  applyDiscounts: boolean;
  changeItemPrice: boolean;
  voidSales: boolean;
  processRefunds: boolean;
  openCashDrawer: boolean;
  viewProducts: boolean;
  addProducts: boolean;
  editProducts: boolean;
  deleteProducts: boolean;
  manageCategories: boolean;
  adjustInventory: boolean;
  createStudents: boolean;
  editStudents: boolean;
  addBalance: boolean;
  viewBalances: boolean;
  setSpendingLimits: boolean;
  viewSalesReports: boolean;
  viewProfitReports: boolean;
  exportReports: boolean;
  accessBackOffice: boolean;
  manageEmployees: boolean;
}

export interface Employee {
  id: string;
  name: string;
  pin: string;
  role: Role;
  permissions: PermissionMatrix;
  active: boolean;
}

export interface ProductComponent {
  productId: string;
  quantity: number;
}

export interface Variant {
  id: string;
  name: string; // e.g., 'Small', 'Large', 'Blue'
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl: string;
  active: boolean;
  isComposite: boolean;
  trackStock: boolean; // Toggle for physical stock vs service
  variants?: Variant[]; // Multi-variant support
  components?: ProductComponent[];
}

export type AdjustmentReason = 'damage' | 'return' | 'inventory_count' | 'waste' | 'restock' | 'stocktake';

export interface StockAdjustment {
  id: string;
  timestamp: number;
  productId: string;
  variantId?: string; // Optional variant attribution
  quantityChange: number;
  reason: AdjustmentReason;
  employeeId: string;
  expectedStock?: number; // For stocktakes
  actualStock?: number;   // For stocktakes
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
}

export type POStatus = 'draft' | 'ordered' | 'received';

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  date: number;
  status: POStatus;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    cost: number;
  }>;
  total: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  walletBalance: number;
  dailySpendLimit: number;
  spentToday: number;
  restrictedProducts: string[];
  pin: string;
  qrCode: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  employeeId: string;
  studentId?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    priceAtSale: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  status: 'completed' | 'voided' | 'refunded';
}
