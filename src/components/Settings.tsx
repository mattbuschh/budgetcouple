import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { User, DollarSign, CreditCard, Plus, Trash2, Edit2, Download, Upload } from 'lucide-react';

export function Settings() {
  const { data, updatePersons, updateCurrency, updateBankAccounts } = useBudget();
  const [personSettings, setPersonSettings] = useState(data.persons);
  const [currency, setCurrency] = useState(data.currency);
  const [bankAccounts, setBankAccounts] = useState(data.bankAccounts);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    balance: 0,
    color: '#3B82F6'
  });

  const currencies = [
    { code: '€', name: 'Euro' },
    { code: '$', name: 'US Dollar' },
    { code: '£', name: 'British Pound' },
    { code: '¥', name: 'Japanese Yen' },
    { code: '₹', name: 'Indian Rupee' },
    { code: 'CA$', name: 'Canadian Dollar' },
    { code: 'AU$', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' }
  ];

  const handlePersonUpdate = (person: 'person1' | 'person2', field: 'name' | 'color', value: string) => {
    const updated = {
      ...personSettings,
      [person]: {
        ...personSettings[person],
        [field]: value
      }
    };
    setPersonSettings(updated);
    updatePersons(updated);
  };

  const handleCurrencyUpdate = (newCurrency: string) => {
    setCurrency(newCurrency);
    updateCurrency(newCurrency);
  };

  const handleAddAccount = () => {
    if (newAccount.name && bankAccounts.length < 16) {
      const updatedAccounts = [...bankAccounts, {
        ...newAccount,
        id: Date.now().toString()
      }];
      setBankAccounts(updatedAccounts);
      updateBankAccounts(updatedAccounts);
      setNewAccount({ name: '', balance: 0, color: '#3B82F6' });
      setIsAddingAccount(false);
    }
  };

  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = bankAccounts.filter(account => account.id !== id);
    setBankAccounts(updatedAccounts);
    updateBankAccounts(updatedAccounts);
  };

  const handleAccountUpdate = (id: string, field: string, value: string | number) => {
    const updatedAccounts = bankAccounts.map(account =>
      account.id === id ? { ...account, [field]: value } : account
    );
    setBankAccounts(updatedAccounts);
    updateBankAccounts(updatedAccounts);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'budget-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          localStorage.setItem('budgetData', JSON.stringify(importedData));
          window.location.reload();
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        
        {/* Person Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Partner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner 1 Name
                  </label>
                  <input
                    type="text"
                    value={personSettings.person1.name}
                    onChange={(e) => handlePersonUpdate('person1', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner 1 Color
                  </label>
                  <input
                    type="color"
                    value={personSettings.person1.color}
                    onChange={(e) => handlePersonUpdate('person1', 'color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner 2 Name
                  </label>
                  <input
                    type="text"
                    value={personSettings.person2.name}
                    onChange={(e) => handlePersonUpdate('person2', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner 2 Color
                  </label>
                  <input
                    type="color"
                    value={personSettings.person2.color}
                    onChange={(e) => handlePersonUpdate('person2', 'color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <DollarSign className="mr-2" size={20} />
              Currency
            </h3>
            <select
              value={currency}
              onChange={(e) => handleCurrencyUpdate(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bank Accounts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Bank Accounts ({bankAccounts.length}/16)
              </h3>
              <button
                onClick={() => setIsAddingAccount(true)}
                disabled={bankAccounts.length >= 16}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                <span>Add Account</span>
              </button>
            </div>

            {isAddingAccount && (
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Account name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Initial balance"
                    value={newAccount.balance || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="color"
                    value={newAccount.color}
                    onChange={(e) => setNewAccount({ ...newAccount, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleAddAccount}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Account
                  </button>
                  <button
                    onClick={() => setIsAddingAccount(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {bankAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={account.name}
                        onChange={(e) => handleAccountUpdate(account.id, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={account.balance}
                        onChange={(e) => handleAccountUpdate(account.id, 'balance', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={account.color}
                      onChange={(e) => handleAccountUpdate(account.id, 'color', e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Data Management</h3>
            <div className="flex space-x-4">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download size={20} />
                <span>Export Data</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer">
                <Upload size={20} />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Export your budget data as a JSON file or import previously saved data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}