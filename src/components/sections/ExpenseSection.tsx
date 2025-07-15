import React, { useState } from 'react';
import { useBudget, ExpenseEntry } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface ExpenseSectionProps {
  month: number;
}

const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Home & Garden',
  'Insurance',
  'Other'
];

export function ExpenseSection({ month }: ExpenseSectionProps) {
  const { data, updateMonthData } = useBudget();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState<ExpenseEntry>({
    category: 'Food & Dining',
    amount: 0,
    description: '',
    person: 'person1',
    type: 'variable'
  });

  const monthData = data.months[month];

  const handleAdd = () => {
    if (newExpense.description && newExpense.amount > 0) {
      const updatedExpenses = [...monthData.expenses, newExpense];
      updateMonthData(month, { expenses: updatedExpenses });
      setNewExpense({
        category: 'Food & Dining',
        amount: 0,
        description: '',
        person: 'person1',
        type: 'variable'
      });
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

  const handleUpdate = (index: number, updatedExpense: ExpenseEntry) => {
    const updatedExpenses = monthData.expenses.map((expense, i) =>
      i === index ? updatedExpense : expense
    );
    updateMonthData(month, { expenses: updatedExpenses });
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updatedExpenses = monthData.expenses.filter((_, i) => i !== index);
    updateMonthData(month, { expenses: updatedExpenses });
  };

  const variableExpenses = monthData.expenses.filter(e => e.type === 'variable');
  const fixedExpenses = monthData.expenses.filter(e => e.type === 'fixed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-red-600">Expenses</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount || ''}
              onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <select
              value={newExpense.person}
              onChange={(e) => setNewExpense({ ...newExpense, person: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="person1">{data.persons.person1.name}</option>
              <option value="person2">{data.persons.person2.name}</option>
              <option value="shared">Shared</option>
            </select>
            <select
              value={newExpense.type}
              onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as 'variable' | 'fixed' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="variable">Variable</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variable Expenses */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">Variable Expenses</h4>
          <div className="space-y-2">
            {variableExpenses.map((expense, index) => {
              const actualIndex = monthData.expenses.findIndex(e => e === expense);
              return (
                <div key={actualIndex} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  {editingIndex === actualIndex ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select
                        value={expense.category}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, category: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {expenseCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, amount: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <select
                        value={expense.person}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, person: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                            backgroundColor: expense.person === 'shared' ? '#6B7280' : data.persons[expense.person as 'person1' | 'person2'].color 
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-600">
                      {expense.amount.toLocaleString()}{data.currency}
                    </span>
                    <button
                      onClick={() => handleEdit(actualIndex)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(actualIndex)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {variableExpenses.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No variable expenses added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Expenses */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">Fixed Expenses</h4>
          <div className="space-y-2">
            {fixedExpenses.map((expense, index) => {
              const actualIndex = monthData.expenses.findIndex(e => e === expense);
              return (
                <div key={actualIndex} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  {editingIndex === actualIndex ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select
                        value={expense.category}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, category: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {expenseCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, amount: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <select
                        value={expense.person}
                        onChange={(e) => handleUpdate(actualIndex, { ...expense, person: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                            backgroundColor: expense.person === 'shared' ? '#6B7280' : data.persons[expense.person as 'person1' | 'person2'].color 
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-600">
                      {expense.amount.toLocaleString()}{data.currency}
                    </span>
                    <button
                      onClick={() => handleEdit(actualIndex)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(actualIndex)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {fixedExpenses.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No fixed expenses added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}