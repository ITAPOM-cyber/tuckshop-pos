
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Globe, DollarSign, Coins, Landmark, Save, CheckCircle } from 'lucide-react';
import { CurrencyCode } from '../types';

const SettingsView: React.FC = () => {
  const { refreshSettings, currencyCode: activeCurrency } = useApp();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(activeCurrency);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelectedCurrency(activeCurrency);
  }, [activeCurrency]);

  const handleSave = () => {
    dbService.updateSettings({ currency: selectedCurrency });
    refreshSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currencies: { code: CurrencyCode, name: string, symbol: string, icon: any }[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', icon: DollarSign },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P', icon: Coins },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', icon: Landmark },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Global configurations for the TuckShop POS.</p>
      </header>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Localization</h3>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
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
                    className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all text-center group ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-blue-200'
                    }`}
                  >
                    <div className={`p-4 rounded-full transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {curr.name} ({curr.symbol})
                      </p>
                      <p className="text-xs font-mono mt-1">{curr.code}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Currency changes apply immediately to all prices across the terminal.</p>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${
              saved 
                ? 'bg-green-500 text-white cursor-default' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5'
            }`}
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Settings Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2">Did you know?</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            Changing the currency updates the display symbol for products, students, and reports. 
            It does not perform exchange rate conversions on existing values.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
