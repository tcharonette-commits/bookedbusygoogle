import { Service, Client, Appointment, Expense, UserSettings } from '../types';

export const DEFAULT_SERVICES: Service[] = [
  { id: 's1', name: 'Lash Full Set (Classic)', price: 120, duration: 90, defaultCycleWeeks: 4 },
  { id: 's2', name: 'Lash Fill (Classic 2wk)', price: 65, duration: 60, defaultCycleWeeks: 2 },
  { id: 's3', name: 'Lash Fill (Classic 3wk)', price: 75, duration: 75, defaultCycleWeeks: 3 },
  { id: 's4', name: 'Lash Full Set (Volume)', price: 150, duration: 105, defaultCycleWeeks: 4 },
  { id: 's5', name: 'Lash Fill (Volume 2wk)', price: 80, duration: 75, defaultCycleWeeks: 2 },
  { id: 's6', name: 'Brow Lamination & Tint', price: 80, duration: 45, defaultCycleWeeks: 6 },
  { id: 's7', name: 'Lash Lift & Tint', price: 90, duration: 60, defaultCycleWeeks: 8 },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: 'c1', name: 'Chloe Miller', phone: '555-0122', typicalServiceId: 's1', cycleWeeks: 4 },
  { id: 'c2', name: 'Sophia Garcia', phone: '555-0143', typicalServiceId: 's6', cycleWeeks: 6 },
  { id: 'c3', name: 'Emma Davis', phone: '555-0199', typicalServiceId: 's2', cycleWeeks: 2 },
  { id: 'c4', name: 'Olivia Wilson', phone: '555-0188', typicalServiceId: 's2', cycleWeeks: 2 },
  { id: 'c5', name: 'Mia Martinez', phone: '555-0177', typicalServiceId: 's6', cycleWeeks: 6 },
  { id: 'c6', name: 'Ava Johnson', phone: '555-0155', typicalServiceId: 's4', cycleWeeks: 4 },
  { id: 'c7', name: 'Lily Carter', phone: '555-0111', typicalServiceId: 's2', cycleWeeks: 2 },
  { id: 'c8', name: 'Grace Taylor', phone: '555-0166', typicalServiceId: 's7', cycleWeeks: 8 },
  { id: 'c9', name: 'Isabella Thomas', phone: '555-0133', typicalServiceId: 's6', cycleWeeks: 6 },
];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  // Today's appointments (July 17, 2026)
  {
    id: 'a1',
    clientName: 'Chloe Miller',
    clientPhone: '555-0122',
    serviceId: 's1',
    date: '2026-07-17',
    time: '09:00',
    price: 120,
    duration: 90,
    status: 'scheduled',
  },
  {
    id: 'a2',
    clientName: 'Sophia Garcia',
    clientPhone: '555-0143',
    serviceId: 's6',
    date: '2026-07-17',
    time: '11:30',
    price: 80,
    duration: 45,
    status: 'completed', // Starts completed so we have immediate earnings
  },
  {
    id: 'a3',
    clientName: 'Emma Davis',
    clientPhone: '555-0199',
    serviceId: 's2',
    date: '2026-07-17',
    time: '14:00',
    price: 65,
    duration: 60,
    status: 'scheduled',
  },
  // Yesterday's appointments (July 16, 2026)
  {
    id: 'a4',
    clientName: 'Olivia Wilson',
    clientPhone: '555-0188',
    serviceId: 's2',
    date: '2026-07-16',
    time: '10:00',
    price: 65,
    duration: 60,
    status: 'completed',
  },
  {
    id: 'a5',
    clientName: 'Mia Martinez',
    clientPhone: '555-0177',
    serviceId: 's6',
    date: '2026-07-16',
    time: '13:00',
    price: 80,
    duration: 45,
    status: 'completed',
  },
  // Earlier in July (so earnings look substantial and realistic)
  {
    id: 'a6',
    clientName: 'Chloe Miller',
    clientPhone: '555-0122',
    serviceId: 's2',
    date: '2026-07-03',
    time: '11:00',
    price: 65,
    duration: 60,
    status: 'completed',
  },
  {
    id: 'a7',
    clientName: 'Ava Johnson',
    clientPhone: '555-0155',
    serviceId: 's4',
    date: '2026-07-05',
    time: '15:00',
    price: 150,
    duration: 105,
    status: 'completed',
  },
  {
    id: 'a8',
    clientName: 'Isabella Thomas',
    clientPhone: '555-0133',
    serviceId: 's6',
    date: '2026-07-14',
    time: '09:30',
    price: 80,
    duration: 45,
    status: 'completed',
  },
  {
    id: 'a9',
    clientName: 'Grace Taylor',
    clientPhone: '555-0166',
    serviceId: 's7',
    date: '2026-07-01',
    time: '14:00',
    price: 90,
    duration: 60,
    status: 'completed',
  },
  // Overdue client's last session (June 20, 2026)
  {
    id: 'a10',
    clientName: 'Lily Carter',
    clientPhone: '555-0111',
    serviceId: 's2',
    date: '2026-06-20',
    time: '10:00',
    price: 65,
    duration: 60,
    status: 'completed',
  },
  // Future appointments (July 22, 2026)
  {
    id: 'a11',
    clientName: 'Ava Johnson',
    clientPhone: '555-0155',
    serviceId: 's4',
    date: '2026-07-22',
    time: '11:00',
    price: 150,
    duration: 105,
    status: 'scheduled',
  },
];

export const DEFAULT_EXPENSES: Expense[] = [
  { id: 'e1', date: '2026-07-01', amount: 300, category: 'rent', notes: 'Weekly chair/booth rent' },
  { id: 'e2', date: '2026-07-02', amount: 145, category: 'supplies', notes: 'Lash glue, premium silk lashes & gel patches' },
  { id: 'e3', date: '2026-07-10', amount: 45, category: 'marketing', notes: 'Instagram local ad campaign' },
  { id: 'e4', date: '2026-07-15', amount: 85, category: 'education', notes: 'Masterclass: Russian Volume styling' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Sasha Beau',
  businessName: 'Silk & Arch Studio',
  services: DEFAULT_SERVICES,
  defaultCycleWeeks: 3,
};
