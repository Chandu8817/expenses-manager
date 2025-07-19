import React, { useState } from 'react';
import { DollarSign, ArrowLeftRight, BarChart3 } from 'lucide-react';
import AuthWrapper from './components/AuthWrapper';
import ExpenseTracker from './components/ExpenseTracker';
import LendBorrowManager from './components/LendBorrowManager';
import Dashboard from './components/Dashboard';
import { User } from '@supabase/supabase-js';

type Tab = 'dashboard' | 'expenses' | 'lend-borrow';

function App() {
  return (
    <AuthWrapper>
      {(user: User) => <MainApp user={user} />}
    </AuthWrapper>
  );
}

function MainApp({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'expenses' as Tab, label: 'Expenses', icon: DollarSign },
    { id: 'lend-borrow' as Tab, label: 'Lend & Borrow', icon: ArrowLeftRight },
  ];

  return (
    <>
      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300 py-4 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'expenses' && <ExpenseTracker user={user} />}
        {activeTab === 'lend-borrow' && <LendBorrowManager user={user} />}
      </div>
    </>
  );
}

export default App;