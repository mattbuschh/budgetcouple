import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { IncomeSection } from './sections/IncomeSection';
import { ExpenseSection } from './sections/ExpenseSection';
import { SavingsSection } from './sections/SavingsSection';
import { HealthSection } from './sections/HealthSection';

interface MonthlyViewProps {
  month: number;
  onMonthChange: (month: number) => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyView({ month }: MonthlyViewProps) {
  const { data, calculateMonthlyTotals } = useBudget();
  const [activeSection, setActiveSection] = useState<'income' | 'expenses' | 'savings' | 'health'>('income');

  const monthData = data.months[month];
  const totals = calculateMonthlyTotals(month);

  const sectionColors = {
    income: 'bg-green-50 border-green-200',
    expenses: 'bg-red-50 border-red-200',
    savings: 'bg-blue-50 border-blue-200',
    health: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">{monthNames[month]} Budget</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Net Balance</p>
            <p className={`text-2xl font-bold ${totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.remaining.toLocaleString()}{data.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-gray-800">
            {totals.totalIncome.toLocaleString()}{data.currency}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span style={{ color: data.persons.person1.color }}>{data.persons.person1.name}</span>
              <span className="font-medium">
                {monthData.income
                  .filter(i => i.person === 'person1')
                  .reduce((sum, i) => sum + i.amount, 0)
                  .toLocaleString()}{data.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: data.persons.person2.color }}>{data.persons.person2.name}</span>
              <span className="font-medium">
                {monthData.income
                  .filter(i => i.person === 'person2')
                  .reduce((sum, i) => sum + i.amount, 0)
                  .toLocaleString()}{data.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-800">
            {totals.totalExpenses.toLocaleString()}{data.currency}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Variable</span>
              <span className="font-medium">
                {monthData.expenses
                  .filter(e => e.type === 'variable')
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}{data.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fixed</span>
              <span className="font-medium">
                {monthData.expenses
                  .filter(e => e.type === 'fixed')
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}{data.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Total Savings</h3>
          <p className="text-2xl font-bold text-gray-800">
            {totals.totalSavings.toLocaleString()}{data.currency}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-sm">
              <span>Savings Rate</span>
              <span className="font-medium">
                {totals.totalIncome > 0 ? ((totals.totalSavings / totals.totalIncome) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
        <div className="flex space-x-2">
          {[
            { key: 'income', label: 'Income', color: 'text-green-600' },
            { key: 'expenses', label: 'Expenses', color: 'text-red-600' },
            { key: 'savings', label: 'Savings', color: 'text-blue-600' },
            { key: 'health', label: 'Health', color: 'text-purple-600' }
          ].map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === section.key
                  ? `bg-${section.color.split('-')[1]}-100 ${section.color}`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Section */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border ${sectionColors[activeSection]}`}>
        {activeSection === 'income' && <IncomeSection month={month} />}
        {activeSection === 'expenses' && <ExpenseSection month={month} />}
        {activeSection === 'savings' && <SavingsSection month={month} />}
        {activeSection === 'health' && <HealthSection month={month} />}
      </div>
    </div>
  );
}