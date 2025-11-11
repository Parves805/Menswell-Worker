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

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'ATT-001', workerId: 'WRK-001', workerName: 'Ayesha Khan', date: '2024-07-27', status: 'Present' },
  { id: 'ATT-002', workerId: 'WRK-002', workerName: 'Rahim Sheikh', date: '2024-07-27', status: 'Present' },
  { id: 'ATT-003', workerId: 'WRK-003', workerName: 'Fatima Begum', date: '2024-07-27', status: 'Absent' },
  { id: 'ATT-004', workerId: 'WRK-004', workerName: 'Jamal Uddin', date: '2024-07-27', status: 'Late' },
  { id: 'ATT-005', workerId: 'WRK-005', workerName: 'Sultana Ahmed', date: '2024-07-27', status: 'Present' },
  { id: 'ATT-006', workerId: 'WRK-006', workerName: 'Kamal Hasan', date: '2024-07-27', status: 'On Leave' },
];

export const productionEntries: ProductionEntry[] = [
    { id: 'PROD-001', date: '2024-07-27', workerId: 'WRK-001', workerName: 'Ayesha Khan', pieceCount: 120, overtimeHours: 2 },
    { id: 'PROD-002', date: '2024-07-27', workerId: 'WRK-006', workerName: 'Kamal Hasan', pieceCount: 110, overtimeHours: 3 },
    { id: 'PROD-003', date: '2024-07-26', workerId: 'WRK-001', workerName: 'Ayesha Khan', pieceCount: 125, overtimeHours: 2.5 },
];

export const salaryDetails: SalaryDetails[] = [
  { id: 'SAL-001', workerId: 'WRK-001', workerName: 'Ayesha Khan', month: 'June 2024', basicSalary: 18000, productionPay: 2500, overtimePay: 1500, bonus: 0, advanceDeduction: 1000, absenceDeduction: 0, netSalary: 21000 },
  { id: 'SAL-002', workerId: 'WRK-002', workerName: 'Rahim Sheikh', month: 'June 2024', basicSalary: 25000, productionPay: 0, overtimePay: 2000, bonus: 1000, advanceDeduction: 0, absenceDeduction: 833, netSalary: 27167 },
  { id: 'SAL-003', workerId: 'WRK-003', workerName: 'Fatima Begum', month: 'June 2024', basicSalary: 20000, productionPay: 1800, overtimePay: 1000, bonus: 0, advanceDeduction: 2000, absenceDeduction: 0, netSalary: 20800 },
];

export const advancePayments: AdvancePayment[] = [
    { id: 'ADV-001', workerId: 'WRK-001', workerName: 'Ayesha Khan', date: '2024-06-15', amount: 1000, deducted: true },
    { id: 'ADV-002', workerId: 'WRK-003', workerName: 'Fatima Begum', date: '2024-06-20', amount: 2000, deducted: true },
    { id: 'ADV-003', workerId: 'WRK-005', workerName: 'Sultana Ahmed', date: '2024-07-10', amount: 1500, deducted: false },
];

export const bonuses: Bonus[] = [
    { id: 'BON-001', workerId: 'WRK-002', workerName: 'Rahim Sheikh', date: '2024-06-28', amount: 1000, type: 'Performance' },
    { id: 'BON-002', workerId: 'WRK-004', workerName: 'Jamal Uddin', date: '2024-04-10', amount: 5000, type: 'Festival' },
];

export const notifications: Notification[] = [
    { id: 'NOTIF-001', title: "ঈদ বোনাস ঘোষণা", message: "সকল কর্মীকে জানানো যাচ্ছে যে, আগামী ৫ জুলাই ঈদ বোনাস প্রদান করা হবে।", sentAt: "2024-07-01", target: 'all' },
    { id: 'NOTIF-002', title: "জরুরী ফ্যাক্টরি মিটিং", message: "আগামীকাল সকাল ৯টায় সকল সুপারভাইজারদের নিয়ে একটি জরুরী মিটিং অনুষ্ঠিত হবে।", sentAt: "2024-06-28", target: 'group', targetId: 'supervisors' },
];

export const chatMessages: Record<string, ChatMessage[]> = {
    'WRK-001': [
        { id: 'msg1-1', text: 'আমার জুন মাসের বেতন নিয়ে একটি প্রশ্ন ছিল।', senderId: 'WRK-001', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isRead: true },
        { id: 'msg1-2', text: 'অবশ্যই, বলুন আপনার প্রশ্নটি। আমরা দেখছি।', senderId: 'admin', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), isRead: true },
    ],
    'WRK-003': [
      { id: 'msg3-1', text: 'আমি কি একটি অগ্রিম পেমেন্টের জন্য অনুরোধ করতে পারি?', senderId: 'WRK-003', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: false },
    ],
    'WRK-005': [],
}
