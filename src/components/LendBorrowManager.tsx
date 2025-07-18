import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, X, User, ArrowUp, ArrowDown } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useLendBorrow } from '../hooks/useLendBorrow';
import { useToast } from './ToastProvider';
import ConfirmDialog from './ConfirmDialog';

interface LendBorrowManagerProps {
  user: SupabaseUser;
}

const LendBorrowManager: React.FC<LendBorrowManagerProps> = ({ user }) => {
  const { records, loading, error, addRecord, updateRecord, deleteRecord } = useLendBorrow(user);
  const { showSuccess, showError, showWarning } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; recordId: string | null }>({
    isOpen: false,
    recordId: null,
  });

  const [formData, setFormData] = useState({
    person: '',
    amount: '',
    type: 'lent' as 'lent' | 'borrowed',
    date: new Date().toISOString().split('T')[0],
    description: '',
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const recordData = {
        ...formData,
        amount: parseFloat(formData.amount),
        due_date: formData.dueDate || undefined,
      };
      delete (recordData as any).dueDate;

      if (editingItem) {
        await updateRecord(editingItem.id, recordData);
        setEditingItem(null);
        showSuccess('Record updated successfully!');
      } else {
        await addRecord({
          ...recordData,
          status: 'pending',
        });
        showSuccess('Record added successfully!');
      }
      setFormData({ person: '', amount: '', type: 'lent', date: new Date().toISOString().split('T')[0], description: '', dueDate: '' });
      setShowForm(false);
    } catch (err: any) {
      showError('Error saving record: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      person: item.person,
      amount: item.amount.toString(),
      type: item.type,
      date: item.date,
      description: item.description,
      dueDate: item.due_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteDialog({ isOpen: true, recordId: id });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.recordId) return;
    
    try {
      await deleteRecord(deleteDialog.recordId);
      showSuccess('Record deleted successfully!');
    } catch (err: any) {
      showError('Error deleting record: ' + err.message);
    }
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'completed') => {
    try {
      await updateRecord(id, { status });
      showSuccess(`Record marked as ${status}!`);
    } catch (err: any) {
      showError('Error updating status: ' + err.message);
    }
  };

  const filteredItems = records.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const totalLent = records.filter(item => item.type === 'lent' && item.status === 'pending').reduce((sum, item) => sum + item.amount, 0);
  const totalBorrowed = records.filter(item => item.type === 'borrowed' && item.status === 'pending').reduce((sum, item) => sum + item.amount, 0);

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
        <p className="text-red-600">Error loading records: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Lend & Borrow</h2>
          <p className="text-slate-600 text-sm sm:text-base">Track money lent to and borrowed from others</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-primary text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Add Record</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-primary-light rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-3 bg-primary/20 rounded-lg sm:rounded-xl">
              <ArrowUp className="text-primary-dark sm:w-6 sm:h-6" size={20} />
            </div>
            <span className="text-xs sm:text-sm text-primary-dark font-medium">Money Lent</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-lg sm:text-2xl font-bold text-primary-dark">+₹{totalLent.toFixed(2)}</h3>
            <p className="text-xs sm:text-sm text-slate-600">Pending returns</p>
          </div>
        </div>
        <div className="bg-primary-light rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-3 bg-orange-50 rounded-lg sm:rounded-xl">
              <ArrowDown className="text-orange-600 sm:w-6 sm:h-6" size={20} />
            </div>
            <span className="text-xs sm:text-sm text-orange-600 font-medium">Money Borrowed</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className="text-lg sm:text-2xl font-bold text-orange-600">-₹{totalBorrowed.toFixed(2)}</h3>
            <p className="text-xs sm:text-sm text-slate-600">To be returned</p>
          </div>
        </div>
        <div className="bg-primary-light rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-primary/20 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="p-2 sm:p-3 bg-primary/20 rounded-lg sm:rounded-xl">
              <User className="text-primary-dark sm:w-6 sm:h-6" size={20} />
            </div>
            <span className="text-xs sm:text-sm text-primary-dark font-medium">Net Balance</span>
          </div>
          <div className="mt-3 sm:mt-4">
            <h3 className={`text-lg sm:text-2xl font-bold ${totalLent - totalBorrowed >= 0 ? 'text-primary-dark' : 'text-red-600'}`}>
              {totalLent - totalBorrowed >= 0 ? '+' : ''}₹{(totalLent - totalBorrowed).toFixed(2)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">Overall balance</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-row overflow-x-auto no-scrollbar border-b border-slate-200">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'lent', label: 'Money Lent' },
            { id: 'borrowed', label: 'Money Borrowed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 min-w-[120px] px-3 sm:px-6 py-2 sm:py-3 mx-1 my-2 sm:my-0 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-primary-light text-primary-dark hover:bg-primary/20 hover:text-primary-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="divide-y divide-slate-200">
          {filteredItems.map((item) => (
            <div key={item.id} className="card mb-4 p-4 sm:p-6">
              {/* Top row: Name + Amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'lent' ? 'bg-green-100' : 'bg-orange-100'}`}> 
                    {item.type === 'lent' ? <ArrowUp className="text-primary-dark w-5 h-5" /> : <ArrowDown className="text-orange-600 w-5 h-5" />}
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-slate-900 truncate max-w-[120px] sm:max-w-[180px]">{item.person}</span>
                </div>
                <span className={`font-bold text-lg sm:text-xl ${item.type === 'lent' ? 'text-primary-dark' : 'text-orange-600'}`}>{item.type === 'lent' ? '+' : '-'}₹{item.amount.toFixed(2)}</span>
              </div>
              {/* Description row */}
              {item.description && (
                <div className="mt-1">
                  <span className="text-sm text-slate-600 break-words line-clamp-2">{item.description}</span>
                </div>
              )}
              {/* Bottom row: Date, Status, Actions */}
              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-slate-500">{item.date}</span>
                  {item.due_date && <span className="text-xs text-slate-400">• Due: {item.due_date}</span>}
                  <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{item.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'completed')}
                      className="action-btn text-green-600"
                      title="Mark as completed"
                    >
                      <Check size={16} className="sm:w-4 sm:h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(item)}
                    className="action-btn text-slate-600"
                  >
                    <Edit size={16} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
              {editingItem ? 'Edit Record' : 'Add New Record'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Person
                </label>
                <input
                  type="text"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                  placeholder="Who did you lend to or borrow from?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'lent' | 'borrowed' })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                >
                  <option value="lent">Money Lent</option>
                  <option value="borrowed">Money Borrowed</option>
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                  placeholder="What was this for?"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({ person: '', amount: '', type: 'lent', date: new Date().toISOString().split('T')[0], description: '', dueDate: '' });
                  }}
                  className="flex-1 px-4 py-3 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, recordId: null })}
        onConfirm={confirmDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default LendBorrowManager;