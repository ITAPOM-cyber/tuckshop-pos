
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { 
  Globe, 
  DollarSign, 
  Coins, 
  Landmark, 
  Save, 
  CheckCircle, 
  Database, 
  Sparkles, 
  Loader2,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react';
import { CurrencyCode } from '../types';

const SettingsView: React.FC = () => {
  const { refreshSettings, currencyCode: activeCurrency } = useApp();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(activeCurrency);
  const [saved, setSaved] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  useEffect(() => {
    setSelectedCurrency(activeCurrency);
  }, [activeCurrency]);

  const handleSave = () => {
    dbService.updateSettings({ currency: selectedCurrency });
    refreshSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSimulate = () => {
    if (!window.confirm("This will overwrite your current students and transaction history with simulation data. Proceed?")) return;
    
    setSimulating(true);
    // Add artificial delay for UX feel
    setTimeout(() => {
      dbService.seedSimulationData();
      refreshSettings();
      setSimulating(false);
      setSimSuccess(true);
      setTimeout(() => setSimSuccess(false), 3000);
      window.location.reload(); // Reload to refresh all context states
    }, 1500);
  };

  const currencies: { code: CurrencyCode, name: string, symbol: string, icon: any }[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', icon: DollarSign },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P', icon: Coins },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', icon: Landmark },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 font-medium">Global configurations and development utilities.</p>
      </header>

      {/* Localization Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Localization</h3>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              System Currency
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currencies.map((curr) => {
                const Icon = curr.icon;
                const isSelected = selectedCurrency === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all text-center group ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-blue-200'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl transition-all ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className={`font-bold text-lg leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {curr.name}
                      </p>
                      <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-50">{curr.symbol} - {curr.code}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">Currency changes apply immediately to all prices across the terminal.</p>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${
              saved 
                ? 'bg-green-500 text-white cursor-default' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Settings Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Simulation Tools Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-indigo-50/50">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-indigo-900 uppercase tracking-widest text-sm">System Tools</h3>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
            <Sparkles className="w-6 h-6 text-indigo-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-indigo-900">Seed Simulation Data</h4>
              <p className="text-sm text-indigo-600/80 mt-1 leading-relaxed">
                Populate the system with 50 unique students and 30 days of randomized transaction history. 
                Perfect for testing dashboard charts, reporting, and staff performance metrics.
              </p>
            </div>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                simSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {simulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : simSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Success!
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Simulate Full Month
                </>
              )}
            </button>
          </div>

          <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-3xl border border-orange-100">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h4 className="font-bold text-orange-900 uppercase tracking-widest text-xs">Danger Zone</h4>
              <p className="text-sm text-orange-700/80 mt-1">
                Seeding simulation data will permanently delete your existing students and orders. 
                Inventory items will remain but stock levels may be affected by the simulated sales.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-gray-900 rounded-[3rem] text-white/90 relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 space-y-4">
          <h4 className="text-xl font-black">TuckShop Pro <span className="text-blue-400">Enterprise</span></h4>
          <p className="text-sm text-white/50 leading-relaxed max-w-md">
            Version 2.4.1 (Stable Build)<br />
            Powered by local storage persistence and advanced audit logging.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
              POS Terminal: Active
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
              Back Office: Connected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
