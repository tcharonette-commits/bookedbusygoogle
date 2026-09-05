import React from 'react';
import { motion } from 'motion/react';
import { Appointment, Expense, Service, Client } from '../types';
import EyebrowArch from './EyebrowArch';
import { CheckCircle, AlertCircle, Calendar, Plus, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

interface HomeViewProps {
  appointments: Appointment[];
  expenses: Expense[];
  services: Service[];
  clients: Client[];
  userName: string;
  businessName: string;
  onCompleteAppointment: (id: string) => void;
  onQuickBook: (client: Client) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenQuickAdd: (type: 'appointment' | 'expense', prefill?: Partial<Appointment>) => void;
}

export default function HomeView({
  appointments,
  expenses,
  services,
  clients,
  userName,
  businessName,
  onCompleteAppointment,
  onQuickBook,
  onNavigateToTab,
  onOpenQuickAdd,
}: HomeViewProps) {
  // Use "2026-07-17" as reference current date to match simulation
  const TODAY_STR = '2026-07-17';
  const CURRENT_MONTH_PREFIX = '2026-07';

  // Calculate Income: sum of completed appointments in July 2026
  const thisMonthCompletedAppointments = appointments.filter(
    (app) => app.status === 'completed' && app.date.startsWith(CURRENT_MONTH_PREFIX)
  );
  const totalIncome = thisMonthCompletedAppointments.reduce((sum, app) => sum + app.price, 0);

  // Calculate Expenses: sum of expenses in July 2026
  const thisMonthExpenses = expenses.filter((exp) => exp.date.startsWith(CURRENT_MONTH_PREFIX));
  const totalExpenses = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Profit
  const totalProfit = totalIncome - totalExpenses;

  // Today's appointments
  const todayAppointments = appointments
    .filter((app) => app.date === TODAY_STR)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Determine rebooking alerts
  // To keep it simple & highly useful:
  // For each client, calculate the number of days since their last appointment (completed or scheduled)
  // If no future appointment is scheduled, and they are overdue or due soon, list them!
  const getRebookingAlerts = () => {
    const alerts: { client: Client; status: 'overdue' | 'due_soon'; daysOver: number; lastDateStr: string }[] = [];

    clients.forEach((client) => {
      // Find all appointments for this client
      const clientAppts = appointments.filter(
        (app) => app.clientName.toLowerCase() === client.name.toLowerCase() && app.status !== 'cancelled'
      );

      // Check if they have any scheduled appointment in the future (relative to TODAY_STR)
      const hasFutureAppt = clientAppts.some((app) => app.date >= TODAY_STR && app.status === 'scheduled');
      if (hasFutureAppt) return; // If already booked, no alert needed!

      // Find the latest appointment
      if (clientAppts.length === 0) return;

      const completedOrPastAppts = clientAppts.filter((app) => app.date <= TODAY_STR);
      if (completedOrPastAppts.length === 0) return;

      // Sort past appointments to find the latest
      completedOrPastAppts.sort((a, b) => b.date.localeCompare(a.date));
      const latestAppt = completedOrPastAppts[0];

      // Calculate days since latest appointment
      const latestDate = new Date(latestAppt.date);
      const todayDate = new Date(TODAY_STR);
      const diffTime = Math.abs(todayDate.getTime() - latestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const cycleDays = client.cycleWeeks * 7;
      const daysSince = diffDays;

      if (daysSince > cycleDays) {
        alerts.push({
          client,
          status: 'overdue',
          daysOver: daysSince - cycleDays,
          lastDateStr: latestAppt.date,
        });
      } else if (daysSince >= cycleDays - 3) {
        alerts.push({
          client,
          status: 'due_soon',
          daysOver: 0,
          lastDateStr: latestAppt.date,
        });
      }
    });

    // Sort: overdue first, then by days overdue
    return alerts.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return b.daysOver - a.daysOver;
    });
  };

  const rebookingAlerts = getRebookingAlerts().slice(0, 3); // Max 3 on dashboard

  return (
    <div className="space-y-6" id="home-view-container">
      {/* Greeting and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="home-header">
        <div>
          <span className="font-sans uppercase tracking-widest text-[11px] text-[#A08694] block">
            Welcome Back
          </span>
          <h1 className="font-serif italic text-3xl text-[#3A2733] mt-1" id="home-greeting">
            Hey, gorgeous.
          </h1>
          <p className="font-sans text-sm text-[#A08694]" id="home-subgreeting">
            {businessName} is active & thriving today.
          </p>
        </div>
        <div className="bg-[#EFDCD3] px-3 py-1 rounded-full text-xs font-sans text-[#3A2733] border border-[#D8C4BC] flex items-center gap-1.5" id="home-date-badge">
          <Calendar className="w-3.5 h-3.5 text-[#B84577]" />
          <span>July 17, 2026</span>
        </div>
      </div>

      {/* Signature curved divider under greeting */}
      <EyebrowArch className="my-1" />

      {/* Month-Total Large Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#3A2733] text-[#FBF6F2] rounded-2xl p-6 shadow-sm relative overflow-hidden"
        id="earnings-banner"
      >
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
          <TrendingUp className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center border-b border-[#FBF6F2]/10 pb-3">
            <span className="font-sans uppercase tracking-widest text-[11px] text-[#FBF6F2]/70">
              July 2026 Summary
            </span>
            <span className="text-xs bg-[#B84577] text-white px-2.5 py-0.5 rounded-full font-sans font-medium">
              PRO mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-[#FBF6F2]/10">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-[#FBF6F2]/60 font-sans">
                Month Profit
              </p>
              <h2 className="font-serif text-4xl font-semibold text-white">
                ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-[#8FAE7B] font-sans flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8FAE7B]"></span>
                Ready to reinvest
              </p>
            </div>

            <div className="space-y-1 md:pl-6">
              <p className="text-[11px] uppercase tracking-wider text-[#FBF6F2]/60 font-sans">
                Gross Income
              </p>
              <p className="font-serif text-2xl text-[#EFDCD3] font-medium">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#FBF6F2]/60 font-sans">
                From {thisMonthCompletedAppointments.length} bookings
              </p>
            </div>

            <div className="space-y-1 md:pl-6">
              <p className="text-[11px] uppercase tracking-wider text-[#FBF6F2]/60 font-sans">
                Total Expenses
              </p>
              <p className="font-serif text-2xl text-[#E08A72] font-medium">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#FBF6F2]/60 font-sans">
                {thisMonthExpenses.length} entries logged
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: Today's Appointments & Rebooking Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="home-dashboard-grid">
        
        {/* Today's Appointments (8 cols) */}
        <div className="lg:col-span-7 space-y-4" id="home-today-section">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg text-[#3A2733] flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#B84577]" />
              <span>Today's Schedule</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="font-sans uppercase tracking-widest text-[11px] text-[#B84577] hover:underline font-semibold"
              id="view-all-appointments-btn"
            >
              Full Calendar →
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="bg-[#F6EBE5] border border-[#D8C4BC] rounded-2xl p-8 text-center space-y-3" id="today-empty-state">
              <EyebrowArch className="mx-auto" />
              <p className="font-serif italic text-base text-[#3A2733] pt-1">
                "A quiet day is space to nurture your empire."
              </p>
              <p className="font-sans text-xs text-[#A08694] max-w-xs mx-auto">
                No appointments booked for today yet. Use the floating quick-add to schedule.
              </p>
              <button
                onClick={() => onOpenQuickAdd('appointment')}
                className="inline-flex items-center gap-1 bg-[#B84577] text-white font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#a13b68] transition-colors"
                id="empty-add-appt-btn"
              >
                <Plus className="w-3.5 h-3.5" /> Book Client
              </button>
            </div>
          ) : (
            <div className="space-y-3" id="today-appointments-list">
              {todayAppointments.map((appt, idx) => {
                const service = services.find((s) => s.id === appt.serviceId);
                const isAlternate = idx % 2 === 1;
                return (
                  <motion.div
                    key={appt.id}
                    whileHover={{ scale: 1.01 }}
                    className={`border border-[#D8C4BC] rounded-xl p-4 flex justify-between items-center gap-4 transition-all ${
                      appt.status === 'completed'
                        ? 'bg-[#F6EBE5]/60 opacity-75'
                        : isAlternate
                        ? 'bg-[#F6EBE5]'
                        : 'bg-[#EFDCD3]'
                    }`}
                    id={`today-appt-${appt.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-semibold text-sm text-[#3A2733] truncate">
                          {appt.clientName}
                        </span>
                        {appt.status === 'completed' && (
                          <span className="bg-[#8FAE7B] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full font-sans font-medium">
                            Done
                          </span>
                        )}
                        {appt.status === 'scheduled' && appt.checkedIn && (
                          <span className="bg-[#E08A72] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full font-sans font-medium animate-pulse">
                            Arrived
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-xs text-[#A08694] truncate">
                        {service?.name || 'Custom Service'} • {appt.duration}m
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-sans text-xs bg-white/60 text-[#3A2733] px-2 py-0.5 rounded-md font-medium border border-[#D8C4BC]/30">
                          {appt.time}
                        </span>
                        <span className="font-serif text-xs font-semibold text-[#B84577]">
                          ${appt.price}
                        </span>
                      </div>
                    </div>

                    {/* Quick Complete Action */}
                    {appt.status === 'scheduled' && (
                      <button
                        onClick={() => onCompleteAppointment(appt.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-[#8FAE7B]/10 hover:text-[#8FAE7B] text-[#A08694] border border-[#D8C4BC] transition-all cursor-pointer group shrink-0"
                        title="Mark as completed"
                        id={`complete-btn-${appt.id}`}
                      >
                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform text-[#8FAE7B]/40 group-hover:text-[#8FAE7B]" />
                        <span className="font-sans text-[9px] uppercase tracking-widest mt-1 font-semibold text-[#A08694] group-hover:text-[#8FAE7B]">
                          Done
                        </span>
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rebooking Alerts (5 cols) */}
        <div className="lg:col-span-5 space-y-4" id="home-rebooking-section">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg text-[#3A2733] flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-[#B84577]" />
              <span>Rebooking Alerts</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('rebooking')}
              className="font-sans uppercase tracking-widest text-[11px] text-[#B84577] hover:underline font-semibold"
              id="view-all-rebooking-btn"
            >
              Alerts Board →
            </button>
          </div>

          <div className="space-y-3" id="home-alerts-list">
            {/* Dark Note Card */}
            <div className="bg-[#3A2733] text-[#FBF6F2] rounded-2xl p-4 space-y-2 border border-[#D8C4BC]/20">
              <h4 className="font-serif italic text-sm text-[#EFDCD3]">Speed Rebooking</h4>
              <p className="font-sans text-xs text-[#FBF6F2]/80 leading-relaxed">
                Reach out to these clients to lock in their next beauty routine. Solo pros who follow up book 40% more fills!
              </p>
            </div>

            {rebookingAlerts.length === 0 ? (
              <div className="bg-white/60 border border-[#D8C4BC] rounded-2xl p-6 text-center" id="home-alerts-empty">
                <p className="font-serif italic text-xs text-[#3A2733]">
                  "Every relationship you nourish strengthens your foundation."
                </p>
                <p className="font-sans text-[11px] text-[#A08694] mt-1">
                  All clients are beautifully scheduled and on track!
                </p>
              </div>
            ) : (
              rebookingAlerts.map((alert) => {
                const service = services.find((s) => s.id === alert.client.typicalServiceId);
                const isOverdue = alert.status === 'overdue';
                
                return (
                  <div
                    key={alert.client.id}
                    className="bg-white border border-[#D8C4BC] rounded-xl p-3.5 flex justify-between items-center gap-3 shadow-xs"
                    id={`home-alert-${alert.client.id}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-sans font-semibold text-xs text-[#3A2733] truncate">
                          {alert.client.name}
                        </span>
                        <span
                          className={`text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded-full font-sans font-bold text-white shrink-0`}
                          style={{ backgroundColor: isOverdue ? '#E08A72' : '#B84577' }}
                        >
                          {isOverdue ? `Overdue` : 'Due Soon'}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-[#A08694] mt-0.5 truncate">
                        {service?.name || 'Service'} • Cycle: {alert.client.cycleWeeks}w
                      </p>
                      <p className="font-sans text-[10px] text-[#A08694] italic">
                        Last seen {alert.lastDateStr}
                      </p>
                    </div>

                    <button
                      onClick={() => onQuickBook(alert.client)}
                      className="bg-[#B84577]/10 text-[#B84577] border border-[#B84577]/20 hover:bg-[#B84577] hover:text-white transition-all text-[11px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-full flex items-center gap-1 shrink-0"
                      id={`home-rebook-btn-${alert.client.id}`}
                    >
                      <Plus className="w-3 h-3" /> Book
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
