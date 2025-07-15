import React, { useState } from 'react';
import { useBudget, HealthReimbursement } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface HealthSectionProps {
  month: number;
}

export function HealthSection({ month }: HealthSectionProps) {
  const { data, updateMonthData } = useBudget();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newHealth, setNewHealth] = useState<HealthReimbursement>({
    description: '',
    amount: 0,
    person: 'person1',
    reimbursed: false
  });

  const monthData = data.months[month];

  const handleAdd = () => {
    if (newHealth.description && newHealth.amount > 0) {
      const updatedHealth = [...monthData.healthReimbursements, newHealth];
      updateMonthData(month, { healthReimbursements: updatedHealth });
      setNewHealth({ description: '', amount: 0, person: 'person1', reimbursed: false });
      setIsAdding(false);
    }
  };

  const handleEdit = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
    } else {
      setEditingIndex(index);
    }
  };

  const handleUpdate = (index: number, updatedHealth: HealthReimbursement) => {
    const updatedHealthList = monthData.healthReimbursements.map((health, i) =>
      i === index ? updatedHealth : health
    );
    updateMonthData(month, { healthReimbursements: updatedHealthList });
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updatedHealth = monthData.healthReimbursements.filter((_, i) => i !== index);
    updateMonthData(month, { healthReimbursements: updatedHealth });
  };

  const toggleReimbursed = (index: number) => {
    const updatedHealth = monthData.healthReimbursements.map((health, i) =>
      i === index ? { ...health, reimbursed: !health.reimbursed } : health
    );
    updateMonthData(month, { healthReimbursements: updatedHealth });
  };

  const totalHealth = monthData.healthReimbursements.reduce((sum, health) => sum + health.amount, 0);
  const totalReimbursed = monthData.healthReimbursements
    .filter(health => health.reimbursed)
    .reduce((sum, health) => sum + health.amount, 0);
  const pendingReimbursement = totalHealth - totalReimbursed;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-purple-600">Health Reimbursements</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Plus size={20} />
          <span>Add Health Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Health Expenses</p>
          <p className="text-xl font-bold text-purple-600">
            {totalHealth.toLocaleString()}{data.currency}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Reimbursed</p>
          <p className="text-xl font-bold text-green-600">
            {totalReimbursed.toLocaleString()}{data.currency}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-xl font-bold text-orange-600">
            {pendingReimbursement.toLocaleString()}{data.currency}
          </p>
        </div>
      </div>

      {isAdding && (
        <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Health expense description"
              value={newHealth.description}
              onChange={(e) => setNewHealth({ ...newHealth, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newHealth.amount || ''}
              onChange={(e) => setNewHealth({ ...newHealth, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={newHealth.person}
              onChange={(e) => setNewHealth({ ...newHealth, person: e.target.value as 'person1' | 'person2' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="person1">{data.persons.person1.name}</option>
              <option value="person2">{data.persons.person2.name}</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {monthData.healthReimbursements.map((health, index) => (
          <div key={index} className={`flex items-center justify-between p-3 bg-white border rounded-lg ${
            health.reimbursed ? 'border-green-200 bg-green-50' : 'border-gray-200'
          }`}>
            {editingIndex === index ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={health.description}
                  onChange={(e) => handleUpdate(index, { ...health, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  value={health.amount}
                  onChange={(e) => handleUpdate(index, { ...health, amount: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={health.person}
                  onChange={(e) => handleUpdate(index, { ...health, person: e.target.value as 'person1' | 'person2' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="person1">{data.persons.person1.name}</option>
                  <option value="person2">{data.persons.person2.name}</option>
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: data.persons[health.person].color }}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{health.description}</p>
                    <p className="text-sm text-gray-600">
                      {data.persons[health.person].name} • {health.reimbursed ? 'Reimbursed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-600">
                {health.amount.toLocaleString()}{data.currency}
              </span>
              <button
                onClick={() => toggleReimbursed(index)}
                className={`p-1 rounded transition-colors ${
                  health.reimbursed 
                    ? 'text-green-600 hover:text-green-700' 
                    : 'text-gray-400 hover:text-green-600'
                }`}
              >
                {health.reimbursed ? <Check size={16} /> : <X size={16} />}
              </button>
              <button
                onClick={() => handleEdit(index)}
                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {monthData.healthReimbursements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No health expenses added yet.</p>
          <p className="text-sm">Click "Add Health Expense" to get started.</p>
        </div>
      )}
    </div>
  );
}