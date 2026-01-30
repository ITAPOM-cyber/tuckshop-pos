
import React, { useMemo } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  UserCheck,
  PackageCheck
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardView: React.FC = () => {
  const { currencySymbol } = useApp();
  const transactions = dbService.getTransactions();
  const products = dbService.getProducts();
  const students = dbService.getStudents();
  const employees = dbService.getEmployees();
  const categories = dbService.getCategories();

  const stats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const todaySales = transactions
      .filter(t => t.timestamp >= today && t.status === 'completed')
      .reduce((sum, t) => sum + t.total, 0);
    
    const lowStockCount = products.filter(p => p.trackStock && p.stockQuantity <= p.minStockLevel).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.trackStock ? p.costPrice * p.stockQuantity : 0), 0);
    
    return {
      todaySales,
      studentCount: students.length,
      transactionCount: transactions.length,
      lowStockCount,
      inventoryValue
    };
  }, [transactions, products, students]);

  const salesByGrade = useMemo(() => {
    const gradeMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.studentId) {
        const student = students.find(s => s.id === t.studentId);
        if (student) {
          gradeMap[student.grade] = (gradeMap[student.grade] || 0) + t.total;
        }
      }
    });
    return Object.entries(gradeMap).map(([name, total]) => ({ name, total }));
  }, [transactions, students]);

  const salesByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const cat = categories.find(c => c.id === product.categoryId);
          const catName = cat ? cat.name : 'Uncategorized';
          catMap[catName] = (catMap[catName] || 0) + (item.priceAtSale * item.quantity);
        }
      });
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [transactions, products, categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [transactions]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Dashboard</h1>
          <p className="text-gray-500 font-medium">Real-time inventory health and sales performance.</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl shadow-blue-200">
          <PackageCheck className="w-6 h-6" />
          <div>
            <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Stock Assets</p>
            <p className="text-xl font-black">{currencySymbol}{stats.inventoryValue.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Sales" value={`${currencySymbol}${stats.todaySales.toFixed(2)}`} icon={TrendingUp} color="blue" trend="+12%" />
        <StatCard title="Total Students" value={stats.studentCount.toString()} icon={Users} color="purple" />
        <StatCard title="Total Orders" value={stats.transactionCount.toString()} icon={ShoppingBag} color="green" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockCount.toString()} icon={AlertTriangle} color="orange" isWarning={stats.lowStockCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest">Revenue by Grade</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByGrade}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toFixed(2)}`, 'Sales']}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest">Categories</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toFixed(2)}`, 'Revenue']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              Live Audit Feed
            </h3>
            <button className="text-blue-600 text-sm font-black flex items-center gap-1 hover:underline uppercase tracking-widest">
              Full Logs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(tx => {
              const student = students.find(s => s.id === tx.studentId);
              const cashier = employees.find(e => e.id === tx.employeeId);
              return (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${
                      tx.paymentMethod === 'wallet' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {tx.paymentMethod === 'wallet' ? 'W' : 'C'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{student ? student.name : 'Walk-in'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <UserCheck className="w-3 h-3 text-gray-400" />
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                           By {cashier?.name || 'Unknown'}
                        </p>
                        <span className="text-gray-300">•</span>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-lg">{currencySymbol}{tx.total.toFixed(2)}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{tx.paymentMethod}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 tracking-tight text-white/90">Daily Goal</h3>
            <p className="text-white/50 text-sm font-medium">Sales target: {currencySymbol}500.00</p>
          </div>
          <div className="py-10 relative z-10">
            <div className="flex justify-between items-end mb-4">
               <span className="text-6xl font-black">{Math.min(100, Math.floor((stats.todaySales / 500) * 100))}%</span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Target</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(100, (stats.todaySales / 500) * 100)}%` }} />
            </div>
          </div>
          <p className="text-xs font-bold text-white/40 leading-relaxed italic relative z-10">
            "Note: Tracking 12% more items since physical inventory audit."
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: any; color: string; trend?: string; isWarning?: boolean }> = ({ title, value, icon: Icon, color, trend, isWarning }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${isWarning ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl shadow-inner ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-green-50 text-green-600 flex items-center gap-1 shadow-sm">
             <ArrowUpRight className="w-3 h-3" />
             {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default DashboardView;
