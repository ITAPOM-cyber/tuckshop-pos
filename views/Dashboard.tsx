
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
  ChevronRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardView: React.FC = () => {
  const { currencySymbol } = useApp();
  const transactions = dbService.getTransactions();
  const products = dbService.getProducts();
  const students = dbService.getStudents();
  const categories = dbService.getCategories();

  const stats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const todaySales = transactions
      .filter(t => t.timestamp >= today && t.status === 'completed')
      .reduce((sum, t) => sum + t.total, 0);
    
    const lowStockCount = products.filter(p => p.stockQuantity < 10).length;
    
    return {
      todaySales,
      studentCount: students.length,
      transactionCount: transactions.length,
      lowStockCount
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
      <header>
        <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-500">Analytics and real-time performance tracking.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Sales" value={`${currencySymbol}${stats.todaySales.toFixed(2)}`} icon={TrendingUp} color="blue" trend="+8%" />
        <StatCard title="Total Students" value={stats.studentCount.toString()} icon={Users} color="purple" />
        <StatCard title="Total Orders" value={stats.transactionCount.toString()} icon={ShoppingBag} color="green" />
        <StatCard title="Low Stock" value={stats.lowStockCount.toString()} icon={AlertTriangle} color="orange" isWarning={stats.lowStockCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Grade Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue by Grade</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByGrade}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toFixed(2)}`, 'Sales']}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Pie */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Sales by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toFixed(2)}`, 'Revenue']}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recent Activity
            </h3>
            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(tx => {
              const student = students.find(s => s.id === tx.studentId);
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      tx.paymentMethod === 'wallet' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {tx.paymentMethod === 'wallet' ? 'W' : 'C'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{student ? student.name : 'Walk-in Customer'}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{currencySymbol}{tx.total.toFixed(2)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{tx.paymentMethod}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Inventory Summary */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xl font-bold mb-2">Performance Goal</h3>
            <p className="text-blue-100 text-sm">Target daily revenue: {currencySymbol}500.00</p>
          </div>
          <div className="py-8">
            <div className="flex justify-between items-end mb-2">
               <span className="text-4xl font-black">{Math.min(100, Math.floor((stats.todaySales / 500) * 100))}%</span>
               <span className="text-sm font-bold uppercase tracking-wider text-blue-200">Progress</span>
            </div>
            <div className="w-full h-3 bg-blue-500 rounded-full overflow-hidden">
               <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(100, (stats.todaySales / 500) * 100)}%` }} />
            </div>
          </div>
          <p className="text-xs font-medium text-blue-100 leading-relaxed italic">
            Tip: High sales in Sweets today. Ensure candy shelves are restocked for afternoon break.
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
    <div className={`bg-white p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md ${isWarning ? 'border-orange-200' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-black px-2 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
             <ArrowUpRight className="w-3 h-3" />
             {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default DashboardView;
