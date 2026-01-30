
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
  { id: 'p1', name: 'Apple Juice', categoryId: '2', sku: 'AJ001', costPrice: 0.8, sellingPrice: 1.5, stockQuantity: 50, minStockLevel: 5, imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a9d669?q=80&w=200&h=200&auto=format&fit=crop', active: true, isComposite: false, trackStock: true },
  { id: 'p2', name: 'Cheese Sandwich', categoryId: '3', sku: 'CS001', costPrice: 1.2, sellingPrice: 3.5, stockQuantity: 20, minStockLevel: 5, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=200&h=200&auto=format&fit=crop', active: true, isComposite: false, trackStock: true },
  { id: 'p3', name: 'Potato Chips', categoryId: '1', sku: 'PC001', costPrice: 0.5, sellingPrice: 1.2, stockQuantity: 100, minStockLevel: 10, imageUrl: 'https://images.unsplash.com/photo-1566478431370-137bc386008f?q=80&w=200&h=200&auto=format&fit=crop', active: true, isComposite: false, trackStock: true },
  { id: 'p5', name: 'Fresh Coffee', categoryId: '2', sku: 'COF-BASE', costPrice: 0.5, sellingPrice: 2.5, stockQuantity: 0, minStockLevel: 0, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&auto=format&fit=crop', active: true, isComposite: false, trackStock: true, variants: [
    { id: 'v1', name: 'Small', sku: 'COF-S', costPrice: 0.4, sellingPrice: 2.0, stockQuantity: 30 },
    { id: 'v2', name: 'Medium', sku: 'COF-M', costPrice: 0.6, sellingPrice: 3.0, stockQuantity: 25 },
    { id: 'v3', name: 'Large', sku: 'COF-L', costPrice: 0.8, sellingPrice: 4.0, stockQuantity: 15 },
  ]},
  { id: 'p4', name: 'Chocolate Bar', categoryId: '4', sku: 'CB001', costPrice: 0.4, sellingPrice: 1.0, stockQuantity: 75, minStockLevel: 10, imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=200&h=200&auto=format&fit=crop', active: true, isComposite: false, trackStock: true },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Johnson', grade: 'Grade 5', walletBalance: 25.5, dailySpendLimit: 10.0, spentToday: 0, restrictedProducts: ['p4'], pin: '1234', qrCode: 'QR_ALEX', imageUrl: 'https://i.pravatar.cc/150?u=s1' },
  { id: 's2', name: 'Maria Garcia', grade: 'Grade 3', walletBalance: 5.2, dailySpendLimit: 5.0, spentToday: 0, restrictedProducts: [], pin: '5678', qrCode: 'QR_MARIA', imageUrl: 'https://i.pravatar.cc/150?u=s2' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Admin Staff', pin: '0000', role: 'admin', permissions: ADMIN_PERMISSIONS, active: true },
  { id: 'e2', name: 'Tuckshop Cashier', pin: '1111', role: 'cashier', permissions: DEFAULT_PERMISSIONS, active: true },
];
