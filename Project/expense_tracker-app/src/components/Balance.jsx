import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import TransactionMenu from './TransactionMenu';

const Balance = () => {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const onIncome = (amount) => {
    setIncome((prev) => prev + amount);
    setBalance((prev) => prev + amount);
  };

  const onExpense = (amount) => {
    setExpense((prev) => prev + amount);
    setBalance((prev) => prev - amount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col gap-6"
    >
      <div className="glass-card rounded-5xl p-12 text-center relative overflow-hidden group border-white/[0.03]">
        <div className="absolute -right-8 -top-8 text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-1000">
          <Wallet size={180} strokeWidth={1} />
        </div>
        <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-4">Current Balance</p>
        <h1 className="text-6xl font-bold tracking-tighter text-white">
          <span className="text-primary-light mr-2">₹</span>
          {balance.toLocaleString('en-IN')}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card rounded-4xl p-6 flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-500/5 text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Income</p>
            <p className="text-xl font-bold text-emerald-400">₹{income.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="glass-card rounded-4xl p-6 flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-2xl bg-rose-500/5 text-rose-400">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expense</p>
            <p className="text-xl font-bold text-rose-400">₹{expense.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <TransactionMenu onIncome={onIncome} onExpense={onExpense} />
    </motion.div>
  );
};

export default Balance;
