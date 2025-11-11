export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  label?: string;
};

export type Worker = {
  id: string;
  name: string;
  photoUrl: string;
  photo?: string;
  designation: string;
  department: string;
  joinDate: string;
  basicSalary: number;
  contact: string;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'On Leave';

export type AttendanceRecord = {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  status: AttendanceStatus;
};

export type ProductionEntry = {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  pieceCount: number;
  overtimeHours: number;
};

export type SalaryDetails = {
  id: string;
  workerId: string;
  workerName: string;
  month: string;
  basicSalary: number;
  productionPay: number;
  overtimePay: number;
  bonus: number;
  advanceDeduction: number;
  absenceDeduction: number;
  netSalary: number;
};

export type AdvancePayment = {
  id: string;
  workerId: string;
  workerName?: string; // Made optional as it might not be needed for worker view
  date: string;
  amount: number;
  deducted: boolean;
};

export type Bonus = {
  id: string;
  workerId: string;
  workerName?: string; // Made optional as it might not be needed for worker view
  date: string;
  amount: number;
  type: string;
};

export type ChatMessage = {
    id: string;
    text: string;
    senderId: string;
    timestamp: any; // Firestore ServerTimestamp or Date
    isRead: boolean;
};

export type Category = {
  id: string;
  name: string;
  rate: number;
  imageUrl?: string;
};


export type AppSettings = {
    productionCategories: Category[];
    allowWorkerProfilePictureChange: boolean;
};

export type Notification = {
    id: string;
    title: string;
    message: string;
    sentAt: string; // ISO date string
    target: 'all' | 'worker' | 'group';
    targetId?: string; // Worker ID or Group ID
}
