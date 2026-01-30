
import React, { useState, useMemo, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Student, Transaction, Product } from '../types';
// Added Users and Save to the lucide-react imports to fix errors on lines 255 and 378
import { 
  Plus, Search, DollarSign, Ban, History, Shield, X, 
  UserPlus, CheckCircle2, ShoppingBag, Calendar, ArrowUpCircle, 
  Camera, Trash2, Edit2, QrCode, Lock, Check, Info, AlertTriangle,
  ChevronDown, ChevronUp, Tag, Users, Save
} from 'lucide-react';

const StudentsView: React.FC = () => {
  const { currencySymbol } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [products] = useState<Product[]>(dbService.getProducts());
  const [search, setSearch] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [topUpStudent, setTopUpStudent] = useState<Student | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  // Form State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    walletBalance: '0',
    dailySpendLimit: '10.00',
    imageUrl: '',
    restrictedProducts: [] as string[]
  });

  const transactions = dbService.getTransactions();

  const loadData = () => {
    setStudents(dbService.getStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      walletBalance: '0',
      dailySpendLimit: '10.00',
      imageUrl: '',
      restrictedProducts: []
    });
    setEditingStudent(null);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      walletBalance: student.walletBalance.toString(),
      dailySpendLimit: student.dailySpendLimit.toString(),
      imageUrl: student.imageUrl || '',
      restrictedProducts: student.restrictedProducts
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Student[];

    if (editingStudent) {
      const student: Student = {
        ...editingStudent,
        name: formData.name,
        grade: formData.grade,
        walletBalance: parseFloat(formData.walletBalance) || 0,
        dailySpendLimit: parseFloat(formData.dailySpendLimit) || 10,
        imageUrl: formData.imageUrl,
        restrictedProducts: formData.restrictedProducts
      };
      updated = students.map(s => s.id === editingStudent.id ? student : s);
      dbService.updateStudents(updated);
      setIsModalOpen(false);
    } else {
      const id = `S${Math.floor(1000 + Math.random() * 9000)}`;
      const student: Student = {
        id,
        name: formData.name,
        grade: formData.grade,
        walletBalance: parseFloat(formData.walletBalance) || 0,
        dailySpendLimit: parseFloat(formData.dailySpendLimit) || 10,
        spentToday: 0,
        restrictedProducts: formData.restrictedProducts,
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        qrCode: `QR_${id}`,
        imageUrl: formData.imageUrl || `https://i.pravatar.cc/150?u=${id}`
      };
      updated = [...students, student];
      dbService.updateStudents(updated);
      setShowSuccess(student);
    }

    loadData();
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student? All wallet records will be lost.")) return;
    const updated = students.filter(s => s.id !== id);
    dbService.updateStudents(updated);
    setStudents(updated);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpStudent || !topUpAmount) return;

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    const updated = students.map(s => s.id === topUpStudent.id ? { ...s, walletBalance: s.walletBalance + amount } : s);
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
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRestriction = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      restrictedProducts: prev.restrictedProducts.includes(productId)
        ? prev.restrictedProducts.filter(id => id !== productId)
        : [...prev.restrictedProducts, productId]
    }));
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Wallets</h1>
          <p className="text-gray-500 font-medium tracking-tight">Manage student balances, permissions, and health restrictions.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Register Student
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student name, Grade, or S-Number ID..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? filtered.map(s => (
          <div key={s.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <button onClick={() => handleOpenEdit(s)} className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-5 mb-8">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt={s.name} className="w-16 h-16 rounded-2xl object-cover shadow-inner border border-gray-100" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {s.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-black text-xl text-gray-900 leading-tight">{s.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">{s.grade}</span>
                  <span className="text-gray-300 font-bold">•</span>
                  <span className="text-gray-400 text-xs font-mono">{s.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100/30">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Balance</p>
                <p className="text-2xl font-black text-blue-700">{currencySymbol}{s.walletBalance.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100/30">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Daily Limit</p>
                <p className="text-2xl font-black text-indigo-700">{currencySymbol}{s.dailySpendLimit.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTopUpStudent(s)}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all text-sm shadow-lg active:scale-95"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Add Funds
              </button>
              <button 
                onClick={() => setHistoryStudent(s)}
                className="px-5 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all shadow-inner"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Users className="w-12 h-12 text-gray-300" />
             </div>
             <p className="text-xl font-bold text-gray-400">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Profile/Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  {editingStudent ? <Edit2 className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{editingStudent ? 'Edit Student Profile' : 'Register New Student'}</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">School Management Database</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-7 h-7 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-xl group-hover:border-blue-500 transition-all">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-10 h-10 text-gray-300" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl cursor-pointer shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                      <Plus className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Student Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g. Liam Thompson"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Grade / Class Level</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g. Grade 11-C"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Initial Funds</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-black text-green-600"
                        value={formData.walletBalance}
                        onChange={(e) => setFormData({...formData, walletBalance: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Daily Limit</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-black text-indigo-600"
                        value={formData.dailySpendLimit}
                        onChange={(e) => setFormData({...formData, dailySpendLimit: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 flex items-center justify-between">
                      Purchase Restrictions
                      <span className="text-blue-500">{formData.restrictedProducts.length} Blocked</span>
                    </label>
                    <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-4 max-h-[400px] overflow-y-auto space-y-2">
                       {products.map(p => (
                         <button
                           key={p.id}
                           type="button"
                           onClick={() => toggleRestriction(p.id)}
                           className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                             formData.restrictedProducts.includes(p.id) 
                               ? 'bg-red-50 border border-red-100 text-red-700' 
                               : 'bg-white border border-transparent text-gray-600 hover:border-gray-200'
                           }`}
                         >
                            <div className="flex items-center gap-3">
                               <img src={p.imageUrl} className="w-8 h-8 rounded-lg object-cover" />
                               <span className="text-sm font-bold">{p.name}</span>
                            </div>
                            {formData.restrictedProducts.includes(p.id) ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 opacity-10" />}
                         </button>
                       ))}
                    </div>
                    <p className="mt-3 text-[10px] text-gray-400 italic font-medium">Selected items will be blocked at the POS during student checkout.</p>
                 </div>

                 <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-4"
                 >
                  {editingStudent ? <Save className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  {editingStudent ? 'Save Profile Updates' : 'Complete Registration'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Registration Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-500">
            <div className="p-12 text-center space-y-8">
               <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-12 h-12" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-gray-900">Registration Complete</h2>
                  <p className="text-gray-500 font-medium mt-2">The student account is now active.</p>
               </div>

               <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access PIN</p>
                    <p className="text-5xl font-black text-blue-600 tracking-tighter">{showSuccess.pin}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Required for Terminal Access</p>
                  </div>
                  
                  <div className="flex justify-center p-4 bg-white rounded-3xl border border-gray-100">
                     <QrCode className="w-32 h-32 text-gray-900" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{showSuccess.name}</p>
               </div>

               <button 
                onClick={() => setShowSuccess(null)}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all"
               >
                 Got it, continue
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Top-Up Modal */}
      {topUpStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black">Top-Up Wallet</h2>
              <button onClick={() => setTopUpStudent(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleTopUpSubmit} className="p-8 space-y-6">
              <div className="text-center pb-2 flex flex-col items-center">
                {topUpStudent.imageUrl ? (
                  <img src={topUpStudent.imageUrl} className="w-20 h-20 rounded-[1.5rem] object-cover mb-4 border-2 border-white shadow-xl" />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black mb-4">
                    {topUpStudent.name.charAt(0)}
                  </div>
                )}
                <p className="text-xs font-black text-blue-500 uppercase tracking-widest">{topUpStudent.id}</p>
                <p className="font-black text-xl text-gray-900">{topUpStudent.name}</p>
                <p className="text-sm font-bold text-gray-400 mt-1">Available: {currencySymbol}{topUpStudent.walletBalance.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-center">Amount to Add ({currencySymbol})</label>
                <input 
                  autoFocus required
                  type="number" step="0.01" min="0.01"
                  className="w-full p-5 rounded-[1.5rem] bg-gray-100 border-none text-3xl font-black text-center outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="0.00"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                Authorize Credit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Professional History Audit Modal */}
      {historyStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{historyStudent.name}</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Student Transaction Audit</p>
                </div>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-7 h-7 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/30">
              {studentTransactions.length > 0 ? studentTransactions.map(tx => (
                <div key={tx.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-900">
                        {new Date(tx.timestamp).toLocaleDateString()} at {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      tx.paymentMethod === 'wallet' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    {tx.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-3">
                             <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                               {item.quantity}
                             </span>
                             <span className="text-gray-800 font-bold">{product?.name || 'Unknown Item'}</span>
                           </div>
                           <span className="text-gray-900 font-black">{currencySymbol}{(item.priceAtSale * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-4 mt-2 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Paid</span>
                      <span className="text-xl font-black text-blue-600">{currencySymbol}{tx.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center space-y-4 opacity-50">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                     <ShoppingBag className="w-10 h-10 text-gray-300" />
                   </div>
                   <p className="text-lg font-black text-gray-400">No purchase history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsView;
