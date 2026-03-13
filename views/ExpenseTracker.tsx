
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense } from '../types';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Calendar, PieChart, ArrowUpRight, ArrowDownRight, X, DollarSign } from 'lucide-react';
import { useModal } from '../components/ModalProvider';

interface ExpenseTrackerProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, setExpenses }) => {
  const [showAdd, setShowAdd] = useState(false);
  const { showConfirm } = useModal();
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
    showConfirm('Delete Transaction', "Delete this transaction?", () => {
        setExpenses(expenses.filter(e => e.id !== id));
    });
  };

  const totalIncome = expenses.filter(e => e.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="pb-24 relative min-h-[600px] flex flex-col space-y-8"
    >
      <motion.div variants={item} className="flex justify-between items-center glass-card p-8">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
             <Wallet className="text-white" size={24} />
           </div>
           <div>
             <h1 className="text-xl font-display italic tracking-tight">Wallet</h1>
             <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">Financial Overview</p>
           </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="btn-premium px-6 py-3 text-xs flex items-center gap-2"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="glass-card p-6 relative overflow-hidden group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
             <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-2">Total Balance</p>
             <h2 className="text-3xl font-display italic tracking-tight text-white mb-4">NPR {balance.toLocaleString()}</h2>
             <div className="flex items-center text-[10px] bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5 text-white/60">
                <Wallet size={12} className="mr-2" /> Current Status
             </div>
         </div>
         <div className="glass-card p-6 relative overflow-hidden group hover:bg-emerald-500/5 transition-colors">
             <div className="flex justify-between items-start mb-6">
                 <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                     <ArrowUpRight size={20} />
                 </div>
             </div>
             <div>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-1">Total Income</p>
                <h3 className="text-2xl font-display italic tracking-tight text-emerald-400">+{totalIncome.toLocaleString()}</h3>
             </div>
         </div>
         <div className="glass-card p-6 relative overflow-hidden group hover:bg-red-500/5 transition-colors">
             <div className="flex justify-between items-start mb-6">
                 <div className="p-2 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20">
                     <ArrowDownRight size={20} />
                 </div>
             </div>
             <div>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-1">Total Expense</p>
                <h3 className="text-2xl font-display italic tracking-tight text-red-400">-{totalExpense.toLocaleString()}</h3>
             </div>
         </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="glass-card p-8 min-h-[400px]">
          <h3 className="font-display italic text-lg text-white mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-white/40"/> Recent Activity
          </h3>
          
          <div className="space-y-4">
              {expenses.length === 0 && (
                  <div className="text-center py-20 opacity-30 flex flex-col items-center justify-center">
                      <DollarSign size={48} className="text-white mb-4"/>
                      <p className="text-sm font-semibold uppercase tracking-widest text-white/60">No transactions yet</p>
                  </div>
              )}
              <AnimatePresence>
                {expenses.map(expense => (
                    <motion.div 
                        key={expense.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                expense.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {expense.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            </div>
                            <div>
                                <p className="font-medium text-white text-sm mb-0.5">{expense.description}</p>
                                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`font-display italic text-lg ${expense.type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}>
                                {expense.type === 'INCOME' ? '+' : '-'} {expense.amount.toLocaleString()}
                            </span>
                            <button onClick={() => deleteExpense(expense.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
              </AnimatePresence>
          </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card w-full max-w-md p-8 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-display italic text-white">Add Transaction</h2>
                    <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white transition-colors"><X size={24}/></button>
                </div>

                <div className="space-y-6">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setNewExpense({...newExpense, type: 'EXPENSE'})}
                            className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${newExpense.type === 'EXPENSE' ? 'bg-red-500/20 text-red-400 shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            Expense
                        </button>
                        <button 
                            onClick={() => setNewExpense({...newExpense, type: 'INCOME'})}
                            className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${newExpense.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            Income
                        </button>
                    </div>

                    <div>
                        <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 block ml-1">Amount</label>
                        <input 
                            type="number" 
                            className="w-full text-2xl font-display italic p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/20 text-white placeholder:text-white/10 transition-all"
                            placeholder="0.00"
                            value={newExpense.amount || ''}
                            onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 block ml-1">Description</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/20 text-sm text-white placeholder:text-white/20 transition-all"
                            placeholder="What was this for?"
                            value={newExpense.description || ''}
                            onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 block ml-1">Category</label>
                            <select 
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/20 text-sm text-white appearance-none transition-all"
                                value={newExpense.category}
                                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                            >
                                {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 block ml-1">Date</label>
                            <input 
                                type="date"
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/20 text-sm text-white transition-all"
                                value={newExpense.date}
                                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleAdd}
                        className="btn-premium w-full py-4 text-xs mt-4"
                    >
                        Save Transaction
                    </button>
                </div>
            </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
