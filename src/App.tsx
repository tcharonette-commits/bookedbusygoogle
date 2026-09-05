import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DEFAULT_APPOINTMENTS,
  DEFAULT_EXPENSES,
  DEFAULT_CLIENTS,
  DEFAULT_SETTINGS,
} from './data/defaults';
import { Appointment, Expense, Client, UserSettings } from './types';
import HomeView from './components/HomeView';
import AppointmentsView from './components/AppointmentsView';
import RebookingView from './components/RebookingView';
import ExpensesView from './components/ExpensesView';
import CheckInView from './components/CheckInView';
import SettingsModal from './components/SettingsModal';
import QuickAddModal from './components/QuickAddModal';
import EyebrowArch from './components/EyebrowArch';
import {
  Sparkles,
  CalendarDays,
  RefreshCw,
  Receipt,
  Settings,
  Plus,
  User,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // --- Persistence State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<'appointment' | 'expense'>('appointment');
  const [prefillData, setPrefillData] = useState<Partial<Appointment> | null>(null);

  // 1. Initial Load from LocalStorage with fallbacks
  useEffect(() => {
    try {
      const storedAppts = localStorage.getItem('b_b_appointments');
      const storedExp = localStorage.getItem('b_b_expenses');
      const storedClients = localStorage.getItem('b_b_clients');
      const storedSettings = localStorage.getItem('b_b_settings');

      if (storedAppts) {
        setAppointments(JSON.parse(storedAppts));
      } else {
        setAppointments(DEFAULT_APPOINTMENTS);
        localStorage.setItem('b_b_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
      }

      if (storedExp) {
        setExpenses(JSON.parse(storedExp));
      } else {
        setExpenses(DEFAULT_EXPENSES);
        localStorage.setItem('b_b_expenses', JSON.stringify(DEFAULT_EXPENSES));
      }

      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(DEFAULT_CLIENTS);
        localStorage.setItem('b_b_clients', JSON.stringify(DEFAULT_CLIENTS));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('b_b_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (err) {
      console.error('Error loading stored Booked & Busy PRO data', err);
    }
  }, []);

  // 2. State persistence effect triggers
  const saveAppointments = (newAppts: Appointment[]) => {
    setAppointments(newAppts);
    localStorage.setItem('b_b_appointments', JSON.stringify(newAppts));
  };

  const saveExpenses = (newExp: Expense[]) => {
    setExpenses(newExp);
    localStorage.setItem('b_b_expenses', JSON.stringify(newExp));
  };

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('b_b_clients', JSON.stringify(newClients));
  };

  const saveSettingsState = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('b_b_settings', JSON.stringify(newSettings));
  };

  // --- Handlers & Core Updates ---

  // Complete Appointment: auto-adds its price to dynamic income calculation
  const handleCompleteAppointment = (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, status: 'completed' as const } : appt
    );
    saveAppointments(updated);
  };

  // Check-In Appointment
  const handleCheckIn = (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, checkedIn: true } : appt
    );
    saveAppointments(updated);
  };

  // Cancel Appointment
  const handleCancelAppointment = (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, status: 'cancelled' as const } : appt
    );
    saveAppointments(updated);
  };

  // Delete Appointment
  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((appt) => appt.id !== id);
    saveAppointments(updated);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((exp) => exp.id !== id);
    saveExpenses(updated);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    saveSettingsState(newSettings);
  };

  // Speed Rebooking "Book again" flow:
  // Pre-fills a new appointment with client's typical service configuration
  const handleQuickBook = (client: Client) => {
    const service = settings.services.find((s) => s.id === client.typicalServiceId);
    setPrefillData({
      clientName: client.name,
      clientPhone: client.phone || '',
      serviceId: client.typicalServiceId,
      price: service?.price || 60,
      duration: service?.duration || 60,
    });
    setQuickAddDefaultType('appointment');
    setIsQuickAddOpen(true);
  };

  // Add Appointment (creates Client profile behind the scenes if name is fresh!)
  const handleAddAppointment = (newApptData: Omit<Appointment, 'id'>, newClientPhone?: string) => {
    const newId = `a_${Date.now()}`;
    const newAppt: Appointment = {
      id: newId,
      ...newApptData,
    };

    saveAppointments([...appointments, newAppt]);

    // Check if client name already exists. If not, auto-register client profile!
    const clientExists = clients.some(
      (c) => c.name.toLowerCase() === newApptData.clientName.toLowerCase()
    );

    if (!clientExists && newApptData.clientName.trim()) {
      const newClient: Client = {
        id: `c_${Date.now()}`,
        name: newApptData.clientName.trim(),
        phone: newClientPhone || newApptData.clientPhone,
        typicalServiceId: newApptData.serviceId,
        cycleWeeks: settings.defaultCycleWeeks,
      };
      saveClients([...clients, newClient]);
    }
  };

  // Add Expense
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newId = `e_${Date.now()}`;
    const newExp: Expense = {
      id: newId,
      ...newExpData,
    };
    saveExpenses([...expenses, newExp]);
  };

  // Add Client
  const handleAddClient = (newClientData: Omit<Client, 'id'>) => {
    const newId = `c_${Date.now()}`;
    const newClient: Client = {
      id: newId,
      ...newClientData,
    };
    saveClients([...clients, newClient]);
  };

  // Update Client
  const handleUpdateClient = (updatedClient: Client) => {
    const updated = clients.map((c) => (c.id === updatedClient.id ? updatedClient : c));
    saveClients(updated);
  };

  // Delete Client
  const handleDeleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    saveClients(updated);
  };

  // Trigger empty quick add modal
  const handleOpenQuickAdd = (type: 'appointment' | 'expense', prefill?: Partial<Appointment>) => {
    setPrefillData(prefill || null);
    setQuickAddDefaultType(type);
    setIsQuickAddOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FBF6F2] text-[#3A2733] font-sans relative" id="app-viewport">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#FBF6F2] text-[#3A2733] border-r border-[#D8C4BC] p-8 fixed inset-y-0 left-0 z-30" id="desktop-sidebar">
        <div className="mb-8 font-serif font-semibold text-xl tracking-tight text-[#3A2733]" id="sidebar-logo">
          Booked & Busy<span className="text-[#B84577] ml-1 text-xs uppercase tracking-widest font-sans font-semibold">Pro</span>
        </div>

        <EyebrowArch className="text-[#D8C4BC]" />

        {/* Navigation links */}
        <nav className="flex flex-col gap-6 mt-8 flex-1" id="desktop-nav">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-4 text-left transition-all font-sans text-[11px] uppercase tracking-widest font-semibold ${
              activeTab === 'home'
                ? 'text-[#B84577]'
                : 'text-[#3A2733] opacity-60 hover:opacity-100'
            }`}
            id="sidebar-tab-home"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'home' ? 'bg-[#B84577]' : 'border border-[#3A2733]'}`} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-4 text-left transition-all font-sans text-[11px] uppercase tracking-widest font-semibold ${
              activeTab === 'appointments'
                ? 'text-[#B84577]'
                : 'text-[#3A2733] opacity-60 hover:opacity-100'
            }`}
            id="sidebar-tab-appointments"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'appointments' ? 'bg-[#B84577]' : 'border border-[#3A2733]'}`} />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('rebooking')}
            className={`w-full flex items-center gap-4 text-left transition-all font-sans text-[11px] uppercase tracking-widest font-semibold ${
              activeTab === 'rebooking'
                ? 'text-[#B84577]'
                : 'text-[#3A2733] opacity-60 hover:opacity-100'
            }`}
            id="sidebar-tab-rebooking"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'rebooking' ? 'bg-[#B84577]' : 'border border-[#3A2733]'}`} />
            <span>Rebooking</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`w-full flex items-center gap-4 text-left transition-all font-sans text-[11px] uppercase tracking-widest font-semibold ${
              activeTab === 'expenses'
                ? 'text-[#B84577]'
                : 'text-[#3A2733] opacity-60 hover:opacity-100'
            }`}
            id="sidebar-tab-expenses"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'expenses' ? 'bg-[#B84577]' : 'border border-[#3A2733]'}`} />
            <span>Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`w-full flex items-center gap-4 text-left transition-all font-sans text-[11px] uppercase tracking-widest font-semibold ${
              activeTab === 'checkin'
                ? 'text-[#B84577]'
                : 'text-[#3A2733] opacity-60 hover:opacity-100'
            }`}
            id="sidebar-tab-checkin"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'checkin' ? 'bg-[#B84577]' : 'border border-[#3A2733]'}`} />
            <span>Lobby Check-In</span>
          </button>
        </nav>

        {/* Professional info profile triggers settings at bottom */}
        <div className="pt-4 mt-auto space-y-3" id="desktop-profile-footer">
          <div
            onClick={() => setIsSettingsOpen(true)}
            className="p-4 bg-[#F6EBE5] rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:bg-[#EFDCD3]"
            title="Configure services & profile"
            id="desktop-avatar-trigger"
          >
            <div className="w-10 h-10 rounded-full bg-[#B84577] flex items-center justify-center text-white font-sans font-semibold shrink-0 shadow-sm text-sm">
              {settings.userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="font-sans font-semibold text-[12px] text-[#3A2733] truncate">{settings.userName}</p>
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#3A2733] opacity-60 truncate">{settings.businessName}</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-[#D8C4BC] hover:border-[#B84577] text-[#3A2733] hover:text-[#B84577] rounded-full text-[10px] font-sans uppercase tracking-widest font-bold transition-all"
            id="desktop-settings-btn"
          >
            <Settings className="w-3.5 h-3.5" /> Configure PRO
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOP NAVIGATION BAR */}
      <header className="flex md:hidden justify-between items-center bg-[#FBF6F2] border-b border-[#D8C4BC]/60 px-4.5 py-3 sticky top-0 z-20 w-full shrink-0" id="mobile-top-bar">
        <div className="flex flex-col">
          <span className="font-serif italic text-[10px] text-[#A08694]">Booked & Busy PRO</span>
          <span className="font-serif font-bold text-base text-[#3A2733] tracking-tight">{settings.businessName}</span>
        </div>

        {/* Profile Avatar Trigger settings top-right */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-9 h-9 rounded-full bg-[#3A2733] border border-[#D8C4BC] flex items-center justify-center text-[#FBF6F2] font-serif font-bold text-xs shadow-xs focus:ring-1 focus:ring-[#B84577]"
          id="mobile-avatar-trigger"
        >
          {settings.userName.split(' ').map(n => n[0]).join('')}
        </button>
      </header>

      {/* 3. CENTERED CONTENT STAGE CONTAINER */}
      <main className="flex-1 md:pl-64 min-w-0 pb-28 md:pb-8 flex flex-col" id="main-content-stage">
        <div className="max-w-[900px] w-full mx-auto px-4.5 py-6 md:py-8 md:px-12 space-y-6 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {activeTab === 'home' && (
                <HomeView
                  appointments={appointments}
                  expenses={expenses}
                  services={settings.services}
                  clients={clients}
                  userName={settings.userName}
                  businessName={settings.businessName}
                  onCompleteAppointment={handleCompleteAppointment}
                  onQuickBook={handleQuickBook}
                  onNavigateToTab={setActiveTab}
                  onOpenQuickAdd={handleOpenQuickAdd}
                />
              )}

              {activeTab === 'appointments' && (
                <AppointmentsView
                  appointments={appointments}
                  services={settings.services}
                  onCompleteAppointment={handleCompleteAppointment}
                  onCancelAppointment={handleCancelAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onOpenQuickAdd={handleOpenQuickAdd}
                />
              )}

              {activeTab === 'rebooking' && (
                <RebookingView
                  clients={clients}
                  appointments={appointments}
                  services={settings.services}
                  onQuickBook={handleQuickBook}
                  onAddClient={handleAddClient}
                  onUpdateClient={handleUpdateClient}
                  onDeleteClient={handleDeleteClient}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesView
                  expenses={expenses}
                  onDeleteExpense={handleDeleteExpense}
                  onOpenQuickAdd={handleOpenQuickAdd}
                />
              )}

              {activeTab === 'checkin' && (
                <CheckInView
                  appointments={appointments}
                  services={settings.services}
                  clients={clients}
                  businessName={settings.businessName}
                  userName={settings.userName}
                  onCheckIn={handleCheckIn}
                  onAddAppointment={handleAddAppointment}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 4. MOBILE BOTTOM BAR NAVIGATION */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[#FBF6F2] text-[#3A2733] border-t border-[#D8C4BC] z-30 justify-around py-2.5 px-1 pb-4 shadow-lg animate-fade-in" id="mobile-tab-bar">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            activeTab === 'home' ? 'text-[#B84577]' : 'text-[#3A2733]/60'
          }`}
          id="mobile-tab-home"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-sans text-[9px] uppercase tracking-wider font-semibold">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            activeTab === 'appointments' ? 'text-[#B84577]' : 'text-[#3A2733]/60'
          }`}
          id="mobile-tab-appointments"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="font-sans text-[9px] uppercase tracking-wider font-semibold">Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('rebooking')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            activeTab === 'rebooking' ? 'text-[#B84577]' : 'text-[#3A2733]/60'
          }`}
          id="mobile-tab-rebooking"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="font-sans text-[9px] uppercase tracking-wider font-semibold">Retain</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            activeTab === 'expenses' ? 'text-[#B84577]' : 'text-[#3A2733]/60'
          }`}
          id="mobile-tab-expenses"
        >
          <Receipt className="w-5 h-5" />
          <span className="font-sans text-[9px] uppercase tracking-wider font-semibold">Expenses</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors ${
            activeTab === 'checkin' ? 'text-[#B84577]' : 'text-[#3A2733]/60'
          }`}
          id="mobile-tab-checkin"
        >
          <UserCheck className="w-5 h-5" />
          <span className="font-sans text-[9px] uppercase tracking-wider font-semibold">Check-In</span>
        </button>
      </nav>

      {/* 5. DYNAMIC FLOATING "+" QUICK-ADD TRIGGER BUTTON */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleOpenQuickAdd('appointment')}
        className="fixed bottom-22 md:bottom-8 right-6 z-40 bg-[#B84577] hover:bg-[#a13b68] text-white p-4.5 rounded-full shadow-lg transition-colors cursor-pointer flex items-center justify-center border border-white/10"
        title="Quick entry"
        id="floating-quick-add"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </motion.button>

      {/* Settings Modal Component */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Quick Add Modal Component (combines both Appointment Booking & Expense Logging) */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        defaultType={quickAddDefaultType}
        onClose={() => setIsQuickAddOpen(false)}
        clients={clients}
        services={settings.services}
        onAddAppointment={handleAddAppointment}
        onAddExpense={handleAddExpense}
        prefillData={prefillData}
      />

    </div>
  );
}
