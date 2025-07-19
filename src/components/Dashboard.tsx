import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, AlertCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useExpenses } from '../hooks/useExpenses';
import { useLendBorrow } from '../hooks/useLendBorrow';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { expenses, loading: expensesLoading } = useExpenses(user);
  const { records, loading: recordsLoading } = useLendBorrow(user);

  if (expensesLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const lentRecords = records.filter(r => r.type === 'lent' && r.status === 'pending');
  const borrowedRecords = records.filter(r => r.type === 'borrowed' && r.status === 'pending');
  const totalLent = lentRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalBorrowed = borrowedRecords.reduce((sum, record) => sum + record.amount, 0);
  const pendingReturns = [...lentRecords, ...borrowedRecords].length;

  const stats = [
    {
      title: 'Total Expenses',
      value: `₹${totalExpenses.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Money Lent',
      value: `₹${totalLent.toFixed(2)}`,
      change: '-5.2%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Money Borrowed',
      value: `₹${totalBorrowed.toFixed(2)}`,
      change: '+8.1%',
      trend: 'up',
      icon: TrendingDown,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Pending Returns',
      value: `₹${(totalLent + totalBorrowed).toFixed(2)}`,
      change: `${pendingReturns} records`,
      trend: 'neutral',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const recentExpenses = expenses.slice(0, 4);
  const pendingLends = records.filter(r => r.status === 'pending').slice(0, 3);

  // Prepare chart data
  // 1. Expenses Over Time (by date)
  const expensesByDate: { date: string; amount: number }[] = [];
  const dateMap: Record<string, number> = {};
  expenses.forEach(exp => {
    if (!dateMap[exp.date]) dateMap[exp.date] = 0;
    dateMap[exp.date] += exp.amount;
  });
  Object.entries(dateMap).forEach(([date, amount]) => {
    expensesByDate.push({ date, amount });
  });
  expensesByDate.sort((a, b) => a.date.localeCompare(b.date));

  // 2. Expense Category Breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach(exp => {
    if (!categoryMap[exp.category]) categoryMap[exp.category] = 0;
    categoryMap[exp.category] += exp.amount;
  });
  const expensesByCategory = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));

  // 3. Lend vs Borrow Status
  const lendBorrowStatus = [
    { name: 'Lent', value: records.filter(r => r.type === 'lent').reduce((sum, r) => sum + r.amount, 0) },
    { name: 'Borrowed', value: records.filter(r => r.type === 'borrowed').reduce((sum, r) => sum + r.amount, 0) },
  ];

  const COLORS = ['#2563eb', '#f59e42', '#22c55e', '#ef4444', '#a78bfa', '#f472b6', '#facc15', '#14b8a6'];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.color}`}>
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  {stat.trend === 'up' && <TrendingUp size={14} className="sm:w-4 sm:h-4 text-green-600" />}
                  {stat.trend === 'down' && <TrendingDown size={14} className="sm:w-4 sm:h-4 text-red-600" />}
                  <span className={`${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value}</h3>
                <p className="text-slate-600 text-xs sm:text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Expenses Over Time */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Expenses Over Time</h2>
          <div className="flex-1 min-h-[200px] sm:min-h-[220px]">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={expensesByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Expense Category Breakdown</h2>
          <div className="flex-1 min-h-[200px] sm:min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={30}
                  fill="#2563eb"
                  label={({ category }) => category}
                >
                  {expensesByCategory.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Lend vs Borrow Status */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Lent vs Borrowed</h2>
          <div className="flex-1 min-h-[200px] sm:min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={lendBorrowStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={30}
                  fill="#22c55e"
                  label={({ name }) => name}
                >
                  {lendBorrowStatus.map((entry, idx) => (
                    <Cell key={`cell-lb-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Recent Expenses</h2>
            <Calendar size={18} className="sm:w-5 sm:h-5 text-slate-400" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900 truncate">{expense.category}</span>
                    <span className="text-xs text-slate-500">{expense.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 truncate">{expense.description}</p>
                </div>
                <div className="text-right ml-2">
                  <span className="text-base sm:text-lg font-semibold text-slate-900">
                    -₹{expense.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            {recentExpenses.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-slate-500">
                <p className="text-sm sm:text-base">No expenses yet. Start tracking your spending!</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Lends/Borrows */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Pending Returns</h2>
            <AlertCircle size={18} className="sm:w-5 sm:h-5 text-slate-400" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {pendingLends.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900 truncate">{item.person}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.type === 'lent' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {item.type === 'lent' ? 'Lent' : 'Borrowed'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{item.date}</p>
                </div>
                <div className="text-right ml-2">
                  <span className={`text-base sm:text-lg font-semibold ${
                    item.type === 'lent' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {item.type === 'lent' ? '+' : '-'}₹{item.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            {pendingLends.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-slate-500">
                <p className="text-sm sm:text-base">No pending records. All settled up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;