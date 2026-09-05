import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Appointment, Service } from '../types';
import EyebrowArch from './EyebrowArch';
import { Search, Plus, Calendar, Edit, Trash2, Phone, Sparkles, Filter, X } from 'lucide-react';

interface RebookingViewProps {
  clients: Client[];
  appointments: Appointment[];
  services: Service[];
  onQuickBook: (client: Client) => void;
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function RebookingView({
  clients,
  appointments,
  services,
  onQuickBook,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}: RebookingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'on_track'>('all');
  
  // Client Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [typicalServiceId, setTypicalServiceId] = useState(services[0]?.id || '');
  const [cycleWeeks, setCycleWeeks] = useState(3);

  const TODAY_STR = '2026-07-17';

  // Helper to calculate status of a client
  const getClientRebookingStatus = (client: Client) => {
    // Find all active appointments for this client
    const clientAppts = appointments.filter(
      (app) => app.clientName.toLowerCase() === client.name.toLowerCase() && app.status !== 'cancelled'
    );

    // If they have any scheduled appointment in the future (relative to TODAY_STR), they are safe and "On Track"
    const hasFutureAppt = clientAppts.some((app) => app.date >= TODAY_STR && app.status === 'scheduled');
    if (hasFutureAppt) {
      return { status: 'on_track' as const, label: 'Booked • On Track', daysDelta: 0, lastDate: 'Future scheduled' };
    }

    if (clientAppts.length === 0) {
      // No past appointments, treat as due_soon / needs initial booking
      return { status: 'due_soon' as const, label: 'Needs Initial Booking', daysDelta: 0, lastDate: 'Never' };
    }

    // Find the latest completed or past appointment
    const completedOrPastAppts = clientAppts.filter((app) => app.date <= TODAY_STR);
    if (completedOrPastAppts.length === 0) {
      return { status: 'due_soon' as const, label: 'Needs Booking', daysDelta: 0, lastDate: 'Never' };
    }

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
      return {
        status: 'overdue' as const,
        label: `${daysSince - cycleDays}d Overdue`,
        daysDelta: daysSince - cycleDays,
        lastDate: latestAppt.date,
      };
    } else if (daysSince >= cycleDays - 3) {
      return {
        status: 'due_soon' as const,
        label: 'Due Soon',
        daysDelta: 0,
        lastDate: latestAppt.date,
      };
    } else {
      return {
        status: 'on_track' as const,
        label: 'On Track',
        daysDelta: cycleDays - daysSince,
        lastDate: latestAppt.date,
      };
    }
  };

