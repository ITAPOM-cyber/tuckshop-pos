
import React, { useState } from 'react';
import { dbService } from '../services/mockDb';
import { Employee } from '../types';
import { Plus, ShieldCheck, UserCog, Lock, Check, X } from 'lucide-react';

const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState(dbService.getEmployees());

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Control employee access and granular system permissions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{emp.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                      {emp.role}
                    </span>
                    <span className="text-gray-400 text-xs font-mono">PIN: {emp.pin}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">
                  Deactivate
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Permissions Matrix
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(emp.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs font-semibold text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    {value ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesView;
