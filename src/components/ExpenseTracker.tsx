import React, { useState } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Calendar } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useExpenses } from '../hooks/useExpenses';
import { useToast } from './ToastProvider';
import ConfirmDialog from './ConfirmDialog';

interface ExpenseTrackerProps {
  user: User;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ user }) => {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses(user);
  const { showSuccess, showError, showWarning } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; expenseId: string | null }>({
    isOpen: false,
    expenseId: null,
  });

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
        setEditingExpense(null);
        showSuccess('Expense updated successfully!');
      } else {
        await addExpense({
          ...formData,
          amount: parseFloat(formData.amount),
        });
        showSuccess('Expense added successfully!');
      }
      setFormData({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      setShowForm(false);
    } catch (err: any) {
      showError('Error saving expense: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteDialog({ isOpen: true, expenseId: id });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.expenseId) return;
    
    try {
      await deleteExpense(deleteDialog.expenseId);
      showSuccess('Expense deleted successfully!');
    } catch (err: any) {
      showError('Error deleting expense: ' + err.message);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-600">Error loading expenses: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Expense Tracker</h2>
          <p className="text-slate-600 text-sm sm:text-base">Manage and track your daily expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 p-3 sm:p-4 bg-slate-50 rounded-xl">
          <p className="text-slate-600 text-sm sm:text-base">
            Total: <span className="font-semibold text-slate-900">₹{totalAmount.toFixed(2)}</span>
            {filteredExpenses.length !== expenses.length && (
              <span className="text-xs sm:text-sm text-slate-500 ml-2">
                ({filteredExpenses.length} of {expenses.length} expenses)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Recent Expenses</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="card mb-4 p-4 sm:p-6">
              {/* Top row: Category + Amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100">
                    <span className="text-green-600 font-semibold text-base">{expense.category.charAt(0)}</span>
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-slate-900 truncate max-w-[120px] sm:max-w-[180px]">{expense.category}</span>
                </div>
                <span className="font-bold text-lg sm:text-xl text-red-600">-₹{expense.amount.toFixed(2)}</span>
              </div>
              {/* Description row */}
              {expense.description && (
                <div className="mt-1">
                  <span className="text-sm text-slate-600 break-words line-clamp-2">{expense.description}</span>
                </div>
              )}
              {/* Bottom row: Date, Actions */}
              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                <span className="text-xs text-slate-500">{expense.date}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="action-btn text-slate-600"
                  >
                    <Edit size={16} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="action-btn text-slate-600 hover:text-red-600"
                  >
                    <Trash2 size={16} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  placeholder="What did you spend on?"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExpense(null);
                    setFormData({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
                  }}
                  className="flex-1 px-4 py-3 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? 'Saving...' : editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, expenseId: null })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ExpenseTracker;