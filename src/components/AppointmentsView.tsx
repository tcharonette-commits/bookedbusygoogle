import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Service } from '../types';
import EyebrowArch from './EyebrowArch';
import { Calendar, Check, X, Clock, DollarSign, Plus, Trash2, CalendarDays, History } from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  services: Service[];
  onCompleteAppointment: (id: string) => void;
  onCancelAppointment: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenQuickAdd: (type: 'appointment' | 'expense') => void;
}

export default function AppointmentsView({
  appointments,
  services,
  onCompleteAppointment,
  onCancelAppointment,
  onDeleteAppointment,
  onOpenQuickAdd,
}: AppointmentsViewProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const TODAY_STR = '2026-07-17';

  // Filter active/upcoming vs history
  const upcomingAppointments = appointments.filter((app) => app.date >= TODAY_STR && app.status === 'scheduled');
  const pastAppointments = appointments.filter((app) => app.date < TODAY_STR || app.status !== 'scheduled');

  // Helper to format date string nicely
  const formatDateHeader = (dateStr: string) => {
    if (dateStr === TODAY_STR) return "Today • July 17, 2026";
    
    // Check if tomorrow
    const tDate = new Date(TODAY_STR);
    tDate.setDate(tDate.getDate() + 1);
    const tomorrowStr = tDate.toISOString().split('T')[0];
    if (dateStr === tomorrowStr) return "Tomorrow • July 18, 2026";

    // Standard formatting
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
    return d.toLocaleDateString('en-US', options);
  };

  // Group appointments by date
  const groupAppointmentsByDate = (apptList: Appointment[]) => {
    const groups: { [key: string]: Appointment[] } = {};
    apptList.forEach((appt) => {
      if (!groups[appt.date]) {
        groups[appt.date] = [];
      }
      groups[appt.date].push(appt);
    });

    // Sort dates
    const sortedDates = Object.keys(groups).sort((a, b) => {
      return activeTab === 'upcoming' ? a.localeCompare(b) : b.localeCompare(a);
    });

    return sortedDates.map((date) => ({
      date,
      list: groups[date].sort((a, b) => a.time.localeCompare(b.time)),
    }));
  };

  const grouped = groupAppointmentsByDate(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments);

  return (
    <div className="space-y-6" id="appointments-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="appointments-header">
        <div>
          <span className="font-sans uppercase tracking-widest text-[11px] text-[#A08694] block">
            Client Schedule
          </span>
          <h2 className="font-serif text-2xl text-[#3A2733]" id="appointments-title">
            Appointments
          </h2>
        </div>

        <button
          onClick={() => onOpenQuickAdd('appointment')}
          className="bg-[#B84577] text-white font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#a13b68] transition-colors flex items-center gap-1.5 font-medium shadow-xs"
          id="appointments-add-btn"
        >
          <Plus className="w-4 h-4" /> Book Client
        </button>
      </div>

      <EyebrowArch id="appointments-divider" />

      {/* Segment Switcher */}
      <div className="bg-[#EFDCD3]/60 p-1 rounded-full border border-[#D8C4BC] flex" id="appointments-tabs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-full font-sans text-xs uppercase tracking-wider transition-all font-semibold ${
            activeTab === 'upcoming'
              ? 'bg-[#3A2733] text-[#FBF6F2] shadow-xs'
              : 'text-[#A08694] hover:text-[#3A2733]'
          }`}
          id="tab-upcoming"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Active & </span>Upcoming ({upcomingAppointments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-full font-sans text-xs uppercase tracking-wider transition-all font-semibold ${
            activeTab === 'history'
              ? 'bg-[#3A2733] text-[#FBF6F2] shadow-xs'
              : 'text-[#A08694] hover:text-[#3A2733]'
          }`}
          id="tab-history"
        >
          <History className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">History & </span>Past ({pastAppointments.length})</span>
        </button>
      </div>

      {/* Schedule Content */}
      <div className="space-y-6" id="appointments-list-container">
        {grouped.length === 0 ? (
          <div className="bg-[#F6EBE5] border border-[#D8C4BC] rounded-2xl p-10 text-center space-y-4" id="appointments-empty-state">
            <EyebrowArch className="mx-auto" />
            <p className="font-serif italic text-base text-[#3A2733]" id="appointments-empty-text">
              {activeTab === 'upcoming' 
                ? '"Your hands create the beauty, but your drive builds the future."'
                : '"Every completed fill is a brick in your beauty empire."'}
            </p>
            <p className="font-sans text-xs text-[#A08694] max-w-sm mx-auto">
              {activeTab === 'upcoming'
                ? "No active or upcoming client sessions scheduled. Let's get someone on your table!"
                : "No past appointment records found yet."}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => onOpenQuickAdd('appointment')}
                className="bg-[#B84577] text-white font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#a13b68] transition-colors"
                id="empty-book-now-btn"
              >
                Book Your First Client
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6" id="appointments-grouped-list">
            <AnimatePresence mode="popLayout">
              {grouped.map((group) => (
                <motion.div
                  key={group.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                  id={`date-group-${group.date}`}
                >
                  <h3 className="font-sans text-xs uppercase tracking-widest text-[#3A2733] font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B84577]"></span>
                    {formatDateHeader(group.date)}
                  </h3>

                  <div className="space-y-3 pl-4 border-l border-[#D8C4BC]/60" id={`date-list-${group.date}`}>
                    {group.list.map((appt, idx) => {
                      const service = services.find((s) => s.id === appt.serviceId);
                      const isAlternate = idx % 2 === 1;

                      return (
                        <motion.div
                          key={appt.id}
                          whileHover={{ scale: 1.005 }}
                          className={`border border-[#D8C4BC] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            appt.status === 'completed'
                              ? 'bg-[#F6EBE5]/60 opacity-80'
                              : appt.status === 'cancelled'
                              ? 'bg-neutral-100 opacity-60 line-through border-neutral-300'
                              : isAlternate
                              ? 'bg-[#F6EBE5]'
                              : 'bg-[#EFDCD3]'
                          }`}
                          id={`appt-card-${appt.id}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-serif font-bold text-base text-[#3A2733]">
                                {appt.clientName}
                              </span>
                              
                              {/* Status Badges */}
                              {appt.status === 'completed' && (
                                <span className="bg-[#8FAE7B] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-sans font-semibold">
                                  Completed
                                </span>
                              )}
                              {appt.status === 'cancelled' && (
                                <span className="bg-neutral-400 text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-sans font-semibold">
                                  Cancelled
                                </span>
                              )}
                              {appt.status === 'scheduled' && (
                                <span className="bg-[#B84577]/10 text-[#B84577] border border-[#B84577]/20 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-sans font-semibold">
                                  Booked
                                </span>
                              )}
                              {appt.status === 'scheduled' && appt.checkedIn && (
                                <span className="bg-[#E08A72] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-sans font-semibold animate-pulse">
                                  Arrived
                                </span>
                              )}
                            </div>

                            <p className="font-sans text-xs text-[#3A2733]/80 mt-1">
                              Service: <span className="font-medium text-[#3A2733]">{service?.name || 'Custom Service'}</span>
                            </p>

                            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-[#A08694]">
                              <span className="flex items-center gap-1 bg-white/40 px-2 py-0.5 rounded-md border border-[#D8C4BC]/20">
                                <Clock className="w-3.5 h-3.5 text-[#B84577]" />
                                <span>{appt.time} ({appt.duration}m)</span>
                              </span>
                              <span className="flex items-center gap-1 bg-white/40 px-2 py-0.5 rounded-md border border-[#D8C4BC]/20 font-serif font-bold text-[#B84577]">
                                <span>${appt.price}</span>
                              </span>
                              {appt.clientPhone && (
                                <span className="font-sans text-[11px]">
                                  📞 {appt.clientPhone}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions Panel */}
                          <div className="flex items-center gap-2 self-end md:self-center shrink-0" id={`appt-actions-${appt.id}`}>
                            {appt.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => onCompleteAppointment(appt.id)}
                                  className="bg-[#8FAE7B] hover:bg-[#7a9a67] text-white p-2 rounded-full transition-colors flex items-center justify-center shadow-xs"
                                  title="Complete appointment"
                                  id={`btn-complete-${appt.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onCancelAppointment(appt.id)}
                                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-600 p-2 rounded-full transition-colors flex items-center justify-center shadow-xs"
                                  title="Cancel appointment"
                                  id={`btn-cancel-${appt.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => onDeleteAppointment(appt.id)}
                              className="text-[#A08694] hover:text-[#E08A72] p-2 rounded-full transition-colors"
                              title="Delete permanently"
                              id={`btn-delete-${appt.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
