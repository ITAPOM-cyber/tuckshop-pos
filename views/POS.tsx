
import React, { useState, useMemo, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Product, Student, Category, Employee, Transaction } from '../types';
import { 
  Search, 
  Trash2, 
  User, 
  CreditCard, 
  Wallet, 
  Banknote,
  Minus,
  Plus,
  ArrowLeft,
  X,
  CheckCircle2,
  ShoppingCart,
  Scan,
  Users,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface POSProps {
  currentUser: Employee;
}

const POSView: React.FC<POSProps> = ({ currentUser }) => {
  const { currencySymbol } = useApp();
  const [products] = useState<Product[]>(dbService.getProducts());
  const [categories] = useState<Category[]>(dbService.getCategories());
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(dbService.getTransactions());
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Student Lookup State
  const [showStudentLookup, setShowStudentLookup] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Initial load
  useEffect(() => {
    setStudents(dbService.getStudents());
  }, []);

  // Sync latest student data when opening lookup to avoid stale balances
  useEffect(() => {
    if (showStudentLookup) {
      setStudents(dbService.getStudents());
    }
  }, [showStudentLookup]);

  // Session Stats Calculation
  const sessionStats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const sessionTxs = transactions.filter(t => 
      t.employeeId === currentUser.id && 
      t.timestamp >= today && 
      t.status === 'completed'
    );

    const revenue = sessionTxs.reduce((sum, t) => sum + t.total, 0);
    
    // Profit = (Sell Price - Cost Price) * Qty
    const profit = sessionTxs.reduce((sum, t) => {
      const txProfit = t.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const cost = prod?.costPrice || 0;
        return itemSum + ((item.priceAtSale - cost) * item.quantity);
      }, 0);
      return sum + txProfit;
    }, 0);

    return { revenue, profit, count: sessionTxs.length };
  }, [transactions, currentUser.id, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.active;
    });
  }, [products, selectedCategory, searchQuery]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students.slice(0, 10);
    return students.filter(s => 
      s.id.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.name.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const total = subtotal;

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert("Out of stock!");
      return;
    }
    
    if (selectedStudent?.restrictedProducts.includes(product.id)) {
      alert(`Restriction: ${selectedStudent.name} is not allowed to purchase ${product.name}.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = (method: 'cash' | 'card' | 'wallet') => {
    if (cart.length === 0) return;

    if (method === 'wallet') {
      if (!selectedStudent) {
        setShowStudentLookup(true);
        return;
      }
      if (selectedStudent.walletBalance < total) {
        alert("Insufficient wallet balance.");
        return;
      }
      if (selectedStudent.spentToday + total > selectedStudent.dailySpendLimit) {
        alert(`Daily spend limit exceeded. Remaining: ${currencySymbol}${(selectedStudent.dailySpendLimit - selectedStudent.spentToday).toFixed(2)}`);
        return;
      }
    }

    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      employeeId: currentUser.id,
      studentId: selectedStudent?.id,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtSale: item.product.sellingPrice
      })),
      subtotal,
      discount: 0,
      total,
      paymentMethod: method,
      status: 'completed'
    };

    dbService.addTransaction(tx);
    setCheckoutComplete(true);
    setTimeout(() => {
      setCart([]);
      setSelectedStudent(null);
      setShowCheckout(false);
      setCheckoutComplete(false);
      // Refresh local states
      setStudents(dbService.getStudents());
      setTransactions(dbService.getTransactions());
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header/Search */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items by name or SKU..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Session Stats Toggle */}
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${showStats ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <BarChart3 className="w-5 h-5" />
            Shift Stats
          </button>

          {selectedStudent && (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-in slide-in-from-right-4">
              {selectedStudent.imageUrl ? (
                <img src={selectedStudent.imageUrl} className="w-8 h-8 rounded-full object-cover border border-blue-200 shadow-sm" alt="" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
              )}
              <div className="text-sm">
                <p className="font-bold text-blue-900 leading-none">{selectedStudent.name}</p>
                <p className="text-blue-600 text-xs mt-1 font-medium">Bal: {currencySymbol}{selectedStudent.walletBalance.toFixed(2)}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-blue-400 hover:text-blue-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stats Panel (Overlay) */}
        {showStats && (
          <div className="absolute top-20 right-4 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Shift Performance</h4>
              <button onClick={() => setShowStats(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Today's Revenue</p>
                <p className="text-2xl font-black text-green-700">{currencySymbol}{sessionStats.revenue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Today's Profit</p>
                <p className="text-2xl font-black text-blue-700">{currencySymbol}{sessionStats.profit.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-gray-500 font-bold uppercase">Total Orders</span>
                <span className="font-black text-gray-900">{sessionStats.count}</span>
              </div>
            </div>
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === null ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col group relative"
            >
              <div className="overflow-hidden rounded-xl mb-3">
                <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                <p className="text-blue-600 font-bold mt-1">{currencySymbol}{product.sellingPrice.toFixed(2)}</p>
              </div>
              <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${product.stockQuantity < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                Stock: {product.stockQuantity}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Sidebar: Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-gray-400" />
            Order
          </h3>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
            {cart.reduce((s, i) => s + i.quantity, 0)} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <p className="font-medium">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 group">
                <img src={item.product.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-sm text-gray-800 truncate">{item.product.name}</h5>
                  <p className="text-xs text-gray-500">{currencySymbol}{item.product.sellingPrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQuantity(item.product.id, -1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.product.id, 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:text-green-500 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary & Finalize Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Finalize Order
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Student Selection Modal */}
      {showStudentLookup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold">Search Student</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Identify for account sale</p>
              </div>
              <button onClick={() => setShowStudentLookup(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter Student ID or Full Name..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredStudents.length > 0 ? filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s);
                    setShowStudentLookup(false);
                    setStudentSearch('');
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} className="w-12 h-12 bg-blue-100 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500 font-medium">ID: {s.id} • {s.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">{currencySymbol}{s.walletBalance.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Balance</p>
                  </div>
                </button>
              )) : (
                <div className="py-20 text-center text-gray-400">
                  <Scan className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No students found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal: Choose Payment Method */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {checkoutComplete ? (
              <div className="p-16 text-center space-y-6">
                <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900">Paid & Done!</h2>
                  <p className="text-gray-500 text-lg mt-2">The transaction was successful. Receipt printed.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-2xl font-black text-gray-900">Finalize Payment</h2>
                  <button onClick={() => setShowCheckout(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                
                <div className="p-10 space-y-10">
                  <div className="text-center bg-blue-50 py-8 rounded-3xl border border-blue-100">
                    <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-sm mb-2">Total Amount Due</p>
                    <p className="text-7xl font-black text-blue-700">{currencySymbol}{total.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Methods */}
                    <button 
                      onClick={() => handleCheckout('cash')} 
                      className="flex flex-col items-center gap-4 p-10 rounded-[2rem] border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all group active:scale-95"
                    >
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Banknote className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="font-black text-xl text-gray-900 block">Cash</span>
                        <span className="text-xs text-gray-400 font-bold uppercase mt-1">Pay at Register</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleCheckout('card')} 
                      className="flex flex-col items-center gap-4 p-10 rounded-[2rem] border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group active:scale-95"
                    >
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="font-black text-xl text-gray-900 block">Card</span>
                        <span className="text-xs text-gray-400 font-bold uppercase mt-1">Terminal Pay</span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    {!selectedStudent ? (
                      <button 
                        onClick={() => setShowStudentLookup(true)}
                        className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group font-bold"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 rounded-xl flex items-center justify-center transition-colors">
                            <User className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-lg">Sell to Student Account</p>
                            <p className="text-xs font-medium">Lookup student by ID or name first</p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleCheckout('wallet')}
                        className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all font-bold ${
                          selectedStudent.walletBalance >= total 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xl hover:bg-blue-700' 
                          : 'border-red-100 bg-red-50 text-red-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                             selectedStudent.walletBalance >= total ? 'bg-white/20' : 'bg-red-100'
                          }`}>
                            <Wallet className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-lg">Wallet: {selectedStudent.name}</p>
                            <p className={`text-xs ${selectedStudent.walletBalance >= total ? 'text-blue-100' : 'text-red-400 font-black'}`}>
                              Available Balance: {currencySymbol}{selectedStudent.walletBalance.toFixed(2)}
                              {selectedStudent.walletBalance < total && ' (INSUFFICIENT)'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           {selectedStudent.walletBalance < total && (
                             <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedStudent(null); setShowStudentLookup(true); }}
                              className="px-4 py-2 bg-white text-red-500 rounded-lg text-xs font-black shadow-sm"
                             >
                              CHANGE
                             </button>
                           )}
                           <ChevronRight className="w-6 h-6" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POSView;
