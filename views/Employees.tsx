
import React, { useState, useMemo, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Employee, Transaction, Product, Role } from '../types';
import { ADMIN_PERMISSIONS, DEFAULT_PERMISSIONS } from '../constants';
import { 
  Plus, 
  ShieldCheck, 
  UserCog, 
  Lock, 
  Check, 
  X, 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  History,
  ChevronRight,
  User,
  KeyRound,
  Fingerprint
} from 'lucide-react';

const EmployeesView: React.FC = () => {
  const { currencySymbol } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Staff Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    pin: '',
    role: 'cashier' as Role
  });

  const transactions = dbService.getTransactions();
  const products = dbService.getProducts();

  const loadData = () => {
    setEmployees(dbService.getEmployees());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaff.pin.length !== 4) {
      alert("PIN must be exactly 4 digits.");
      return;
    }

    const id = `e${Math.random().toString(36).substr(2, 9)}`;
    const permissions = newStaff.role === 'admin' ? ADMIN_PERMISSIONS : DEFAULT_PERMISSIONS;

    const employee: Employee = {
      id,
      name: newStaff.name,
      pin: newStaff.pin,
      role: newStaff.role,
      permissions,
      active: true
    };

    const updated = [...employees, employee];
    dbService.updateEmployees(updated);
    setEmployees(updated);
    setIsAddModalOpen(false);
    setNewStaff({ name: '', pin: '', role: 'cashier' });
  };

  // Calculate stats for a specific employee
  const getStaffPerformance = (empId: string) => {
    const staffTxs = transactions.filter(t => t.employeeId === empId && t.status === 'completed');
    const revenue = staffTxs.reduce((sum, t) => sum + t.total, 0);
    const profit = staffTxs.reduce((sum, t) => {
      const txProfit = t.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const cost = prod?.costPrice || 0;
        return itemSum + ((item.priceAtSale - cost) * item.quantity);
      }, 0);
      return sum + txProfit;
    }, 0);

    return {
      revenue,
      profit,
      count: staffTxs.length,
      recentTxs: staffTxs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
    };
  };

  const selectedStaffStats = useMemo(() => {
    if (!selectedStaff) return null;
    return getStaffPerformance(selectedStaff.id);
  }, [selectedStaff, transactions, products]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Staff Management</h1>
          <p className="text-gray-500 font-medium">Monitor cashier performance and manage system access.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {employees.map(emp => {
          const stats = getStaffPerformance(emp.id);
          return (
            <div key={emp.id} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden group">
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <UserCog className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{emp.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                        {emp.role}
                      </span>
                      <span className="text-gray-400 text-xs font-mono font-medium tracking-tighter">ID: {emp.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 px-8 border-x border-gray-50">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sales</p>
                    <p className="font-black text-gray-900">{currencySymbol}{stats.revenue.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                    <p className="font-black text-gray-900">{stats.count}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedStaff(emp)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Profile
                  </button>
                  <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Permission Status
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(emp.permissions).slice(0, 6).map(([key, value]) => (
                    <div key={key} className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                      value ? 'bg-white border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-300'
                    }`}>
                      {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                  ))}
                  <span className="text-[10px] text-gray-400 font-bold px-2 py-1 italic">+ more</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <UserCog className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">New Employee</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Create staff access</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Staff Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input 
                    required
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Sarah Jenkins"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Access PIN</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input 
                      required
                      type="password"
                      maxLength={4}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 tracking-widest"
                      placeholder="••••"
                      value={newStaff.pin}
                      onChange={(e) => setNewStaff({...newStaff, pin: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">System Role</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value as Role})}
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-bold text-blue-900">Permission Mapping</p>
                  <p className="text-xs text-blue-600/70 mt-1 leading-relaxed">
                    Access rights are assigned based on the selected role. Managers and Admins have back-office access.
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Fingerprint className="w-6 h-6" />
                Register Staff Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Profile Modal */}
      {selectedStaff && selectedStaffStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedStaff.name}</h2>
                  <p className="text-xs text-blue-600 font-black uppercase tracking-widest">{selectedStaff.role} Profile</p>
                </div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Performance Cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-2xl font-black text-blue-700">{currencySymbol}{selectedStaffStats.revenue.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Total Profit</p>
                  <p className="text-2xl font-black text-green-700">{currencySymbol}{selectedStaffStats.profit.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Transaction Count</p>
                  <p className="text-2xl font-black text-indigo-700">{selectedStaffStats.count}</p>
                </div>
              </div>

              {/* Individual Audit Log */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Personal Transaction Audit
                </h3>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-3xl overflow-hidden bg-white">
                  {selectedStaffStats.recentTxs.length > 0 ? selectedStaffStats.recentTxs.map(tx => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          tx.paymentMethod === 'wallet' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {tx.paymentMethod.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Order #{tx.id}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(tx.timestamp).toLocaleDateString()} at {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">{currencySymbol}{tx.total.toFixed(2)}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{tx.paymentMethod}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-gray-400">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">No transactions processed by this cashier yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedStaff(null)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesView;
