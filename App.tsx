
import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { dbService } from './services/mockDb';
import { Employee, PermissionMatrix, CurrencyCode } from './types';
import DashboardView from './views/Dashboard';
import POSView from './views/POS';
import InventoryView from './views/Inventory';
import StudentsView from './views/Students';
import EmployeesView from './views/Employees';
import SettingsView from './views/Settings';
import Sidebar from './components/Sidebar';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Lock 
} from 'lucide-react';

export type View = 'dashboard' | 'pos' | 'inventory' | 'students' | 'employees' | 'settings';

interface AppContextType {
  currencySymbol: string;
  currencyCode: CurrencyCode;
  refreshSettings: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');

  const refreshSettings = useCallback(() => {
    const settings = dbService.getSettings();
    setCurrencyCode(settings.currency);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('tuckshop_session');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
    refreshSettings();
  }, [refreshSettings]);

  // Fix: Added useMemo to the React imports at the top of the file
  const currencySymbol = useMemo(() => {
    switch (currencyCode) {
      case 'BWP': return 'P';
      case 'ZAR': return 'R';
      default: return '$';
    }
  }, [currencyCode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const employees = dbService.getEmployees();
    const found = employees.find(emp => emp.pin === pinInput && emp.active);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('tuckshop_session', JSON.stringify(found));
      setPinInput('');
      setAuthError('');
      setActiveView(found.permissions.accessBackOffice ? 'dashboard' : 'pos');
    } else {
      setAuthError('Invalid PIN');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tuckshop_session');
    setActiveView('dashboard');
  };

  const hasPermission = useCallback((key: keyof PermissionMatrix) => {
    return currentUser?.permissions[key] ?? false;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-auto max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">TuckShop Pro</h1>
          <p className="text-gray-500 mb-8">Enter your employee PIN to continue</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex justify-center gap-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                placeholder="••••"
                className="w-48 text-center text-4xl tracking-[1em] border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Clear', 0, 'Go'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (val === 'Clear') setPinInput('');
                    else if (val === 'Go') handleLogin({ preventDefault: () => {} } as any);
                    else if (pinInput.length < 4) setPinInput(prev => prev + val);
                  }}
                  className={`p-4 rounded-lg text-lg font-semibold transition-colors ${
                    val === 'Go' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return hasPermission('accessBackOffice') ? <DashboardView /> : <div className="p-8">Access Denied</div>;
      case 'pos':
        return hasPermission('accessPOS') ? <POSView currentUser={currentUser} /> : <div className="p-8">Access Denied</div>;
      case 'inventory':
        return hasPermission('viewProducts') ? <InventoryView /> : <div className="p-8">Access Denied</div>;
      case 'students':
        return hasPermission('viewBalances') ? <StudentsView /> : <div className="p-8">Access Denied</div>;
      case 'employees':
        return hasPermission('manageEmployees') ? <EmployeesView /> : <div className="p-8">Access Denied</div>;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppContext.Provider value={{ currencySymbol, currencyCode, refreshSettings }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {activeView !== 'pos' && (
          <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            onLogout={handleLogout}
            userName={currentUser.name}
            role={currentUser.role}
          />
        )}
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
        {activeView === 'pos' && (
          <button 
            onClick={() => setActiveView('dashboard')}
            className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-all z-50 flex items-center gap-2 px-6"
          >
            <LayoutDashboard className="w-5 h-5" />
            Back Office
          </button>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
