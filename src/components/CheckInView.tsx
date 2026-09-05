import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Service, Client } from '../types';
import { Check, Search, Sparkles, UserCheck, Coffee, RefreshCw, AlertCircle, Calendar, Plus, Phone } from 'lucide-react';
import EyebrowArch from './EyebrowArch';

interface CheckInViewProps {
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  businessName: string;
  userName: string;
  onCheckIn: (appointmentId: string) => void;
  onAddAppointment: (appt: Omit<Appointment, 'id'>, newClientPhone?: string) => void;
}

export default function CheckInView({
  appointments,
  services,
  clients,
  businessName,
  userName,
  onCheckIn,
  onAddAppointment,
}: CheckInViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');
  const [successService, setSuccessService] = useState('');
  const [successTime, setSuccessTime] = useState('');

  // Walk-In registration state
  const [isWalkInMode, setIsWalkInMode] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');

  // Filter today's appointments that are either scheduled or completed (excluding cancelled ones)
  const TODAY_STR = '2026-07-17';
  const todayAppts = appointments.filter(
    (appt) => appt.date === TODAY_STR && appt.status !== 'cancelled'
  );

  // Filtered by search query
  const filteredAppts = todayAppts.filter((appt) =>
    appt.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-clear success message after 12 seconds to reset screen for the next guest
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setTimeout(() => {
        handleReset();
      }, 12000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedAppt(null);
    setSearchQuery('');
    setSuccessName('');
    setSuccessService('');
    setSuccessTime('');
    setIsWalkInMode(false);
    setWalkInName('');
    setWalkInPhone('');
  };

  const handleConfirmCheckIn = (appt: Appointment) => {
    onCheckIn(appt.id);
    const service = services.find((s) => s.id === appt.serviceId);
    setSuccessName(appt.clientName);
    setSuccessService(service?.name || 'Custom Session');
    setSuccessTime(appt.time);
    setIsSuccess(true);
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !selectedServiceId) return;

    const service = services.find((s) => s.id === selectedServiceId);
    const now = new Date();
    // Format current local time HH:MM
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    const newAppt: Omit<Appointment, 'id'> = {
      clientName: walkInName.trim(),
      clientPhone: walkInPhone.trim() || undefined,
      serviceId: selectedServiceId,
      date: TODAY_STR,
      time: currentTimeStr,
      price: service?.price || 60,
      duration: service?.duration || 60,
      status: 'scheduled',
    };

    // Add appointment with custom checked-in status directly
    onAddAppointment(newAppt, walkInPhone.trim() || undefined);

    // Find the newly added appointment or just display success screen directly
    setSuccessName(walkInName.trim());
    setSuccessService(service?.name || 'Walk-In Session');
    setSuccessTime(currentTimeStr);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="check-in-view-container">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="checkin-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header Greeting */}
            <div className="text-center space-y-2 py-4" id="checkin-header">
              <span className="font-sans uppercase tracking-widest text-[11px] text-[#A08694] font-semibold block">
                Self-Serve Lobby Kiosk
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#3A2733]" id="checkin-title">
                Welcome to {businessName}
              </h1>
              <p className="font-sans text-sm text-[#A08694] max-w-md mx-auto">
                We are thrilled to pamper you today. Please enter your name below to let us know you've arrived.
              </p>
              <div className="pt-2">
                <EyebrowArch className="mx-auto text-[#D8C4BC]" />
              </div>
            </div>

            {/* Main Interactive Panel */}
            <div className="bg-[#EFDCD3]/50 border border-[#D8C4BC] rounded-3xl p-6 md:p-8 shadow-sm space-y-6" id="checkin-main-panel">
              
              {!isWalkInMode ? (
                // --- APPOINTMENT SEARCH MODE ---
                <div className="space-y-6" id="appointment-search-mode">
                  <div className="relative" id="search-input-wrapper">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A08694]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter your name to search..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-[#D8C4BC] text-[#3A2733] font-sans text-base placeholder-[#A08694] focus:outline-hidden focus:ring-2 focus:ring-[#B84577] focus:border-transparent transition-all shadow-inner"
                      id="checkin-search-input"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans uppercase font-bold text-[#B84577] hover:underline"
                        id="clear-search-btn"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Appointment Results */}
                  <div className="space-y-3" id="search-results">
                    <div className="flex justify-between items-center px-1">
                      <span className="font-sans text-xs uppercase tracking-wider text-[#A08694] font-semibold">
                        {searchQuery ? 'Matching Appointments' : "Today's Schedule"}
                      </span>
                      <span className="font-sans text-[11px] text-[#A08694]">
                        {filteredAppts.length} sessions
                      </span>
                    </div>

                    {filteredAppts.length === 0 ? (
                      <div className="bg-white border border-[#D8C4BC]/60 rounded-2xl p-8 text-center space-y-4" id="no-appt-found">
                        <AlertCircle className="w-8 h-8 text-[#E08A72] mx-auto opacity-70" />
                        <div className="space-y-1">
                          <p className="font-serif italic text-base text-[#3A2733]">"Could not find an appointment under '{searchQuery}'"</p>
                          <p className="font-sans text-xs text-[#A08694] max-w-sm mx-auto">
                            No worries! Double-check spelling, or if you are a walk-in, click below to join the waitlist!
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setWalkInName(searchQuery);
                            setIsWalkInMode(true);
                          }}
                          className="bg-[#B84577] text-white font-sans text-xs uppercase tracking-widest font-bold px-5 py-3 rounded-full hover:bg-[#a13b68] transition-all inline-flex items-center gap-2 shadow-xs active:scale-95"
                          id="trigger-walk-in-btn"
                        >
                          <Plus className="w-4 h-4" /> Register as a Walk-In
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1" id="checkin-results-list">
                        {filteredAppts.map((appt) => {
                          const service = services.find((s) => s.id === appt.serviceId);
                          const isCheckedIn = appt.checkedIn === true;

                          return (
                            <div
                              key={appt.id}
                              className={`bg-white border transition-all rounded-2xl p-4.5 flex justify-between items-center gap-4 ${
                                isCheckedIn 
                                  ? 'border-[#8FAE7B] bg-[#8FAE7B]/5' 
                                  : 'border-[#D8C4BC] hover:border-[#B84577]'
                              }`}
                              id={`checkin-item-${appt.id}`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-serif font-bold text-base text-[#3A2733] truncate">
                                  {appt.clientName}
                                </p>
                                <p className="font-sans text-xs text-[#A08694] mt-0.5 truncate">
                                  {service?.name || 'Custom Treatment'} • {appt.duration} minutes
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="bg-[#EFDCD3] border border-[#D8C4BC]/60 text-[#3A2733] px-2.5 py-0.5 rounded-md font-sans text-xs font-semibold">
                                    {appt.time} Today
                                  </span>
                                  {isCheckedIn && (
                                    <span className="bg-[#8FAE7B] text-white px-2 py-0.5 rounded-md font-sans text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                                      <Check className="w-3 h-3 stroke-[3]" /> Checked In
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleConfirmCheckIn(appt)}
                                disabled={isCheckedIn}
                                className={`px-5 py-3 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${
                                  isCheckedIn
                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                    : 'bg-[#B84577] text-white hover:bg-[#3A2733] hover:shadow-md active:scale-95'
                                }`}
                                id={`checkin-action-${appt.id}`}
                              >
                                {isCheckedIn ? 'Arrived' : 'Check In'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Walk In Quick Link */}
                  <div className="text-center pt-2" id="walkin-link-container">
                    <p className="font-sans text-xs text-[#A08694]">
                      Don't have an appointment?{' '}
                      <button
                        onClick={() => setIsWalkInMode(true)}
                        className="text-[#B84577] font-semibold underline hover:text-[#3A2733]"
                        id="walkin-inline-trigger"
                      >
                        Register as a Walk-In guest →
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                // --- WALK-IN REGISTRATION FORM ---
                <motion.form
                  key="walk-in-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleWalkInSubmit}
                  className="space-y-5"
                  id="walkin-form-el"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-[#D8C4BC]/40">
                    <h3 className="font-serif italic text-lg text-[#3A2733]">Walk-In Registration</h3>
                    <button
                      type="button"
                      onClick={() => setIsWalkInMode(false)}
                      className="text-xs font-sans uppercase font-bold text-[#A08694] hover:text-[#B84577]"
                      id="cancel-walkin-btn"
                    >
                      ← Back to Search
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="font-sans text-xs uppercase tracking-wider text-[#3A2733] font-bold block">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        placeholder="Elena Bloom"
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#D8C4BC] text-[#3A2733] font-sans text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B84577]"
                        id="walkin-input-name"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="font-sans text-xs uppercase tracking-wider text-[#3A2733] font-bold block">
                        Phone Number (for SMS notifications)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08694]" />
                        <input
                          type="tel"
                          value={walkInPhone}
                          onChange={(e) => setWalkInPhone(e.target.value)}
                          placeholder="(555) 019-2834"
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-[#D8C4BC] text-[#3A2733] font-sans text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B84577]"
                          id="walkin-input-phone"
                        />
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-1">
                      <label className="font-sans text-xs uppercase tracking-wider text-[#3A2733] font-bold block">
                        Select Desired Service *
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#D8C4BC] text-[#3A2733] font-sans text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B84577]"
                        id="walkin-select-service"
                      >
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} — ${service.price} ({service.duration}m)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsWalkInMode(false)}
                      className="flex-1 py-3.5 rounded-xl border border-[#D8C4BC] text-[#3A2733] font-sans text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
                      id="walkin-cancel-action"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-xl bg-[#B84577] text-white font-sans text-xs uppercase tracking-widest font-bold hover:bg-[#a13b68] shadow-xs active:scale-95 transition-all"
                      id="walkin-submit-action"
                    >
                      Confirm Walk-In
                    </button>
                  </div>
                </motion.form>
              )}

            </div>
          </motion.div>
        ) : (
          // --- CHECK-IN SUCCESS MESSAGE ---
          <motion.div
            key="checkin-success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#F6EBE5] border border-[#D8C4BC] rounded-3xl p-8 text-center space-y-6 shadow-md relative overflow-hidden"
            id="checkin-success-screen"
          >
            {/* Elegant Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
              <Sparkles className="w-80 h-80 text-[#B84577]" />
            </div>

            <div className="relative z-10 space-y-5">
              <div className="w-16 h-16 bg-[#8FAE7B] rounded-full flex items-center justify-center mx-auto text-white shadow-xs">
                <UserCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="font-sans uppercase tracking-widest text-[10px] text-[#8FAE7B] font-bold block">
                  Lobby Check-In Success
                </span>
                <h2 className="font-serif text-3xl font-semibold text-[#3A2733]">
                  You're Checked In!
                </h2>
                <h3 className="font-serif italic text-xl text-[#B84577] pt-1">
                  Hello, {successName}.
                </h3>
              </div>

              <div className="max-w-md mx-auto bg-white/70 border border-[#D8C4BC]/50 rounded-2xl p-5 space-y-2 text-left shadow-xs">
                <p className="font-sans text-xs text-[#A08694] uppercase tracking-wider font-bold">
                  Your Treatment Details
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-serif font-semibold text-base text-[#3A2733]">
                    {successService}
                  </span>
                  <span className="bg-[#3A2733] text-white px-3 py-1 rounded-md font-sans text-xs font-semibold">
                    {successTime}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#A08694] mt-1 italic">
                  Elena Bloom has been notified of your arrival.
                </p>
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-sans text-[#A08694] max-w-sm mx-auto">
                  <Coffee className="w-4 h-4 text-[#B84577]" />
                  <span>Please have a seat. Warm tea & infused cucumber water are available in the lobby.</span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="bg-[#3A2733] text-[#FBF6F2] font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full hover:bg-[#B84577] transition-all cursor-pointer shadow-xs active:scale-95"
                    id="return-to-kiosk-btn"
                  >
                    Return to Kiosk
                  </button>
                  <p className="text-[10px] font-sans text-[#A08694]/70 mt-2.5 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#B84577]" />
                    <span>Automatically resetting for next guest in a few seconds...</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
