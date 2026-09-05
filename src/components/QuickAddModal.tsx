import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Service, Appointment, Expense } from '../types';
import { X, Calendar, Clock, DollarSign, Tag, FileText, UserPlus, Sparkles, ShoppingBag } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  defaultType: 'appointment' | 'expense';
  onClose: () => void;
  clients: Client[];
  services: Service[];
  onAddAppointment: (appt: Omit<Appointment, 'id'>, newClientPhone?: string) => void;
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  prefillData: Partial<Appointment> | null;
}

export default function QuickAddModal({
  isOpen,
  defaultType,
  onClose,
  clients,
  services,
  onAddAppointment,
  onAddExpense,
  prefillData,
}: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<'appointment' | 'expense'>(defaultType);

  const TODAY_STR = '2026-07-17';

  // --- Appointment Form State ---
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [apptPrice, setApptPrice] = useState('');
  const [apptDuration, setApptDuration] = useState('60');
  const [apptDate, setApptDate] = useState(TODAY_STR);
  const [apptTime, setApptTime] = useState('10:00');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // --- Expense Form State ---
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'supplies' | 'rent' | 'education' | 'marketing'>('supplies');
  const [expenseDate, setExpenseDate] = useState(TODAY_STR);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Handle Prefilling and active tabs when modal opens or prefills update
  useEffect(() => {
    if (isOpen) {
      if (prefillData) {
        setActiveTab('appointment');
        setClientName(prefillData.clientName || '');
        setClientPhone(prefillData.clientPhone || '');
        setSelectedServiceId(prefillData.serviceId || services[0]?.id || '');
        setApptPrice(prefillData.price?.toString() || '');
        setApptDuration(prefillData.duration?.toString() || '60');
        setApptDate(prefillData.date || TODAY_STR);
        setApptTime(prefillData.time || '10:00');
      } else {
        setActiveTab(defaultType);
        // Clear forms on standard open
        setClientName('');
        setClientPhone('');
        const defaultService = services[0];
        if (defaultService) {
          setSelectedServiceId(defaultService.id);
          setApptPrice(defaultService.price.toString());
          setApptDuration(defaultService.duration.toString());
        }
        setApptDate(TODAY_STR);
        setApptTime('10:00');

        // Reset expense form
        setExpenseAmount('');
        setExpenseCategory('supplies');
        setExpenseDate(TODAY_STR);
        setExpenseNotes('');
      }
    }
  }, [isOpen, prefillData, defaultType, services]);

  // Adjust default price and duration when service changes
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setApptPrice(service.price.toString());
      setApptDuration(service.duration.toString());
    }
  };

  // Suggest clients as user types
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientName.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setClientName(client.name);
    setClientPhone(client.phone || '');
    setShowClientSuggestions(false);

    // Auto-fill typical service
    if (client.typicalServiceId) {
      handleServiceChange(client.typicalServiceId);
    }
  };

  // Submit appointment
  const handleApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !selectedServiceId) return;

    onAddAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      serviceId: selectedServiceId,
      date: apptDate,
      time: apptTime,
      price: parseFloat(apptPrice) || 0,
      duration: parseInt(apptDuration) || 60,
      status: 'scheduled',
    }, clientPhone.trim() || undefined);

    onClose();
  };

  // Submit expense
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;

    onAddExpense({
      amount: parseFloat(expenseAmount) || 0,
      category: expenseCategory,
      date: expenseDate,
      notes: expenseNotes.trim() || undefined,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#3A2733]/65 flex items-center justify-center p-4 z-50 animate-fade-in" id="quickadd-modal-overlay">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#FBF6F2] rounded-2xl max-w-md w-full border border-[#D8C4BC] overflow-hidden shadow-2xl flex flex-col"
            id="quickadd-modal-card"
          >
            {/* Header Tabs */}
            <div className="bg-[#3A2733] text-white pt-3 shrink-0" id="quickadd-tabs">
              <div className="flex justify-between items-center px-4.5 pb-2">
                <span className="font-serif italic text-base text-[#EFDCD3] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" /> Quick Entry
                </span>
                <button
                  onClick={onClose}
                  className="text-[#FBF6F2]/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Segment control inside header if no prefill is active */}
              {!prefillData && (
                <div className="flex border-t border-white/10">
                  <button
                    onClick={() => setActiveTab('appointment')}
                    className={`flex-1 py-3 text-center font-sans text-xs uppercase tracking-wider font-bold transition-all relative ${
                      activeTab === 'appointment' ? 'text-white' : 'text-[#FBF6F2]/65 hover:text-white'
                    }`}
                    id="qa-tab-appt"
                  >
                    Book Appointment
                    {activeTab === 'appointment' && (
                      <motion.div layoutId="modal-active-bar" className="absolute bottom-0 left-0 right-0 h-1 bg-[#B84577]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 py-3 text-center font-sans text-xs uppercase tracking-wider font-bold transition-all relative ${
                      activeTab === 'expense' ? 'text-white' : 'text-[#FBF6F2]/65 hover:text-white'
                    }`}
                    id="qa-tab-exp"
                  >
                    Log Expense
                    {activeTab === 'expense' && (
                      <motion.div layoutId="modal-active-bar" className="absolute bottom-0 left-0 right-0 h-1 bg-[#B84577]" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Content Form body */}
            <div className="p-6 overflow-y-auto max-h-[75vh]" id="quickadd-body">
              {activeTab === 'appointment' ? (
                /* APPOINTMENT BOOKING FORM */
                <form onSubmit={handleApptSubmit} className="space-y-4" id="appt-add-form">
                  {/* Client Name Input with suggestions */}
                  <div className="space-y-1 relative">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                      Client Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setShowClientSuggestions(true);
                      }}
                      onFocus={() => setShowClientSuggestions(true)}
                      placeholder="Start typing name..."
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                      id="qa-input-client-name"
                      autoComplete="off"
                    />

                    {/* Suggestions list */}
                    {showClientSuggestions && clientName && filteredClients.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D8C4BC] rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto py-1 divide-y divide-[#D8C4BC]/20">
                        {filteredClients.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectClient(c)}
                            className="px-3.5 py-2 text-xs text-[#3A2733] hover:bg-[#F6EBE5] cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-semibold">{c.name}</span>
                            {c.phone && <span className="text-[10px] text-[#A08694] font-mono">{c.phone}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {showClientSuggestions && clientName && filteredClients.length === 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-[#F6EBE5] border border-[#D8C4BC] rounded-xl p-2.5 z-50 text-[11px] text-[#3A2733] flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-[#B84577]" />
                        <span>"New Client" profile will be auto-created!</span>
                      </div>
                    )}
                  </div>

                  {/* Client Phone (shown if new client or for customization) */}
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                      Client Phone
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. 555-0122"
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                      id="qa-input-client-phone"
                    />
                  </div>

                  {/* Service Selector */}
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                      Service
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      required
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                      id="qa-input-service"
                    >
                      <option value="" disabled>Select a service...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (${s.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        required
                        value={apptPrice}
                        onChange={(e) => setApptPrice(e.target.value)}
                        className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                        id="qa-input-price"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        required
                        value={apptDuration}
                        onChange={(e) => setApptDuration(e.target.value)}
                        className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                        id="qa-input-duration"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B84577]" /> Date
                      </label>
                      <input
                        type="date"
                        required
                        value={apptDate}
                        onChange={(e) => setApptDate(e.target.value)}
                        className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                        id="qa-input-date"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#B84577]" /> Time
                      </label>
                      <input
                        type="time"
                        required
                        value={apptTime}
                        onChange={(e) => setApptTime(e.target.value)}
                        className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                        id="qa-input-time"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#D8C4BC]/40 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-sans uppercase tracking-wider text-[#A08694] hover:text-[#3A2733] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#B84577] hover:bg-[#a13b68] text-white px-5 py-2.5 rounded-full font-sans text-xs uppercase tracking-wider font-bold shadow-md"
                      id="qa-submit-appt-btn"
                    >
                      Save Appointment
                    </button>
                  </div>
                </form>
              ) : (
                /* EXPENSE LOGGING FORM */
                <form onSubmit={handleExpenseSubmit} className="space-y-4" id="expense-add-form">
                  {/* Category selector */}
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                      Expense Category
                    </label>
                    <div className="grid grid-cols-2 gap-2" id="expense-categories-select">
                      {(['supplies', 'rent', 'education', 'marketing'] as const).map((cat) => {
                        const labels = {
                          supplies: 'Supplies',
                          rent: 'Rent / Space',
                          education: 'Education',
                          marketing: 'Marketing',
                        };
                        const isSelected = expenseCategory === cat;
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setExpenseCategory(cat)}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-medium transition-all text-center ${
                              isSelected
                                ? 'bg-[#3A2733] text-[#FBF6F2] border-[#3A2733] shadow-xs'
                                : 'bg-white border-[#D8C4BC] text-[#3A2733] hover:bg-[#F6EBE5]'
                            }`}
                          >
                            {labels[cat]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#B84577]" /> Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                      id="qa-input-expense-amount"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#B84577]" /> Date of Expense
                    </label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                      id="qa-input-expense-date"
                    />
                  </div>

                  {/* Notes / Description */}
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#B84577]" /> Notes / Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      placeholder="e.g. Ring light bulb, glue palette"
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] focus:ring-1 focus:ring-[#B84577] focus:outline-hidden"
                      id="qa-input-expense-notes"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#D8C4BC]/40 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-sans uppercase tracking-wider text-[#A08694] hover:text-[#3A2733] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#B84577] hover:bg-[#a13b68] text-white px-5 py-2.5 rounded-full font-sans text-xs uppercase tracking-wider font-bold shadow-md"
                      id="qa-submit-exp-btn"
                    >
                      Log Expense
                    </button>
                  </div>
                </form>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
