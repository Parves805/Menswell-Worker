




export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  label?: string;
  badge?: number;
};

export type Worker = {
  id: string;
  name: string;
  photoUrl: string;
  photo?: string;
  designation: string;
  department: string;
  joinDate: string;
  contact: string;
  email: string;
  status: 'active' | 'blocked';
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
  date: string; // ISO String
  workerId: string;
  workerName: string;
  pieceCount: number;
  rate: number;
  total: number;
  categoryName: string;
  categoryId: string;
  categoryImageUrl?: string;
};


export type ProductionEntryRequest = {
  id: string;
  workerId: string;
  workerName: string;
  categoryId: string;
  categoryName: string;
  date: string;
  pieceCount: number;
  rate: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
};

export type AdvancePaymentRequest = {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  description?: string;
};


export type SalaryDetails = {
  id: string;
  workerId: string;
  workerName: string;
  month: string;
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
  workerName?: string;
  date: string;
  amount: number;
  isDeducted?: boolean;
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

export type Expense = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export type WorkerExpense = {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  description: string;
  amount: number;
}


export type AppSettings = {
    id?: string;
    companyName: string;
    logoUrl: string;
    themeColor: string;
};

export type Notification = {
  id: string;
  workerId: string;
  title: string;
  message: string;
  createdAt: string; // ISO date string
  isRead: boolean;
  imageUrl?: string;
};

export type SliderImage = {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  link?: string;
  createdAt: any; // Firestore ServerTimestamp or Date
}
    

export type ActivityLog = {
    id: string;
    userId: string;
    userName: string;
    userPhotoUrl: string;
    timestamp: any; // Firestore ServerTimestamp or Date
    activityType: string;
    description: string;
}

    

    


