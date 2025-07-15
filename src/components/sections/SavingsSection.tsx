import React, { useState } from 'react';
import { useBudget, SavingsEntry } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface SavingsSectionProps {
  month: number;
}

export function SavingsSection({ month }: SavingsSectionProps) {
  const { data, updateMonthData } = useBudget();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newSavings, setNewSavings] = useState<SavingsEntry>({
    goal: '',
    amount: 0,
    person: 'person1'
  });

  const monthData = data.months[month];

  const handleAdd = () => {
    if (newSavings.goal && newSavings.amount > 0) {
      const updatedSavings = [...monthData.savings, newSavings];
      updateMonthData(month, { savings: updatedSavings });
      setNewSavings({ goal: '', amount: 0, person: 'person1' });
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

  const handleUpdate = (index: number, updatedSavings: SavingsEntry) => {
    const updatedSavingsList = monthData.savings.map((savings, i) =>
      i === index ? updatedSavings : savings
    );
    updateMonthData(month, { savings: updatedSavingsList });
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updatedSavings = monthData.savings.filter((_, i) => i !== index);
    updateMonthData(month, { savings: updatedSavings });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-blue-600">Savings Goals</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Plus size={20} />
          <span>Add Savings</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Savings goal"
              value={newSavings.goal}
              onChange={(e) => setNewSavings({ ...newSavings, goal: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newSavings.amount || ''}
              onChange={(e) => setNewSavings({ ...newSavings, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newSavings.person}
              onChange={(e) => setNewSavings({ ...newSavings, person: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="person1">{data.persons.person1.name}</option>
              <option value="person2">{data.persons.person2.name}</option>
              <option value="shared">Shared</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        {monthData.savings.map((savings, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            {editingIndex === index ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={savings.goal}
                  onChange={(e) => handleUpdate(index, { ...savings, goal: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={savings.amount}
                  onChange={(e) => handleUpdate(index, { ...savings, amount: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={savings.person}
                  onChange={(e) => handleUpdate(index, { ...savings, person: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="person1">{data.persons.person1.name}</option>
                  <option value="person2">{data.persons.person2.name}</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: savings.person === 'shared' ? '#6B7280' : data.persons[savings.person as 'person1' | 'person2'].color 
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{savings.goal}</p>
                    <p className="text-sm text-gray-600">
                      {savings.person === 'shared' ? 'Shared' : data.persons[savings.person as 'person1' | 'person2'].name}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="font-bold text-blue-600">
                {savings.amount.toLocaleString()}{data.currency}
              </span>
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

      {monthData.savings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No savings goals added yet.</p>
          <p className="text-sm">Click "Add Savings" to get started.</p>
        </div>
      )}
    </div>
  );
}