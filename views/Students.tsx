
import React, { useState, useMemo, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Student, Transaction, Product } from '../types';
import { Plus, Search, DollarSign, Ban, History, Shield, X, UserPlus, CheckCircle2, ShoppingBag, Calendar, ArrowUpCircle, Camera } from 'lucide-react';

const StudentsView: React.FC = () => {
  const { currencySymbol } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  
  // Add Funds State
  const [topUpStudent, setTopUpStudent] = useState<Student | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const transactions = dbService.getTransactions();
  const products = dbService.getProducts();

  const loadData = () => {
    setStudents(dbService.getStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const [newStudent, setNewStudent] = useState({
    name: '',
    grade: '',
    balance: '0',
    limit: '10.00',
    imageUrl: ''
  });

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  const studentTransactions = useMemo(() => {
    if (!historyStudent) return [];
    return transactions
      .filter(t => t.studentId === historyStudent.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [historyStudent, transactions]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `S${Math.floor(1000 + Math.random() * 9000)}`;
    const student: Student = {
      id,
      name: newStudent.name,
      grade: newStudent.grade,
      walletBalance: parseFloat(newStudent.balance) || 0,
      dailySpendLimit: parseFloat(newStudent.limit) || 10,
      spentToday: 0,
      restrictedProducts: [],
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      qrCode: `QR_${id}`,
      imageUrl: newStudent.imageUrl || `https://i.pravatar.cc/150?u=${id}`
    };

    const updated = [...students, student];
    dbService.updateStudents(updated);
    loadData();
    setIsModalOpen(false);
    setNewStudent({ name: '', grade: '', balance: '0', limit: '10.00', imageUrl: '' });
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpStudent || !topUpAmount) return;

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    const updated = students.map(s => {
      if (s.id === topUpStudent.id) {
        return { ...s, walletBalance: s.walletBalance + amount };
      }
      return s;
    });

    dbService.updateStudents(updated);
    setStudents(updated);
    setTopUpStudent(null);
    setTopUpAmount('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudent(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Wallets</h1>
          <p className="text-gray-500">Manage student balances, spend limits, and dietary restrictions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Register Student
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, grade, or ID..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? filtered.map(s => (
          <div key={s.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} className="w-14 h-14 rounded-2xl object-cover shadow-inner" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-inner">
                    {s.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{s.name}</h3>
                  <p className="text-gray-400 text-sm font-medium">{s.grade} • ID: <span className="font-mono">{s.id}</span></p>
                </div>
              </div>
              <span className="bg-blue-50 text-blue-600 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Balance</p>
                <p className="text-xl font-black text-gray-900">{currencySymbol}{s.walletBalance.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Limit</p>
                <p className="text-xl font-black text-gray-900">{currencySymbol}{s.dailySpendLimit.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTopUpStudent(s)}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Add Funds
              </button>
              <button 
                onClick={() => setHistoryStudent(s)}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-10 h-10 text-gray-300" />
             </div>
             <p className="text-gray-500 font-medium">No students found matching your search</p>
          </div>
        )}
      </div>

      {/* Top-Up Modal */}
      {topUpStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Funds to Wallet</h2>
              <button onClick={() => setTopUpStudent(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleTopUpSubmit} className="p-6 space-y-4">
              <div className="text-center pb-2 flex flex-col items-center">
                {topUpStudent.imageUrl ? (
                  <img src={topUpStudent.imageUrl} className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-white shadow-md" />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-2">
                    {topUpStudent.name.charAt(0)}
                  </div>
                )}
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-bold text-gray-900">{topUpStudent.name}</p>
                <p className="text-xs text-gray-400">Current Balance: {currencySymbol}{topUpStudent.walletBalance.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount to Add ({currencySymbol})</label>
                <input 
                  autoFocus
                  required
                  type="number" 
                  step="0.01"
                  min="0.01"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 text-2xl font-black text-center outline-none"
                  placeholder="0.00"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all"
              >
                Confirm Top-Up
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{historyStudent.name}'s History</h2>
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Transaction Log</p>
                </div>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {studentTransactions.length > 0 ? studentTransactions.map(tx => (
                <div key={tx.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">
                        {new Date(tx.timestamp).toLocaleDateString()} at {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      tx.paymentMethod === 'wallet' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    {tx.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-2">
                             <span className="w-5 h-5 bg-gray-200 text-gray-600 rounded flex items-center justify-center text-[10px] font-black">
                               {item.quantity}
                             </span>
                             <span className="text-gray-700 font-medium">{product?.name || 'Unknown Item'}</span>
                           </div>
                           <span className="text-gray-500">{currencySymbol}{(item.priceAtSale * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Paid</span>
                      <span className="text-lg font-black text-gray-900">{currencySymbol}{tx.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4 opacity-50">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                     <ShoppingBag className="w-10 h-10 text-gray-300" />
                   </div>
                   <p className="text-gray-500 font-bold">No purchase history found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" />
                Register New Student
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                      {newStudent.imageUrl ? (
                        <img src={newStudent.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                      <Plus className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Add Student Photo (Optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. John Smith"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Grade / Class</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Grade 10-A"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Initial Balance ({currencySymbol})</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newStudent.balance}
                      onChange={(e) => setNewStudent({...newStudent, balance: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Daily Limit ({currencySymbol})</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newStudent.limit}
                      onChange={(e) => setNewStudent({...newStudent, limit: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsView;