  const handleOpenAddForm = () => {
    setEditingClient(null);
    setClientName('');
    setClientPhone('');
    setTypicalServiceId(services[0]?.id || '');
    setCycleWeeks(3);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (client: Client) => {
    setEditingClient(client);
    setClientName(client.name);
    setClientPhone(client.phone || '');
    setTypicalServiceId(client.typicalServiceId);
    setCycleWeeks(client.cycleWeeks);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: clientName,
        phone: clientPhone,
        typicalServiceId,
        cycleWeeks,
      });
    } else {
      onAddClient({
        name: clientName,
        phone: clientPhone,
        typicalServiceId,
        cycleWeeks,
      });
    }
    setIsFormOpen(false);
  };

  // Compile client statuses
  const clientsWithStatus = clients.map((client) => {
    const statusData = getClientRebookingStatus(client);
    return {
      client,
      service: services.find((s) => s.id === client.typicalServiceId),
      ...statusData,
    };
  });

  // Filter clients
  const filteredClients = clientsWithStatus.filter((item) => {
    const matchesSearch =
      item.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.service?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.client.phone && item.client.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count quick stats
  const countOverdue = clientsWithStatus.filter((c) => c.status === 'overdue').length;
  const countDueSoon = clientsWithStatus.filter((c) => c.status === 'due_soon').length;
  const countOnTrack = clientsWithStatus.filter((c) => c.status === 'on_track').length;

  return (
    <div className="space-y-6" id="rebooking-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="rebooking-header">
        <div>
          <span className="font-sans uppercase tracking-widest text-[11px] text-[#A08694] block">
            Retention Optimizer
          </span>
          <h2 className="font-serif text-2xl text-[#3A2733]" id="rebooking-title">
            Rebooking Board
          </h2>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="bg-[#B84577] text-white font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#a13b68] transition-colors flex items-center gap-1.5 font-medium shadow-xs"
          id="rebooking-add-client-btn"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <EyebrowArch id="rebooking-divider" />

      {/* Quick Status Stats Card Grid */}
      <div className="grid grid-cols-3 gap-3" id="rebooking-stats-grid">
        <div
          onClick={() => setStatusFilter('overdue')}
          className={`cursor-pointer rounded-2xl p-3 border text-center transition-all ${
            statusFilter === 'overdue' ? 'ring-2 ring-[#E08A72] bg-[#E08A72]/10 border-[#E08A72]' : 'bg-white border-[#D8C4BC]/60 hover:bg-[#F6EBE5]'
          }`}
          id="stat-box-overdue"
        >
          <span className="font-sans text-[10px] uppercase tracking-wider text-[#A08694] block">Overdue</span>
          <span className="font-serif text-xl font-bold block mt-1" style={{ color: '#E08A72' }}>
            {countOverdue}
          </span>
        </div>
        <div
          onClick={() => setStatusFilter('due_soon')}
          className={`cursor-pointer rounded-2xl p-3 border text-center transition-all ${
            statusFilter === 'due_soon' ? 'ring-2 ring-[#B84577] bg-[#B84577]/10 border-[#B84577]' : 'bg-white border-[#D8C4BC]/60 hover:bg-[#F6EBE5]'
          }`}
          id="stat-box-due-soon"
        >
          <span className="font-sans text-[10px] uppercase tracking-wider text-[#A08694] block">Due Soon</span>
          <span className="font-serif text-xl font-bold block mt-1" style={{ color: '#B84577' }}>
            {countDueSoon}
          </span>
        </div>
        <div
          onClick={() => setStatusFilter('on_track')}
          className={`cursor-pointer rounded-2xl p-3 border text-center transition-all ${
            statusFilter === 'on_track' ? 'ring-2 ring-[#8FAE7B] bg-[#8FAE7B]/10 border-[#8FAE7B]' : 'bg-white border-[#D8C4BC]/60 hover:bg-[#F6EBE5]'
          }`}
          id="stat-box-on-track"
        >
          <span className="font-sans text-[10px] uppercase tracking-wider text-[#A08694] block">On Track</span>
          <span className="font-serif text-xl font-bold block mt-1" style={{ color: '#8FAE7B' }}>
            {countOnTrack}
          </span>
        </div>
      </div>

      {/* Control bar: search & category reset */}
      <div className="flex flex-col md:flex-row gap-3" id="rebooking-control-bar">
        {/* Search Input */}
        <div className="relative flex-1" id="rebooking-search-input-container">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08694]" />
          <input
            type="text"
            placeholder="Search clients or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#D8C4BC] rounded-full pl-10 pr-4 py-2 text-sm text-[#3A2733] placeholder-[#A08694] focus:outline-hidden focus:ring-1 focus:ring-[#B84577] focus:border-[#B84577] transition-all"
            id="rebooking-search-field"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A08694] hover:text-[#3A2733]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear Filters indicator */}
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="bg-[#EFDCD3] border border-[#D8C4BC] text-[#3A2733] px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-semibold hover:bg-[#FBF6F2] transition-colors flex items-center justify-center gap-1.5 self-start md:self-auto"
            id="clear-filter-btn"
          >
            Clear Filter: {statusFilter.replace('_', ' ')} <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Clients list */}
      <div className="space-y-3" id="rebooking-clients-list">
        {filteredClients.length === 0 ? (
          <div className="bg-[#F6EBE5] border border-[#D8C4BC] rounded-2xl p-10 text-center space-y-4" id="rebooking-empty-state">
            <EyebrowArch className="mx-auto" />
            <p className="font-serif italic text-base text-[#3A2733]" id="rebooking-empty-text">
              "Building beautiful client bonds is the heartbeat of your studio."
            </p>
            <p className="font-sans text-xs text-[#A08694] max-w-sm mx-auto">
              No clients found matching current parameters. Let's register a new client profile!
            </p>
            <button
              onClick={handleOpenAddForm}
              className="bg-[#B84577] text-white font-sans text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#a13b68] transition-colors"
              id="empty-add-client-btn"
            >
              Add Client Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="rebooking-grid">
            <AnimatePresence mode="popLayout">
              {filteredClients.map(({ client, service, status, label, lastDate }) => {
                const getStatusColor = () => {
                  switch (status) {
                    case 'overdue':
                      return '#E08A72'; // coral
                    case 'due_soon':
                      return '#B84577'; // orchid
                    case 'on_track':
                    default:
                      return '#8FAE7B'; // sage
                  }
                };

                return (
                  <motion.div
                    key={client.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-[#D8C4BC] rounded-2xl p-4.5 flex flex-col justify-between gap-4 shadow-xs"
                    id={`client-card-${client.id}`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#3A2733]" id={`client-name-${client.id}`}>
                            {client.name}
                          </h4>
                          {client.phone && (
                            <a
                              href={`tel:${client.phone}`}
                              className="font-sans text-xs text-[#A08694] hover:text-[#B84577] flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 text-[#B84577]" />
                              <span>{client.phone}</span>
                            </a>
                          )}
                        </div>

                        {/* Status Capsule */}
                        <span
                          className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans font-bold text-white shadow-xs shrink-0"
                          style={{ backgroundColor: getStatusColor() }}
                          id={`client-status-${client.id}`}
                        >
                          {label}
                        </span>
                      </div>

                      <div className="bg-[#FBF6F2] border border-[#D8C4BC]/40 rounded-xl p-2.5 text-xs text-[#3A2733] space-y-1">
                        <p className="flex justify-between">
                          <span className="text-[#A08694] font-sans uppercase text-[9px] tracking-wider">Pref Service</span>
                          <span className="font-medium text-[#3A2733] truncate max-w-[150px]">{service?.name || 'Custom'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#A08694] font-sans uppercase text-[9px] tracking-wider">Default Cycle</span>
                          <span className="font-semibold">{client.cycleWeeks} weeks</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#A08694] font-sans uppercase text-[9px] tracking-wider">Last Appointment</span>
                          <span className="font-medium">{lastDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center border-t border-[#D8C4BC]/30 pt-3 mt-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditForm(client)}
                          className="p-1.5 hover:bg-[#F6EBE5] text-[#A08694] hover:text-[#3A2733] rounded-full transition-colors border border-[#D8C4BC]/40"
                          title="Edit client preferences"
                          id={`btn-edit-client-${client.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteClient(client.id)}
                          className="p-1.5 hover:bg-[#E08A72]/10 text-[#A08694] hover:text-[#E08A72] rounded-full transition-colors border border-transparent"
                          title="Remove client"
                          id={`btn-delete-client-${client.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onQuickBook(client)}
                        className="bg-[#B84577] text-white hover:bg-[#a13b68] transition-colors text-xs font-sans uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-semibold"
                        id={`btn-rebook-${client.id}`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Book Again
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add / Edit Client Sub-Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-[#3A2733]/65 flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FBF6F2] rounded-2xl max-w-md w-full border border-[#D8C4BC] overflow-hidden shadow-xl"
              id="client-form-modal"
            >
              <div className="bg-[#3A2733] p-4 text-[#FBF6F2] flex justify-between items-center">
                <h3 className="font-serif italic text-lg text-white">
                  {editingClient ? 'Edit Client Profile' : 'Add New Client'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-[#FBF6F2]/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-semibold">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Lauren Connor"
                    className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733]"
                    id="input-client-name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-semibold">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. 555-0122"
                    className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733]"
                    id="input-client-phone"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-semibold">
                      Typical Service
                    </label>
                    <select
                      value={typicalServiceId}
                      onChange={(e) => setTypicalServiceId(e.target.value)}
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733]"
                      id="input-client-service"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (${s.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-semibold">
                      Cycle Weeks
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="24"
                        required
                        value={cycleWeeks}
                        onChange={(e) => setCycleWeeks(parseInt(e.target.value) || 3)}
                        className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733] text-center"
                        id="input-client-cycle"
                      />
                      <span className="text-xs text-[#A08694] font-sans shrink-0">Wks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8C4BC]/40 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-sans uppercase tracking-wider text-[#A08694] hover:text-[#3A2733] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#B84577] hover:bg-[#a13b68] text-white px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-semibold shadow-xs"
                    id="submit-client-btn"
                  >
                    {editingClient ? 'Save Changes' : 'Add Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
