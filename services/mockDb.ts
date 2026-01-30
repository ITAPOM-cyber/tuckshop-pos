
import { 
  Employee, Product, Category, Student, Transaction, 
  AppSettings, StockAdjustment, PurchaseOrder, Supplier, Variant
} from '../types';
import { 
  INITIAL_EMPLOYEES, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_STUDENTS 
} from '../constants';

const DB_KEY = 'tuckshop_db';

interface DB {
  employees: Employee[];
  products: Product[];
  categories: Category[];
  students: Student[];
  transactions: Transaction[];
  adjustments: StockAdjustment[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  settings: AppSettings;
}

const getDB = (): DB => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initial: DB = {
      employees: INITIAL_EMPLOYEES,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      students: INITIAL_STUDENTS,
      transactions: [],
      adjustments: [],
      purchaseOrders: [],
      suppliers: [
        { id: 'sup1', name: 'Fresh Foods Co.', contactName: 'Jane Smith', email: 'orders@freshfoods.com' },
        { id: 'sup2', name: 'Drink Distro', contactName: 'Bob Brown', email: 'sales@drinkdistro.com' }
      ],
      settings: { currency: 'USD' }
    };
    saveDB(initial);
    return initial;
  }
  return JSON.parse(data);
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const dbService = {
  getEmployees: () => getDB().employees,
  getProducts: () => getDB().products,
  getCategories: () => getDB().categories,
  getStudents: () => getDB().students,
  getTransactions: () => getDB().transactions,
  getAdjustments: () => getDB().adjustments,
  getPurchaseOrders: () => getDB().purchaseOrders,
  getSuppliers: () => getDB().suppliers,
  getSettings: () => getDB().settings,

  updateSettings: (settings: AppSettings) => {
    const db = getDB();
    db.settings = settings;
    saveDB(db);
  },

  updateProducts: (products: Product[]) => {
    const db = getDB();
    db.products = products;
    saveDB(db);
  },

  updateStudents: (students: Student[]) => {
    const db = getDB();
    db.students = students;
    saveDB(db);
  },

  updateEmployees: (employees: Employee[]) => {
    const db = getDB();
    db.employees = employees;
    saveDB(db);
  },

  seedSimulationData: () => {
    const db = getDB();
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
    
    // 1. Generate 50 Students
    const newStudents: Student[] = [];
    for (let i = 0; i < 50; i++) {
      const id = `S${1000 + i}`;
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      newStudents.push({
        id,
        name,
        grade: grades[Math.floor(Math.random() * grades.length)],
        walletBalance: parseFloat((Math.random() * 100 + 10).toFixed(2)),
        dailySpendLimit: parseFloat((Math.random() * 15 + 5).toFixed(2)),
        spentToday: 0,
        restrictedProducts: [],
        pin: '1234',
        qrCode: `QR_${id}`,
        imageUrl: `https://i.pravatar.cc/150?u=${id}`
      });
    }
    db.students = newStudents;

    // 2. Generate 30 Days of Transactions
    const newTransactions: Transaction[] = [];
    const products = db.products;
    const employees = db.employees;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let d = 30; d >= 0; d--) {
      const dayStart = now - (d * dayMs);
      // Random number of sales per day (between 15 and 40)
      const salesCount = Math.floor(Math.random() * 25) + 15;
      
      for (let s = 0; s < salesCount; s++) {
        // Random hour within school time (7am to 4pm)
        const hour = Math.floor(Math.random() * 9) + 7;
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(dayStart).setHours(hour, minute, 0, 0);
        
        const isStudentSale = Math.random() > 0.2;
        const student = isStudentSale ? newStudents[Math.floor(Math.random() * newStudents.length)] : null;
        const employee = employees[Math.floor(Math.random() * employees.length)];
        
        // Random items (1-4)
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subtotal = 0;

        for (let i = 0; i < itemCount; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const variant = product.variants ? product.variants[Math.floor(Math.random() * product.variants.length)] : undefined;
          const qty = Math.floor(Math.random() * 2) + 1;
          const price = variant ? variant.sellingPrice : product.sellingPrice;
          
          items.push({
            productId: product.id,
            variantId: variant?.id,
            quantity: qty,
            priceAtSale: price
          });
          subtotal += price * qty;
        }

        const methods: Array<'cash' | 'card' | 'wallet'> = ['cash', 'card'];
        if (isStudentSale) methods.push('wallet');
        const paymentMethod = methods[Math.floor(Math.random() * methods.length)];

        newTransactions.push({
          id: Math.random().toString(36).substr(2, 9),
          timestamp,
          employeeId: employee.id,
          studentId: student?.id,
          items,
          subtotal,
          discount: 0,
          total: subtotal,
          paymentMethod,
          status: 'completed'
        });
      }
    }
    db.transactions = newTransactions;
    saveDB(db);
  },

  addAdjustment: (adj: StockAdjustment) => {
    const db = getDB();
    db.adjustments.push(adj);
    const prod = db.products.find(p => p.id === adj.productId);
    if (prod && prod.trackStock) {
      if (adj.variantId && prod.variants) {
        const variant = prod.variants.find(v => v.id === adj.variantId);
        if (variant) variant.stockQuantity += adj.quantityChange;
      } else {
        prod.stockQuantity += adj.quantityChange;
      }
    }
    saveDB(db);
  },

  addPurchaseOrder: (po: PurchaseOrder) => {
    const db = getDB();
    db.purchaseOrders.push(po);
    saveDB(db);
  },

  receivePurchaseOrder: (poId: string) => {
    const db = getDB();
    const poIndex = db.purchaseOrders.findIndex(p => p.id === poId);
    if (poIndex === -1) return;
    
    const po = db.purchaseOrders[poIndex];
    if (po.status === 'received') return;

    po.status = 'received';
    po.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod && prod.trackStock) {
        if (item.variantId && prod.variants) {
          const variant = prod.variants.find(v => v.id === item.variantId);
          if (variant) {
            variant.stockQuantity += item.quantity;
            variant.costPrice = item.cost;
          }
        } else {
          prod.stockQuantity += item.quantity;
          prod.costPrice = item.cost;
        }
      }
    });
    saveDB(db);
  },

  addTransaction: (tx: Transaction) => {
    const db = getDB();
    db.transactions.push(tx);
    
    const deductStock = (productId: string, variantId?: string, qty: number = 1) => {
      const p = db.products.find(prod => prod.id === productId);
      if (!p || !p.trackStock) return;

      if (p.isComposite && p.components) {
        p.components.forEach(comp => {
          deductStock(comp.productId, undefined, comp.quantity * qty);
        });
      } else if (variantId && p.variants) {
        const v = p.variants.find(variant => variant.id === variantId);
        if (v) v.stockQuantity -= qty;
      } else {
        p.stockQuantity -= qty;
      }
    };

    tx.items.forEach(item => deductStock(item.productId, item.variantId, item.quantity));

    if (tx.studentId && tx.paymentMethod === 'wallet') {
      const s = db.students.find(stud => stud.id === tx.studentId);
      if (s) {
        s.walletBalance -= tx.total;
        s.spentToday += tx.total;
      }
    }
    saveDB(db);
  }
};
