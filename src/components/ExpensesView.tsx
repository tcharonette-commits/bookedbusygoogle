import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense } from '../types';
import EyebrowArch from './EyebrowArch';
import { Trash2, DollarSign, Plus, PiggyBank, Calendar, ShoppingBag, Receipt, MapPin, Award, Megaphone } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onOpenQuickAdd: (type: 'appointment' | 'expense') => void;
}

export default function ExpensesView({
  expenses,
  onDeleteExpense,
  onOpenQuickAdd,
}: ExpensesViewProps) {
  const CURRENT_MONTH_PREFIX = '2026-07';

  // Filter expenses for current month
  const thisMonthExpenses = expenses.filter((exp) => exp.date.startsWith(CURRENT_MONTH_PREFIX));
  const totalExpenses = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by category
  const categories: { [key in Expense['category']]: { label: string; color: string; icon: React.ComponentType<any>; bg: string } } = {
    supplies: { label: 'Supplies & Materials', color: '#B84577', icon: ShoppingBag, bg: 'bg-[#B84577]/10' },
    rent: { label: 'Rent & Space Leasing', color: '#3A2733', icon: MapPin, bg: 'bg-[#3A2733]/10' },
    education: { label: 'Education & Training', color: '#8FAE7B', icon: Award, bg: 'bg-[#8FAE7B]/10' },
    marketing: { label: 'Marketing & Ads', color: '#E08A72', icon: Megaphone, bg: 'bg-[#E08A72]/10' },
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = { supplies: 0, rent: 0, education: 0, marketing: 0 };
    thisMonthExpenses.forEach((exp) => {
      stats[exp.category] = (stats[exp.category] || 0) + exp.amount;
    });
    return stats;
  };

  const categoryTotals = getCategoryStats();

  return (
    <div className="space-y-6" id="expenses-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="expenses-header">
        <div>
          <span className="font-sans uppercase tracking-widest text-[11px] text-[#A08694] block">
            Finance & Overhead
          </span>
          <h2 className="font-serif text-2xl text-[#3A2733]" id="expenses-title">
            Expenses Log
          </h2>
        </div>

        <button
          onClick={() => onOpenQuickAdd('expense')}
          className="bg-[#B84577] text-white font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#a13b68] transition-colors flex items-center gap-1.5 font-medium shadow-xs"
          id="expenses-add-btn"
        >
          <Plus className="w-4 h-4" /> Log Expense
        </button>
      </div>

      <EyebrowArch id="expenses-divider" />

      {/* Grid: Overview and Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="expenses-overview-grid">
        
        {/* Large Total display Card (5 cols) */}
        <div className="md:col-span-5 bg-[#3A2733] text-[#FBF6F2] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-[#D8C4BC]/20">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <PiggyBank className="w-40 h-40" />
          </div>

          <div className="space-y-1 relative z-10">
            <span className="font-sans uppercase tracking-widest text-[11px] text-[#FBF6F2]/70">
              July 2026 Spending
            </span>
            <p className="font-sans text-xs text-[#EFDCD3]">
              All overhead, supplies, and business logs.
            </p>
          </div>

          <div className="mt-8 relative z-10 space-y-1">
            <p className="font-sans text-[11px] uppercase tracking-wider text-[#FBF6F2]/60">
              Total Expenses
            </p>
            <h2 className="font-serif text-4xl font-bold text-white">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="mt-6 border-t border-[#FBF6F2]/10 pt-4 text-xs font-sans text-[#EFDCD3]/80">
            Keep your receipts safe! Accurate logs mean lower taxes at tax time.
          </div>
        </div>

        {/* Category Breakdown Progress Bars (7 cols) */}
        <div className="md:col-span-7 bg-white border border-[#D8C4BC] rounded-2xl p-5 space-y-4" id="category-breakdown-card">
          <h3 className="font-serif text-base text-[#3A2733]">July Spend Breakdown</h3>

          <div className="space-y-3.5">
            {(Object.keys(categories) as Expense['category'][]).map((catKey) => {
              const catInfo = categories[catKey];
              const amount = categoryTotals[catKey] || 0;
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const Icon = catInfo.icon;

              return (
                <div key={catKey} className="space-y-1" id={`cat-row-${catKey}`}>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-sans font-medium text-[#3A2733]">
                      <span className={`p-1 rounded-md ${catInfo.bg}`} style={{ color: catInfo.color }}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span>{catInfo.label}</span>
                    </div>
                    <span className="font-serif font-semibold text-[#3A2733]">
                      ${amount.toFixed(2)} ({percentage.toFixed(0)}%)
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-2 bg-[#F6EBE5] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: catInfo.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Expenses History List */}
      <div className="space-y-4" id="expenses-timeline-section">
        <h3 className="font-serif text-lg text-[#3A2733] flex items-center gap-2">
          <Receipt className="w-4.5 h-4.5 text-[#B84577]" />
          <span>Timeline of Expenses</span>
        </h3>

        {thisMonthExpenses.length === 0 ? (
          <div className="bg-[#F6EBE5] border border-[#D8C4BC] rounded-2xl p-8 text-center space-y-2" id="expenses-empty">
            <EyebrowArch className="mx-auto" />
            <p className="font-serif italic text-sm text-[#3A2733]">
              "Every smart investment leads to a more lucrative harvest."
            </p>
            <p className="font-sans text-xs text-[#A08694]">
              No expenses recorded yet for this month.
            </p>
          </div>
        ) : (
          <div className="space-y-3" id="expenses-list">
            <AnimatePresence mode="popLayout">
              {thisMonthExpenses
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((exp, idx) => {
                  const catInfo = categories[exp.category];
                  const Icon = catInfo?.icon || Receipt;
                  const isAlternate = idx % 2 === 1;

                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`border border-[#D8C4BC] rounded-xl p-4 flex justify-between items-center gap-4 transition-all ${
                        isAlternate ? 'bg-[#F6EBE5]' : 'bg-[#EFDCD3]'
                      }`}
                      id={`expense-card-${exp.id}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Category Circular Badge */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-[#D8C4BC]/40 shadow-xs"
                          style={{ backgroundColor: 'white', color: catInfo?.color || '#3A2733' }}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-sans font-bold text-sm text-[#3A2733] truncate">
                            {exp.notes || catInfo?.label || 'Business Expense'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#A08694] mt-1 flex-wrap">
                            <span className="font-sans uppercase tracking-wider text-[9px] font-semibold" style={{ color: catInfo?.color }}>
                              {catInfo?.label || exp.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {exp.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Delete trigger */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-serif font-bold text-base text-[#3A2733]">
                          -${exp.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-[#A08694] hover:text-[#E08A72] p-1.5 rounded-full transition-colors"
                          title="Delete expense"
                          id={`btn-delete-expense-${exp.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
