// بيانات تجريبية شاملة تعمل بدون Supabase
export const mockUsers = [
  {
    id: 'u1', email: 'admin@jallatma.com', full_name: 'أحمد محمود - رئيس المجلس',
    role: 'super_admin', is_active: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      finance: { view: true, create: true, edit: true, delete: true },
      banks: { view: true, create: true, edit: true, delete: true },
      activities: { view: true, create: true, edit: true, delete: true },
      setup: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: false, delete: false },
      audit_log: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'u2', email: 'accountant@jallatma.com', full_name: 'سارة عبد الله - أمينة الصندوق',
    role: 'admin', is_active: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      finance: { view: true, create: true, edit: true, delete: false },
      banks: { view: true, create: false, edit: false, delete: false },
      activities: { view: true, create: true, edit: true, delete: false },
      setup: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: true, edit: false, delete: false },
      audit_log: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'u3', email: 'member@jallatma.com', full_name: 'محمد حسن - عضو مجلس',
    role: 'member', is_active: true,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      finance: { view: false, create: false, edit: false, delete: false },
      banks: { view: true, create: false, edit: false, delete: false },
      activities: { view: true, create: false, edit: false, delete: false },
      setup: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      audit_log: { view: false, create: false, edit: false, delete: false },
    },
  },
];

export const mockBanks = [
  { id: 'b1', bank_name: 'البنك الأهلي المصري', account_number: '1234567890', opening_balance: 85000, is_active: true },
  { id: 'b2', bank_name: 'بنك مصر', account_number: '9876543210', opening_balance: 42000, is_active: true },
];

export const mockCategories = [
  { id: 'c1', name: 'اشتراكات العضوية', type: 'income' },
  { id: 'c2', name: 'إيجار الملاعب', type: 'income' },
  { id: 'c3', name: 'دعم وزارة الشباب', type: 'income' },
  { id: 'c4', name: 'تبرعات', type: 'income' },
  { id: 'c5', name: 'رحلات وأنشطة', type: 'income' },
  { id: 'e1', name: 'صيانة ومرافق', type: 'expense' },
  { id: 'e2', name: 'أدوات رياضية', type: 'expense' },
  { id: 'e3', name: 'مكافآت وبدلات', type: 'expense' },
  { id: 'e4', name: 'مصروفات أنشطة', type: 'expense' },
  { id: 'e5', name: 'نثريات وإداريات', type: 'expense' },
  { id: 'a1', name: 'رياضي', type: 'activity' },
  { id: 'a2', name: 'ثقافي', type: 'activity' },
  { id: 'a3', name: 'اجتماعي', type: 'activity' },
  { id: 'a4', name: 'فني', type: 'activity' },
  { id: 'a5', name: 'تنمية موارد', type: 'activity' },
];

export const mockActivities = [
  { id: 'act1', name: 'دورة كرة القدم الرمضانية', category: 'رياضي', activity_date: '2024-11-15', responsible_person: 'محمد حسن', beneficiaries_count: 120, status: 'completed', description: 'دورة رياضية بين فرق المركز', documentation_url: '' },
  { id: 'act2', name: 'ندوة التوعية الصحية', category: 'ثقافي', activity_date: '2024-12-05', responsible_person: 'سارة عبد الله', beneficiaries_count: 60, status: 'ongoing', description: 'ندوة توعوية للشباب', documentation_url: '' },
  { id: 'act3', name: 'معرض الفنون اليدوية', category: 'فني', activity_date: '2025-01-20', responsible_person: 'أحمد محمود', beneficiaries_count: 45, status: 'planned', description: 'معرض للمنتجات اليدوية', documentation_url: '' },
];

export const mockTransactions = [
  { id: 't1', transaction_date: '2024-11-01', type: 'income', category_id: 'c1', bank_account_id: 'b1', amount: 15000, receipt_number: 'R-1001', notes: 'اشتراكات شهر نوفمبر', activity_id: null },
  { id: 't2', transaction_date: '2024-11-10', type: 'expense', category_id: 'e1', bank_account_id: 'b1', amount: 3500, receipt_number: 'E-2001', notes: 'صيانة الملاعب', activity_id: null },
  { id: 't3', transaction_date: '2024-11-15', type: 'income', category_id: 'c2', bank_account_id: 'b2', amount: 8000, receipt_number: 'R-1002', notes: 'إيجار الملعب', activity_id: 'act1' },
  { id: 't4', transaction_date: '2024-11-16', type: 'expense', category_id: 'e4', bank_account_id: 'b2', amount: 4200, receipt_number: 'E-2002', notes: 'مصروفات الدورة الرمضانية', activity_id: 'act1' },
  { id: 't5', transaction_date: '2024-12-01', type: 'income', category_id: 'c3', bank_account_id: 'b1', amount: 25000, receipt_number: 'R-1003', notes: 'دعم الوزارة', activity_id: null },
  { id: 't6', transaction_date: '2024-12-05', type: 'expense', category_id: 'e3', bank_account_id: 'b1', amount: 6000, receipt_number: 'E-2003', notes: 'مكافآت المدربين', activity_id: 'act2' },
  { id: 't7', transaction_date: '2024-12-10', type: 'transfer', category_id: null, bank_account_id: 'b1', to_bank_account_id: 'b2', amount: 5000, receipt_number: 'TR-001', notes: 'تحويل لدعم حساب بنك مصر', activity_id: null },
  { id: 't8', transaction_date: '2024-12-15', type: 'income', category_id: 'c4', bank_account_id: 'b2', amount: 10000, receipt_number: 'R-1004', notes: 'تبرع من رجل أعمال', activity_id: null },
];

export const mockAuditLogs = [
  { id: 'al1', user_email: 'admin@jallatma.com', action: 'INSERT', table_name: 'transactions', record_id: 't1', created_at: '2024-11-01T10:30:00Z', details: { amount: 15000, type: 'income' } },
  { id: 'al2', user_email: 'accountant@jallatma.com', action: 'UPDATE', table_name: 'transactions', record_id: 't2', created_at: '2024-11-10T14:15:00Z', details: { old_amount: 3000, new_amount: 3500 } },
  { id: 'al3', user_email: 'admin@jallatma.com', action: 'DELETE', table_name: 'transactions', record_id: 't9', created_at: '2024-11-12T09:00:00Z', details: { amount: 500 } },
];