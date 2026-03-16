import { motion } from 'framer-motion';
import Balance from './components/Balance';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 px-4">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] mb-3">Expense Tracker</h2>
          </motion.div>
        </header>

        <Balance />

        <footer className="mt-16 text-center">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-[0.3em] opacity-40">
            Dhruva @ 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
