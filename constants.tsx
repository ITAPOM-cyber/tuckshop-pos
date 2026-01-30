
import { PermissionMatrix, Category, Product, Employee, Student } from './types';

export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  accessPOS: true,
  applyDiscounts: false,
  changeItemPrice: false,
  voidSales: false,
  processRefunds: false,
  openCashDrawer: true,
  viewProducts: true,
  addProducts: false,
  editProducts: false,
  deleteProducts: false,
  manageCategories: false,
  adjustInventory: false,
  createStudents: false,
  editStudents: false,
  addBalance: false,
  viewBalances: true,
  setSpendingLimits: false,
  viewSalesReports: false,
  viewProfitReports: false,
  exportReports: false,
  accessBackOffice: false,
  manageEmployees: false,
};

export const ADMIN_PERMISSIONS: PermissionMatrix = Object.keys(DEFAULT_PERMISSIONS).reduce((acc, key) => {
  acc[key as keyof PermissionMatrix] = true;
  return acc;
}, {} as PermissionMatrix);

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Snacks', color: 'bg-blue-500' },
  { id: '2', name: 'Drinks', color: 'bg-green-500' },
  { id: '3', name: 'Meals', color: 'bg-orange-500' },
  { id: '4', name: 'Sweets', color: 'bg-pink-500' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Apple Juice', categoryId: '2', sku: 'AJ001', costPrice: 0.8, sellingPrice: 1.5, stockQuantity: 50, imageUrl: 'https://picsum.photos/seed/juice/200', active: true },
  { id: 'p2', name: 'Cheese Sandwich', categoryId: '3', sku: 'CS001', costPrice: 1.2, sellingPrice: 3.5, stockQuantity: 20, imageUrl: 'https://picsum.photos/seed/sandwich/200', active: true },
  { id: 'p3', name: 'Potato Chips', categoryId: '1', sku: 'PC001', costPrice: 0.5, sellingPrice: 1.2, stockQuantity: 100, imageUrl: 'https://picsum.photos/seed/chips/200', active: true },
  { id: 'p4', name: 'Chocolate Bar', categoryId: '4', sku: 'CB001', costPrice: 0.4, sellingPrice: 1.0, stockQuantity: 75, imageUrl: 'https://picsum.photos/seed/chocolate/200', active: true },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Johnson', grade: 'Grade 5', walletBalance: 25.5, dailySpendLimit: 10.0, spentToday: 0, restrictedProducts: ['p4'], pin: '1234', qrCode: 'QR_ALEX', imageUrl: 'https://i.pravatar.cc/150?u=s1' },
  { id: 's2', name: 'Maria Garcia', grade: 'Grade 3', walletBalance: 5.2, dailySpendLimit: 5.0, spentToday: 0, restrictedProducts: [], pin: '5678', qrCode: 'QR_MARIA', imageUrl: 'https://i.pravatar.cc/150?u=s2' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Admin Staff', pin: '0000', role: 'admin', permissions: ADMIN_PERMISSIONS, active: true },
  { id: 'e2', name: 'Tuckshop Cashier', pin: '1111', role: 'cashier', permissions: DEFAULT_PERMISSIONS, active: true },
];
