
import { Employee, Product, Category, Student, Transaction, AppSettings } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_STUDENTS } from '../constants';

const DB_KEY = 'tuckshop_db';

interface DB {
  employees: Employee[];
  products: Product[];
  categories: Category[];
  students: Student[];
  transactions: Transaction[];
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
      settings: {
        currency: 'USD'
      }
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
  getEmployees: () => [...getDB().employees],
  getProducts: () => [...getDB().products],
  getCategories: () => [...getDB().categories],
  getStudents: () => [...getDB().students],
  getTransactions: () => [...getDB().transactions],
  getSettings: () => ({ ...getDB().settings }),
  
  updateSettings: (settings: AppSettings) => {
    const db = getDB();
    db.settings = { ...db.settings, ...settings };
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

  addTransaction: (tx: Transaction) => {
    const db = getDB();
    db.transactions.push(tx);
    
    // Update inventory
    tx.items.forEach(item => {
      const p = db.products.find(prod => prod.id === item.productId);
      if (p) p.stockQuantity -= item.quantity;
    });

    // Update student wallet
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
