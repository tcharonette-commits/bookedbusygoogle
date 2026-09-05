/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  defaultCycleWeeks: number;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  typicalServiceId: string;
  cycleWeeks: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  checkedIn?: boolean;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: 'supplies' | 'rent' | 'education' | 'marketing';
  notes?: string;
}

export interface UserSettings {
  userName: string;
  businessName: string;
  services: Service[];
  defaultCycleWeeks: number;
}
