import React, { useState } from 'react';
import { useBudget, IncomeEntry } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface IncomeSectionProps {
  month: number;
}

export function IncomeSection({ month }: IncomeSectionProps) {
  const { data, updateMonthData } = useBudget();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newIncome, setNewIncome] = useState<IncomeEntry>({
    source: '',
    amount: 0,
    person: 'person1'
  });

  const monthData = data.months[month];

  const handleAdd = () => {
    if (newIncome.source && newIncome.amount > 0) {
      const updatedIncome = [...monthData.income, newIncome];
      updateMonthData(month, { income: updatedIncome });
      setNewIncome({ source: '', amount: 0, person: 'person1' });
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

  const handleUpdate = (index: number, updatedIncome: IncomeEntry) => {
    const updatedIncomes = monthData.income.map((income, i) =>
      i === index ? updatedIncome : income
    );
    updateMonthData(month, { income: updatedIncomes });
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updatedIncome = monthData.income.filter((_, i) => i !== index);
    updateMonthData(month, { income: updatedIncome });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-green-600">Income Sources</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus size={20} />
          <span>Add Income</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Income source"
              value={newIncome.source}
              onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newIncome.amount || ''}
              onChange={(e) => setNewIncome({ ...newIncome, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={newIncome.person}
              onChange={(e) => setNewIncome({ ...newIncome, person: e.target.value as 'person1' | 'person2' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="person1">{data.persons.person1.name}</option>
              <option value="person2">{data.persons.person2.name}</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        {monthData.income.map((income, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            {editingIndex === index ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={income.source}
                  onChange={(e) => handleUpdate(index, { ...income, source: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  value={income.amount}
                  onChange={(e) => handleUpdate(index, { ...income, amount: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={income.person}
                  onChange={(e) => handleUpdate(index, { ...income, person: e.target.value as 'person1' | 'person2' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    style={{ backgroundColor: data.persons[income.person].color }}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{income.source}</p>
                    <p className="text-sm text-gray-600">{data.persons[income.person].name}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="font-bold text-green-600">
                {income.amount.toLocaleString()}{data.currency}
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

      {monthData.income.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No income sources added yet.</p>
          <p className="text-sm">Click "Add Income" to get started.</p>
        </div>
      )}
    </div>
  );
}