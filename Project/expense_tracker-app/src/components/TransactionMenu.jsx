import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Tag, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const TransactionMenu = ({ onIncome, onExpense }) => {
  const [menu, setMenu] = useState(false);
  const [data, setData] = useState([]);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [transactionType, setTransactionType] = useState('Expense');

  const toggleButton = () => setMenu(!menu);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title) return;

    const info = {
      id: Date.now(),
      amount: Number(amount),
      title,
      transactionType,
    };

    if (transactionType === 'Income') {
      onIncome(Number(amount));
    } else {
      onExpense(Number(amount));
    }

    setData((prev) => [info, ...prev]);
    setAmount('');
    setTitle('');
    setTransactionType('Expense');
    setMenu(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-5 rounded-4xl font-bold tracking-[0.2em] uppercase text-[10px] transition-all flex items-center justify-center space-x-3 
            ${menu 
              ? 'bg-slate-900 text-slate-500' 
              : 'bg-primary text-white hover:bg-primary-light shadow-premium'}
          `}
          onClick={toggleButton}
        >
          {menu ? <X size={16} /> : <Plus size={16} />}
          <span>{menu ? 'Dismiss' : 'New Transaction'}</span>
        </motion.button>

        <AnimatePresence>
          {menu && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full mt-6 glass-card p-8 rounded-[2rem] border-indigo-500/20 shadow-2xl"
            >
              <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-1 flex items-center">
                    <Tag size={10} className="mr-2 opacity-50" /> Title
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Transaction name"
                    className="w-full p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl focus:border-primary/50 outline-none text-white transition-all text-sm placeholder:text-slate-700"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-1 flex items-center">
                    <span className="mr-2 opacity-50 text-[10px]">₹</span> Amount (INR)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0.00"
                    className="w-full p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl focus:border-primary/50 outline-none text-white transition-all text-sm placeholder:text-slate-700"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('Income')}
                    className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${transactionType === 'Income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-slate-600'}`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('Expense')}
                    className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${transactionType === 'Expense' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-white/[0.02] border-white/5 text-slate-600'}`}
                  >
                    Expense
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="bg-primary text-white py-5 rounded-4xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-premium hover:bg-primary-light transition-colors"
                >
                  Confirm Transaction
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        {data.length > 0 && (
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-1 mb-2">
            History
          </h3>
        )}
        <AnimatePresence>
          {data.map((dt) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={dt.id}
              className="flex items-center justify-between p-2 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${dt.transactionType === 'Expense' ? 'bg-rose-500/5 text-rose-400' : 'bg-emerald-500/5 text-emerald-400'}`}>
                  {dt.transactionType === 'Expense' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/80 group-hover:text-white transition-colors text-sm">{dt.title}</span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{new Date(dt.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <div className={`font-bold text-base ${dt.transactionType === 'Expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {dt.transactionType === 'Expense' ? '-' : '+'}₹{dt.amount.toLocaleString('en-IN')}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TransactionMenu;
