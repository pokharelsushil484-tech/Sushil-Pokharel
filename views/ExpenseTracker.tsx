
import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Calendar, PieChart, ArrowUpRight, ArrowDownRight, X, DollarSign } from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, setExpenses }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    category: 'Food'
  });

  const categories = ['Food', 'Transport', 'Education', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

  const handleAdd = () => {
    if (!newExpense.amount || !newExpense.description) return;

    const expense: Expense = {
      id: Date.now().toString(),
      amount: Number(newExpense.amount),
      description: newExpense.description!,
      category: newExpense.category || 'Other',
      date: newExpense.date || new Date().toISOString(),
      type: newExpense.type || 'EXPENSE'
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ type: 'EXPENSE', date: new Date().toISOString().split('T')[0], category: 'Food' });
    setShowAdd(false);
  };

  const deleteExpense = (id: string) => {
    if(window.confirm("Delete this transaction?")) {
        setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const totalIncome = expenses.filter(e => e.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center"
        >
          <Plus size={18} className="mr-1" /> Add
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
         <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none flex flex-col justify-between h-32 relative overflow-hidden">
             <div className="absolute right-[-10px] top-[-10px] bg-white/10 w-20 h-20 rounded-full blur-xl"></div>
             <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
             <h2 className="text-2xl font-bold truncate">NPR {balance.toLocaleString()}</h2>
             <div className="mt-auto flex items-center text-[10px] bg-white/20 w-fit px-2 py-1 rounded-lg">
                <Wallet size={10} className="mr-1" /> Current
             </div>
         </div>
         <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col justify-between h-32">
             <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full w-fit text-green-600 dark:text-green-300 mb-2">
                 <ArrowUpRight size={16} />
             </div>
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">Income</p>
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400">+{totalIncome.toLocaleString()}</h3>
             </div>
         </div>
         <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800 flex flex-col justify-between h-32">
             <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full w-fit text-red-600 dark:text-red-300 mb-2">
                 <ArrowDownRight size={16} />
             </div>
             <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">Expense</p>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">-{totalExpense.toLocaleString()}</h3>
             </div>
         </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
          <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center">
              <Calendar size={18} className="mr-2 text-indigo-500"/> Recent Activity
          </h3>
          
          <div className="space-y-4">
              {expenses.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                      <DollarSign size={40} className="mx-auto text-gray-300 mb-2"/>
                      <p className="text-sm">No transactions yet.</p>
                  </div>
              )}
              {expenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                      <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              expense.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                              {expense.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{expense.description}</p>
                              <p className="text-xs text-gray-500">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <div className="flex items-center space-x-3">
                          <span className={`font-bold ${expense.type === 'INCOME' ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'}`}>
                              {expense.type === 'INCOME' ? '+' : '-'} {expense.amount.toLocaleString()}
                          </span>
                          <button onClick={() => deleteExpense(expense.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scale-up">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold dark:text-white">Add Transaction</h2>
                   <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
               </div>

               <div className="space-y-4">
                   <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                       <button 
                         onClick={() => setNewExpense({...newExpense, type: 'EXPENSE'})}
                         className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${newExpense.type === 'EXPENSE' ? 'bg-white dark:bg-gray-700 shadow text-red-600' : 'text-gray-500'}`}
                       >
                           Expense
                       </button>
                       <button 
                         onClick={() => setNewExpense({...newExpense, type: 'INCOME'})}
                         className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${newExpense.type === 'INCOME' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-500'}`}
                       >
                           Income
                       </button>
                   </div>

                   <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">Amount</label>
                       <input 
                         type="number" 
                         className="w-full text-2xl font-bold p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                         placeholder="0.00"
                         value={newExpense.amount || ''}
                         onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                         autoFocus
                       />
                   </div>

                   <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">Description</label>
                       <input 
                         type="text" 
                         className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                         placeholder="What was this for?"
                         value={newExpense.description || ''}
                         onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                       />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="text-xs font-bold text-gray-500 mb-1 block">Category</label>
                           <select 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                             value={newExpense.category}
                             onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                           >
                               {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500 mb-1 block">Date</label>
                           <input 
                             type="date"
                             className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                             value={newExpense.date}
                             onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                           />
                       </div>
                   </div>

                   <button 
                     onClick={handleAdd}
                     className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors mt-4 shadow-lg shadow-indigo-200 dark:shadow-none"
                   >
                       Save Transaction
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
