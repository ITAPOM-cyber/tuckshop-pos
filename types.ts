
export type Role = 'admin' | 'cashier' | 'manager';
export type CurrencyCode = 'USD' | 'BWP' | 'ZAR';

export interface AppSettings {
  currency: CurrencyCode;
}

export interface PermissionMatrix {
  // Sales
  accessPOS: boolean;
  applyDiscounts: boolean;
  changeItemPrice: boolean;
  voidSales: boolean;
  processRefunds: boolean;
  openCashDrawer: boolean;
  // Inventory
  viewProducts: boolean;
  addProducts: boolean;
  editProducts: boolean;
  deleteProducts: boolean;
  manageCategories: boolean;
  adjustInventory: boolean;
  // Students
  createStudents: boolean;
  editStudents: boolean;
  addBalance: boolean;
  viewBalances: boolean;
  setSpendingLimits: boolean;
  // Reports
  viewSalesReports: boolean;
  viewProfitReports: boolean;
  exportReports: boolean;
  // Settings
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

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  walletBalance: number;
  dailySpendLimit: number;
  spentToday: number;
  restrictedProducts: string[]; // Product IDs
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
    quantity: number;
    priceAtSale: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  status: 'completed' | 'voided' | 'refunded';
}
