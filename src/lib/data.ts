import type { Worker, AttendanceRecord, ProductionEntry, SalaryDetails, AdvancePayment, Bonus, ChatMessage, Notification } from './types';

// This file contains placeholder data. In a real application, this data would
// be fetched from a database like Firestore.

export const workers: Worker[] = [
  { id: 'WRK-001', name: 'Ayesha Khan', photoUrl: 'https://picsum.photos/seed/101/200/200', designation: 'Operator', department: 'Sewing', joinDate: '2022-01-15', basicSalary: 18000, contact: '+8801712345678', photo: 'https://picsum.photos/seed/101/200/200' },
  { id: 'WRK-002', name: 'Rahim Sheikh', photoUrl: 'https://picsum.photos/seed/102/200/200', designation: 'Supervisor', department: 'Sewing', joinDate: '2020-03-10', basicSalary: 25000, contact: '+8801812345679', photo: 'https://picsum.photos/seed/102/200/200' },
  { id: 'WRK-003', name: 'Fatima Begum', photoUrl: 'https://picsum.photos/seed/103/200/200', designation: 'Cutter', department: 'Cutting', joinDate: '2021-07-22', basicSalary: 20000, contact: '+8801912345680', photo: 'https://picsum.photos/seed/103/200/200' },
  { id: 'WRK-004', name: 'Jamal Uddin', photoUrl: 'https://picsum.photos/seed/104/200/200', designation: 'Manager', department: 'Finishing', joinDate: '2019-11-05', basicSalary: 45000, contact: '+8801612345681', photo: 'https://picsum.photos/seed/104/200/200' },
  { id: 'WRK-005', name: 'Sultana Ahmed', photoUrl: 'https://picsum.photos/seed/105/200/200', designation: 'Helper', department: 'Packing', joinDate: '2023-02-28', basicSalary: 15000, contact: '+8801512345682', photo: 'https://picsum.photos/seed/105/200/200' },
  { id: 'WRK-006', name: 'Kamal Hasan', photoUrl: 'https://picsum.photos/seed/106/200/200', designation: 'Operator', department: 'Sewing', joinDate: '2022-05-18', basicSalary: 18500, contact: '+8801312345683', photo: 'https://picsum.photos/seed/106/200/200' },
];

export const productionEntries: ProductionEntry[] = [];

export const salaryDetails: SalaryDetails[] = [];

export const advancePayments: AdvancePayment[] = [];

export const bonuses: Bonus[] = [];

export const notifications: Notification[] = [];

export const chatMessages: Record<string, ChatMessage[]> = {}
