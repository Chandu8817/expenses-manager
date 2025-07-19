import React, { useState } from 'react';
import { DollarSign, ArrowLeftRight, BarChart3 } from 'lucide-react';
import AuthWrapper from './components/AuthWrapper';
import ExpenseTracker from './components/ExpenseTracker';
import LendBorrowManager from './components/LendBorrowManager';
import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/ToastProvider';
import { User } from '@supabase/supabase-js';

type Tab = 'dashboard' | 'expenses' | 'lend-borrow';

function App() {
  return (
    <ToastProvider>
      <AuthWrapper>
        {(user: User) => <MainApp user={user} />}
      </AuthWrapper>
    </ToastProvider>
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
      {/* Top Navigation (desktop) */}
      <nav className="sticky top-0 z-50 bg-white rounded-none sm:rounded-2xl shadow-md border-b border-slate-200 mb-4 sm:mb-8 hidden sm:block">
        <div className="flex flex-row justify-center sm:justify-start gap-2 sm:gap-4 px-2 sm:px-6 py-2 sm:py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isActive
                    ? 'bg-green-50 text-green-600 shadow-sm'
                    : 'text-slate-600 hover:text-green-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={24} className="sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-base font-medium mt-1 sm:mt-0">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="transition-all duration-300 py-4 sm:py-8 pb-4 sm:pb-20 max-w-3xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'expenses' && <ExpenseTracker user={user} />}
        {activeTab === 'lend-borrow' && <LendBorrowManager user={user} />}
      </div>

      {/* Bottom Navigation (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-t flex sm:hidden justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              aria-label={tab.label}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 px-2 py-1 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isActive ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:text-green-600'
              }`}
            >
              <Icon size={26} className="mb-0.5" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default App;