import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSettings, Service } from '../types';
import EyebrowArch from './EyebrowArch';
import { X, User, Shield, HelpCircle, Save, Plus, Trash2, Scissors, Sparkles, Clock, Calendar } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: SettingsModalProps) {
  const [userName, setUserName] = useState(settings.userName);
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [defaultCycleWeeks, setDefaultCycleWeeks] = useState(settings.defaultCycleWeeks);
  const [services, setServices] = useState<Service[]>(settings.services);

  // New Service form state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServiceCycle, setNewServiceCycle] = useState('3');

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;

    const newService: Service = {
      id: `s_custom_${Date.now()}`,
      name: newServiceName,
      price: parseFloat(newServicePrice) || 0,
      duration: parseInt(newServiceDuration) || 60,
      defaultCycleWeeks: parseInt(newServiceCycle) || 3,
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('60');
    setNewServiceCycle('3');
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    onSaveSettings({
      userName,
      businessName,
      defaultCycleWeeks,
      services,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#3A2733]/65 flex items-center justify-center p-4 z-50 animate-fade-in" id="settings-modal-overlay">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#FBF6F2] rounded-2xl max-w-2xl w-full border border-[#D8C4BC] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            id="settings-modal-card"
          >
            {/* Header */}
            <div className="bg-[#3A2733] p-5 text-[#FBF6F2] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EFDCD3]" />
                <h3 className="font-serif italic text-xl text-white">PRO Studio Settings</h3>
              </div>
              <button
                onClick={onClose}
                className="text-[#FBF6F2]/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                id="close-settings-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
              
              {/* Profile Config Section */}
              <div className="space-y-4 border-b border-[#D8C4BC]/40 pb-5" id="settings-profile-section">
                <h4 className="font-serif italic text-base text-[#3A2733]">My Studio Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                      Your Professional Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733]"
                      id="settings-input-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                      Studio or Business Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-white border border-[#D8C4BC] rounded-lg px-3.5 py-2 text-sm text-[#3A2733]"
                      id="settings-input-business"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans uppercase tracking-wider text-[11px] text-[#A08694] block font-bold">
                    Default Rebooking Interval
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={defaultCycleWeeks}
                      onChange={(e) => setDefaultCycleWeeks(parseInt(e.target.value) || 3)}
                      className="w-20 bg-white border border-[#D8C4BC] rounded-lg px-3 py-1.5 text-sm text-[#3A2733] text-center"
                      id="settings-input-cycle"
                    />
                    <span className="text-xs text-[#A08694]">Weeks (used for new client defaults)</span>
                  </div>
                </div>
              </div>

              {/* Service Menu Section */}
              <div className="space-y-4" id="settings-services-section">
                <h4 className="font-serif italic text-base text-[#3A2733] flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#B84577]" />
                  <span>Interactive Service Menu</span>
                </h4>

                {/* List of active services */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto border border-[#D8C4BC]/60 rounded-xl p-3 bg-white/40" id="settings-services-list">
                  {services.length === 0 ? (
                    <p className="text-xs text-[#A08694] italic text-center py-4">No services in menu. Add one below!</p>
                  ) : (
                    services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white border border-[#D8C4BC]/40 rounded-lg p-2.5 flex justify-between items-center text-xs gap-3"
                        id={`settings-service-item-${service.id}`}
                      >
                        <div className="min-w-0">
                          <p className="font-sans font-bold text-[#3A2733] truncate">{service.name}</p>
                          <div className="flex gap-2 text-[#A08694] mt-0.5 text-[10px]">
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {service.duration} mins</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {service.defaultCycleWeeks}w cycle</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-serif font-bold text-sm text-[#B84577]">${service.price}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-[#A08694] hover:text-[#E08A72] p-1 rounded-full transition-colors"
                            title="Delete service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Service quick sub-form */}
                <form onSubmit={handleAddService} className="bg-[#EFDCD3]/50 border border-[#D8C4BC] rounded-xl p-4.5 space-y-3" id="add-service-subform">
                  <span className="font-sans uppercase tracking-wider text-[10px] text-[#3A2733] block font-bold">
                    + Add Custom Service to Menu
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Lash Touch-Up"
                      required
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="md:col-span-2 bg-white border border-[#D8C4BC] rounded-lg px-2.5 py-1.5 text-xs text-[#3A2733]"
                      id="new-service-name"
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      required
                      min="1"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="bg-white border border-[#D8C4BC] rounded-lg px-2.5 py-1.5 text-xs text-[#3A2733]"
                      id="new-service-price"
                    />
                    
                    <div className="flex gap-2">
                      <select
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className="w-1/2 bg-white border border-[#D8C4BC] rounded-lg px-2 py-1.5 text-xs text-[#3A2733]"
                        id="new-service-duration"
                      >
                        <option value="30">30m</option>
                        <option value="45">45m</option>
                        <option value="60">1h</option>
                        <option value="75">1h 15</option>
                        <option value="90">1.5h</option>
                        <option value="120">2h</option>
                      </select>

                      <select
                        value={newServiceCycle}
                        onChange={(e) => setNewServiceCycle(e.target.value)}
                        className="w-1/2 bg-white border border-[#D8C4BC] rounded-lg px-2 py-1.5 text-xs text-[#3A2733]"
                        id="new-service-cycle"
                      >
                        <option value="2">2w</option>
                        <option value="3">3w</option>
                        <option value="4">4w</option>
                        <option value="5">5w</option>
                        <option value="6">6w</option>
                        <option value="8">8w</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#B84577]/10 text-[#B84577] border border-[#B84577]/20 hover:bg-[#B84577] hover:text-white text-xs font-sans uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors font-bold"
                      id="save-new-service-btn"
                    >
                      Add to Menu
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#EFDCD3]/60 p-4 border-t border-[#D8C4BC] flex justify-between items-center shrink-0">
              <span className="font-sans text-[10px] text-[#A08694] italic">
                Changes persist instantly in LocalStorage.
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-sans uppercase tracking-wider text-[#A08694] hover:text-[#3A2733] font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-[#B84577] hover:bg-[#a13b68] text-white px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-semibold shadow-md flex items-center gap-1.5"
                  id="settings-save-btn"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
