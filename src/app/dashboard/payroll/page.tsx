'use client';

import React, { useState } from 'react';
import {
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Printer,
  Plus,
  Edit,
  Trash2,
  X,
  Lock,
  Key,
  Users,
  Building2,
  Calendar,
  CreditCard,
  AlertCircle,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { PayrollRecord, PayrollStatus, Currency, UserProfile, UserRole, StaffShift } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayrollPage() {
  const {
    currentUser,
    users,
    updateUserProfile,
    addUserProfile,
    deleteUserProfile,
    payrollRecords,
    addPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord,
    processPayrollBatch,
    setStaffPayrollAccess,
    shifts,
    clockOutStaff,
    clockInStaff,
    applyShiftHoursToPayroll
  } = useAppStore();

  // Access Control: Super Admin, Managing Director, Admin, Administration, or staff explicitly assigned payroll access
  const isSuperAdminOrMD =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'managing_director' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'administration' ||
    currentUser.role === 'accounts';
  const hasPayrollAccess = isSuperAdminOrMD || currentUser.hasPayrollAccess === true;

  // Main Module Tab: Payroll vs Shifts
  const [mainTab, setMainTab] = useState<'payroll' | 'shifts'>('payroll');

  // Shifts Filter State
  const [shiftDateFilter, setShiftDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [shiftStaffFilter, setShiftStaffFilter] = useState('all');
  const [shiftSearchTerm, setShiftSearchTerm] = useState('');
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [manualClockInModalOpen, setManualClockInModalOpen] = useState(false);
  const [manualStaffId, setManualStaffId] = useState('');

  // Staff Roster & Profile Editing State
  const [staffRosterModalOpen, setStaffRosterModalOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<UserProfile | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  // Form State for Staff Member
  const [staffFormName, setStaffFormName] = useState('');
  const [staffFormEmail, setStaffFormEmail] = useState('');
  const [staffFormRole, setStaffFormRole] = useState<UserRole>('employee');
  const [staffFormDept, setStaffFormDept] = useState('Operations');
  const [staffFormJob, setStaffFormJob] = useState('Operations Specialist');
  const [staffFormHourlyRate, setStaffFormHourlyRate] = useState<number>(2500);
  const [staffFormPhone, setStaffFormPhone] = useState('');

  const openEditStaffModal = (u: UserProfile) => {
    setEditingStaffMember(u);
    setStaffFormName(u.full_name || '');
    setStaffFormEmail(u.email || '');
    setStaffFormRole(u.role);
    setStaffFormDept(u.department || 'Operations');
    setStaffFormJob(u.job_title || '');
    setStaffFormHourlyRate(u.hourly_rate || (u.role === 'managing_director' ? 5000 : u.role === 'administration' ? 6500 : u.role === 'developer' ? 3500 : u.role === 'sales' ? 2800 : u.role === 'manager' ? 3000 : 2500));
    setStaffFormPhone(u.phone || '');
  };

  const openAddStaffModal = () => {
    setEditingStaffMember(null);
    setStaffFormName('');
    setStaffFormEmail('');
    setStaffFormRole('employee');
    setStaffFormDept('Operations');
    setStaffFormJob('Operations Specialist');
    setStaffFormHourlyRate(2500);
    setStaffFormPhone('');
    setIsAddStaffModalOpen(true);
  };

  const handleSaveStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormName.trim() || !staffFormEmail.trim()) return;

    if (editingStaffMember) {
      updateUserProfile(editingStaffMember.id, {
        full_name: staffFormName.trim(),
        email: staffFormEmail.trim().toLowerCase(),
        role: staffFormRole,
        department: staffFormDept.trim(),
        job_title: staffFormJob.trim(),
        hourly_rate: Number(staffFormHourlyRate) || 2500,
        phone: staffFormPhone.trim(),
      });
      setEditingStaffMember(null);
      setSyncToast({
        message: `Successfully updated staff profile for "${staffFormName.trim()}". All shift records and tracking cards updated!`,
        type: 'success'
      });
      setTimeout(() => setSyncToast(null), 4000);
    } else {
      addUserProfile({
        full_name: staffFormName.trim(),
        email: staffFormEmail.trim().toLowerCase(),
        role: staffFormRole,
        department: staffFormDept.trim(),
        job_title: staffFormJob.trim() || 'Staff Member',
        hourly_rate: Number(staffFormHourlyRate) || 2500,
        phone: staffFormPhone.trim(),
        is_active: true,
      });
      setIsAddStaffModalOpen(false);
      setSyncToast({
        message: `Successfully registered new staff member "${staffFormName.trim()}"!`,
        type: 'success'
      });
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  // Helper to dynamically resolve actual staff name, role, department from `users`
  const getShiftStaffDetails = (s: StaffShift) => {
    const matched = users.find(
      u => u.id === s.staffId || u.email?.toLowerCase() === s.staffEmail?.toLowerCase()
    );
    return {
      staffName: matched?.full_name || s.staffName,
      staffEmail: matched?.email || s.staffEmail,
      department: matched?.department || s.department,
      jobTitle: matched?.job_title || s.jobTitle,
      hourlyRate: matched?.hourly_rate || s.hourlyRate || 2500,
      user: matched
    };
  };

  // Selected Period Filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>('September 2026');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Modals
  const [selectedRecordForPayslip, setSelectedRecordForPayslip] = useState<PayrollRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Form State for Create/Edit Payroll Record
  const [formStaffId, setFormStaffId] = useState('');
  const [formStaffName, setFormStaffName] = useState('');
  const [formStaffEmail, setFormStaffEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formPeriod, setFormPeriod] = useState('September 2026');
  const [formPayDate, setFormPayDate] = useState('2026-09-28');
  const [formCurrency, setFormCurrency] = useState<Currency>('NGN');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(0);
  const [formHousing, setFormHousing] = useState<number>(0);
  const [formTransport, setFormTransport] = useState<number>(0);
  const [formUtility, setFormUtility] = useState<number>(0);
  const [formBonus, setFormBonus] = useState<number>(0);
  const [formTax, setFormTax] = useState<number>(0);
  const [formPension, setFormPension] = useState<number>(0);
  const [formHealth, setFormHealth] = useState<number>(0);
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formStatus, setFormStatus] = useState<PayrollStatus>('paid');
  const [formNotes, setFormNotes] = useState('');

  // Calculations
  const formGrossPay =
    (Number(formBaseSalary) || 0) +
    (Number(formHousing) || 0) +
    (Number(formTransport) || 0) +
    (Number(formUtility) || 0) +
    (Number(formBonus) || 0);

  const formTotalDeductions =
    (Number(formTax) || 0) +
    (Number(formPension) || 0) +
    (Number(formHealth) || 0);

  const formNetPay = Math.max(0, formGrossPay - formTotalDeductions);

  // If user does not have permission, show access restricted view
  if (!hasPayrollAccess) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
            <Lock size={28} />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Restricted Confidential Module
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
            Payroll & Executive Compensation
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
            Staff payroll data, salary compensation structures, tax withholdings, and employee bank details are strictly restricted to <strong>Super Administrators</strong>, the <strong>Managing Director</strong>, and authorized finance officers.
          </p>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
            <div className="font-semibold text-slate-700">Your Current Session:</div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Logged In User:</span>
              <span className="font-bold text-slate-900">{currentUser.full_name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Assigned Role:</span>
              <span className="font-mono capitalize font-bold text-blue-600">{currentUser.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Payroll Access Permission:</span>
              <span className="font-bold text-rose-600">Unauthorized (Flag: false)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter Records
  const filteredRecords = payrollRecords.filter(rec => {
    if (selectedPeriod !== 'all' && rec.period !== selectedPeriod) return false;
    if (filterStatus !== 'all' && rec.status !== filterStatus) return false;
    if (filterDepartment !== 'all' && rec.department !== filterDepartment) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = rec.staffName.toLowerCase().includes(q);
      const matchRole = (rec.jobTitle || '').toLowerCase().includes(q);
      const matchDept = rec.department.toLowerCase().includes(q);
      const matchBank = (rec.bankName || '').toLowerCase().includes(q);
      const matchAcc = (rec.accountNumber || '').toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchDept && !matchBank && !matchAcc) return false;
    }
    return true;
  });

  // Unique periods for selector
  const availablePeriods = Array.from(new Set(payrollRecords.map(r => r.period)));
  if (!availablePeriods.includes('September 2026')) availablePeriods.unshift('September 2026');

  // KPI Calculations
  const periodRecords = payrollRecords.filter(r => selectedPeriod === 'all' || r.period === selectedPeriod);
  const totalGrossPayroll = periodRecords.reduce((acc, curr) => acc + curr.grossPay, 0);
  const totalNetDisbursed = periodRecords.filter(r => r.status === 'paid').reduce((acc, curr) => acc + curr.netPay, 0);
  const totalPendingNet = periodRecords.filter(r => r.status !== 'paid').reduce((acc, curr) => acc + curr.netPay, 0);
  const totalStaffCount = periodRecords.length;

  const handleOpenCreateModal = () => {
    setEditingRecordId(null);
    setFormStaffId('');
    setFormStaffName('');
    setFormStaffEmail('');
    setFormDepartment('');
    setFormJobTitle('');
    setFormPeriod(selectedPeriod === 'all' ? 'September 2026' : selectedPeriod);
    setFormPayDate(new Date().toISOString().split('T')[0]);
    setFormCurrency('NGN');
    setFormBaseSalary(0);
    setFormHousing(0);
    setFormTransport(0);
    setFormUtility(0);
    setFormBonus(0);
    setFormTax(0);
    setFormPension(0);
    setFormHealth(0);
    setFormBankName('');
    setFormAccountNumber('');
    setFormAccountName('');
    setFormStatus('paid');
    setFormNotes('');
    setIsRecordModalOpen(true);
  };

  const handleOpenEditModal = (rec: PayrollRecord) => {
    setEditingRecordId(rec.id);
    setFormStaffId(rec.staffId);
    setFormStaffName(rec.staffName);
    setFormStaffEmail(rec.staffEmail);
    setFormDepartment(rec.department);
    setFormJobTitle(rec.jobTitle);
    setFormPeriod(rec.period);
    setFormPayDate(rec.payDate);
    setFormCurrency(rec.currency);
    setFormBaseSalary(rec.baseSalary);
    setFormHousing(rec.allowances?.housing || 0);
    setFormTransport(rec.allowances?.transport || 0);
    setFormUtility(rec.allowances?.utility || 0);
    setFormBonus(rec.bonuses || 0);
    setFormTax(rec.deductions?.tax || 0);
    setFormPension(rec.deductions?.pension || 0);
    setFormHealth(rec.deductions?.healthInsurance || 0);
    setFormBankName(rec.bankName || '');
    setFormAccountNumber(rec.accountNumber || '');
    setFormAccountName(rec.accountName || rec.staffName);
    setFormStatus(rec.status);
    setFormNotes(rec.notes || '');
    setIsRecordModalOpen(true);
  };

  const handleStaffSelect = (staffId: string) => {
    if (!staffId) {
      setFormStaffId('');
      setFormStaffName('');
      setFormStaffEmail('');
      setFormDepartment('');
      setFormJobTitle('');
      setFormAccountName('');
      setFormBaseSalary(0);
      setFormHousing(0);
      setFormTransport(0);
      setFormUtility(0);
      setFormBonus(0);
      setFormTax(0);
      setFormPension(0);
      setFormHealth(0);
      setFormBankName('');
      setFormAccountNumber('');
      return;
    }

    const selected = users.find(u => u.id === staffId);
    if (selected) {
      setFormStaffId(selected.id);
      setFormStaffName(selected.full_name);
      setFormStaffEmail(selected.email);
      setFormDepartment(selected.department || 'Operations');
      setFormJobTitle(selected.job_title || selected.role);
      setFormAccountName(selected.full_name);

      // Check if this specific employee already has an established payroll profile
      const existing = payrollRecords.find(r => r.staffId === selected.id || r.staffEmail === selected.email);
      if (existing) {
        // Load their specific actual compensation & bank setup
        setFormBaseSalary(existing.baseSalary || 0);
        setFormHousing(existing.allowances?.housing || 0);
        setFormTransport(existing.allowances?.transport || 0);
        setFormUtility(existing.allowances?.utility || 0);
        setFormBonus(0);
        setFormTax(existing.deductions?.tax || 0);
        setFormPension(existing.deductions?.pension || 0);
        setFormHealth(existing.deductions?.healthInsurance || 0);
        setFormBankName(existing.bankName || '');
        setFormAccountNumber(existing.accountNumber || '');
        setFormCurrency(existing.currency || 'NGN');
      } else {
        // Clear all fields so no dummy numbers or accounts attach to this person
        setFormBaseSalary(0);
        setFormHousing(0);
        setFormTransport(0);
        setFormUtility(0);
        setFormBonus(0);
        setFormTax(0);
        setFormPension(0);
        setFormHealth(0);
        setFormBankName('');
        setFormAccountNumber('');
      }
    }
  };

  const handleSaveRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffName.trim() || !formPeriod.trim()) {
      alert('Please select an employee and provide a payroll period.');
      return;
    }

    if (Number(formBaseSalary) <= 0) {
      alert(`Please enter a valid base salary amount for ${formStaffName}.`);
      return;
    }

    const payload = {
      staffId: formStaffId || `u-${Date.now()}`,
      staffName: formStaffName,
      staffEmail: formStaffEmail,
      department: formDepartment,
      jobTitle: formJobTitle,
      period: formPeriod,
      payDate: formPayDate,
      currency: formCurrency,
      baseSalary: Number(formBaseSalary) || 0,
      allowances: {
        housing: Number(formHousing) || 0,
        transport: Number(formTransport) || 0,
        utility: Number(formUtility) || 0
      },
      bonuses: Number(formBonus) || 0,
      grossPay: formGrossPay,
      deductions: {
        tax: Number(formTax) || 0,
        pension: Number(formPension) || 0,
        healthInsurance: Number(formHealth) || 0
      },
      totalDeductions: formTotalDeductions,
      netPay: formNetPay,
      paymentMethod: 'bank_transfer' as const,
      bankName: formBankName,
      accountNumber: formAccountNumber,
      accountName: formAccountName,
      status: formStatus,
      approvedBy: formStatus === 'paid' ? currentUser.full_name : undefined,
      approvedAt: formStatus === 'paid' ? new Date().toISOString() : undefined,
      paidAt: formStatus === 'paid' ? new Date().toISOString() : undefined,
      notes: formNotes
    };

    if (editingRecordId) {
      updatePayrollRecord(editingRecordId, payload);
    } else {
      addPayrollRecord(payload);
    }

    setIsRecordModalOpen(false);
    setEditingRecordId(null);
  };

  return (
    <>
      <div className={`space-y-6 ${selectedRecordForPayslip ? 'print:hidden' : ''}`}>
      {/* Top Module Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-200/80 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setMainTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'payroll'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Banknote size={15} className={mainTab === 'payroll' ? 'text-blue-600' : ''} />
            <span>Staff Payroll &amp; Compensation</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
              {payrollRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('shifts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'shifts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={15} className={mainTab === 'shifts' ? 'text-emerald-600' : ''} />
            <span>Daily Staff Shifts &amp; Attendance</span>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{shifts.filter(s => s.status === 'active').length} on shift</span>
            </span>
          </button>
        </div>

        {mainTab === 'shifts' && (
          <div className="flex items-center gap-2 pr-1">
            <button
              type="button"
              onClick={() => {
                let syncedCount = 0;
                users.forEach(u => {
                  const res = applyShiftHoursToPayroll(u.id, selectedPeriod !== 'all' ? selectedPeriod : 'September 2026');
                  if (res.hours > 0) syncedCount++;
                });
                setSyncToast({
                  message: `Reconciled shift hours and computed pay for ${syncedCount} active staff members into ${selectedPeriod !== 'all' ? selectedPeriod : 'current'} payroll.`,
                  type: 'success'
                });
                setTimeout(() => setSyncToast(null), 5000);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Automatically calculate shift hours and sync to employee compensation"
            >
              <CheckCircle2 size={13} />
              <span>Sync Shift Pay to Payroll</span>
            </button>
          </div>
        )}
      </div>

      {syncToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="font-semibold">{syncToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToast(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TAB 1: STAFF PAYROLL RUNS & PAYSLIPS                                 */}
      {/* ========================================================================= */}
      {mainTab === 'payroll' && (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Confidential & Privileged
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Access: {currentUser.full_name} ({currentUser.role.replace('_', ' ')})
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Staff Payroll & Compensation</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage company salary schedules, allowances, tax withholdings, bank payments, and employee payslips.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Period Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 font-semibold">Period:</span>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {availablePeriods.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="all">All Periods</option>
            </select>
          </div>

          {/* Manage Access Permission Modal button (Super Admin & MD) */}
          {isSuperAdminOrMD && (
            <button
              type="button"
              onClick={() => setIsAccessModalOpen(true)}
              className="px-3 py-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Assign or revoke staff payroll permissions"
            >
              <Key size={13} />
              <span>Staff Access</span>
            </button>
          )}

          {/* Batch Disburse */}
          {selectedPeriod !== 'all' && totalPendingNet > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Approve and disburse all pending payroll records for ${selectedPeriod}?`)) {
                  processPayrollBatch(selectedPeriod);
                }
              }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Batch Disburse</span>
            </button>
          )}

          {/* Run Payroll / Add Slip Button */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Generate Pay Slip</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="text-lg font-black leading-none select-none">₦</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Gross Payroll</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {formatCurrency(totalGrossPayroll, 'NGN')}
            </div>
            <span className="text-[10px] text-slate-400">Scheduled for {selectedPeriod}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disbursed (Net)</span>
            <div className="text-lg font-black text-emerald-700 mt-0.5 font-mono">
              {formatCurrency(totalNetDisbursed, 'NGN')}
            </div>
            <span className="text-[10px] text-slate-400">Cleared through bank transfer</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Disbursement</span>
            <div className="text-lg font-black text-amber-700 mt-0.5 font-mono">
              {formatCurrency(totalPendingNet, 'NGN')}
            </div>
            <span className="text-[10px] text-slate-400">Awaiting approval or funding</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Staff on Payroll</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {totalStaffCount} Employees
            </div>
            <span className="text-[10px] text-purple-600 font-semibold">Active compensation list</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Department Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, department, bank..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'paid', label: 'Paid' },
                { id: 'pending_approval', label: 'Pending' },
                { id: 'draft', label: 'Draft' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterStatus === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Executive">Executive</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales & Growth">Sales & Growth</option>
            <option value="Operations">Operations</option>
            <option value="Finance & Support">Finance & Support</option>
          </select>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department / Role</th>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Gross Salary</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Bank Disbursement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Banknote size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No payroll records found</p>
                    <p className="text-[11px] mt-0.5">Click &ldquo;Generate Pay Slip&rdquo; to add a new employee payroll entry.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.staffName}</div>
                      <div className="text-[10px] text-slate-400">{rec.staffEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{rec.jobTitle}</div>
                      <div className="text-[10px] text-slate-500">{rec.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div>{rec.period}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(rec.payDate)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {formatCurrency(rec.grossPay, rec.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-600">
                      -{formatCurrency(rec.totalDeductions, rec.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      {formatCurrency(rec.netPay, rec.currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rec.bankName || 'Direct Transfer'}</div>
                      <div className="font-mono text-[10px] text-slate-500">{rec.accountNumber || 'Pending'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        rec.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rec.status === 'pending_approval'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {rec.status === 'paid' ? 'PAID & CLEARED' : rec.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForPayslip(rec)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-[#0D52F8] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="View and print official employee payslip"
                        >
                          <Printer size={12} />
                          <span>Payslip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rec)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Edit payroll record"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        {rec.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => {
                              updatePayrollRecord(rec.id, {
                                status: 'paid',
                                approvedBy: currentUser.full_name,
                                approvedAt: new Date().toISOString(),
                                paidAt: new Date().toISOString()
                              });
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                            title="Mark as paid"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove payroll entry for ${rec.staffName}?`)) {
                              deletePayrollRecord(rec.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* MAIN TAB 2: DAILY STAFF SHIFTS & ATTENDANCE TRACKING (SUPER ADMIN)       */}
  {/* ========================================================================= */}
  {mainTab === 'shifts' && (
    <div className="space-y-6">
      {/* Shift Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Daily Shift Attendance
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Super Admin Shift &amp; Labor Cost Oversight
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Staff Clock-In / Clock-Out Shift Tracking
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Staff login automatically sets shift start; staff logout sets shift close. Track daily work duration and calculate accurate compensation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStaffRosterModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Users size={14} />
            <span>Manage Staff Profiles &amp; Names ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setManualClockInModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Clock In Staff (Manual)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              let count = 0;
              users.forEach(u => {
                const res = applyShiftHoursToPayroll(u.id, selectedPeriod !== 'all' ? selectedPeriod : 'September 2026');
                if (res.hours > 0) count++;
              });
              setSyncToast({
                message: `Successfully calculated and reconciled logged shift hours for ${count} staff members into ${selectedPeriod !== 'all' ? selectedPeriod : 'current'} payroll compensation!`,
                type: 'success'
              });
              setTimeout(() => setSyncToast(null), 5000);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>Sync Verified Shift Pay to Payroll</span>
          </button>
        </div>
      </div>

      {/* Shift KPI Metrics */}
      {(() => {
        const activeCount = shifts.filter(s => s.status === 'active').length;
        const completedCount = shifts.filter(s => s.status === 'completed').length;
        const totalHours = Math.round(shifts.reduce((acc, curr) => acc + (curr.durationHours || 0), 0) * 10) / 10;
        const totalLaborValue = Math.round(shifts.reduce((acc, curr) => acc + ((curr.durationHours || 0) * (curr.hourlyRate || 2500)), 0));

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Clocked In Now</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{activeCount} Staff Active</div>
                <span className="text-[10px] text-emerald-600 font-semibold">Active Daily Shift</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Shift Hours Logged</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{totalHours} hrs</div>
                <span className="text-[10px] text-blue-600 font-semibold">{completedCount} Completed Shifts</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <span className="text-lg font-black leading-none select-none">₦</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calculated Shift Pay Cost</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(totalLaborValue, 'NGN')}</div>
                <span className="text-[10px] text-purple-600 font-semibold">Ready for Payroll Reconciliation</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shift Audit Security</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">100% Verified</div>
                <span className="text-[10px] text-slate-500 font-semibold">Company Email Authenticated</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Live Clocked In Staff Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Currently Clocked In Staff ({shifts.filter(s => s.status === 'active').length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Real-time Shift Attendance</span>
        </div>

        {shifts.filter(s => s.status === 'active').length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No staff members currently clocked in. Staff are automatically recorded as on-shift when they log in with their company email.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {shifts.filter(s => s.status === 'active').map(s => {
              const details = getShiftStaffDetails(s);
              const start = new Date(s.clockInTime);
              const elapsedMs = Date.now() - start.getTime();
              const elapsedHours = Math.max(0.1, Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10);

              return (
                <div key={s.id} className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {details.staffName ? details.staffName[0] : 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{details.staffName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{details.jobTitle} • {details.department}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ON SHIFT
                      </span>
                      {hasPayrollAccess && (
                        <button
                          type="button"
                          onClick={() => {
                            if (details.user) {
                              openEditStaffModal(details.user);
                            } else {
                              openEditStaffModal({
                                id: s.staffId,
                                full_name: details.staffName,
                                email: details.staffEmail,
                                department: details.department,
                                job_title: details.jobTitle,
                                role: 'employee',
                                hourly_rate: details.hourlyRate,
                                is_active: true
                              });
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white transition cursor-pointer"
                          title="Edit staff name & profile"
                        >
                          <Edit size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border border-emerald-100/80">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Start of Shift</span>
                      <span className="font-mono font-semibold text-slate-700">
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Elapsed Duration</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ~{elapsedHours} hrs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Rate: {formatCurrency(details.hourlyRate, 'NGN')}/hr
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Clock out ${details.staffName} and close their daily shift?`)) {
                          clockOutStaff(s.id);
                        }
                      }}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Clock Out Staff
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Staff Shift Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, email or job..."
                value={shiftSearchTerm}
                onChange={e => setShiftSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={shiftDateFilter}
              onChange={e => setShiftDateFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today (Active Shifts)</option>
              <option value="yesterday">Yesterday</option>
            </select>

            <select
              value={shiftStaffFilter}
              onChange={e => setShiftStaffFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Staff Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{shifts.length}</strong> recorded shifts
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Start (Clock In)</th>
                <th className="py-3 px-3">Close (Clock Out)</th>
                <th className="py-3 px-3 text-right">Hours</th>
                <th className="py-3 px-3 text-right">Rate</th>
                <th className="py-3 px-3 text-right">Computed Pay</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts
                .filter(s => {
                  const details = getShiftStaffDetails(s);
                  if (shiftStaffFilter !== 'all' && s.staffId !== shiftStaffFilter) return false;
                  if (shiftDateFilter === 'today' && s.date !== new Date().toISOString().split('T')[0]) return false;
                  if (shiftDateFilter === 'yesterday') {
                    const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                    if (s.date !== yest) return false;
                  }
                  if (shiftSearchTerm) {
                    const q = shiftSearchTerm.toLowerCase();
                    if (!details.staffName.toLowerCase().includes(q) && !details.staffEmail.toLowerCase().includes(q) && !details.department.toLowerCase().includes(q)) {
                      return false;
                    }
                  }
                  return true;
                })
                .map(s => {
                  const details = getShiftStaffDetails(s);
                  const computedPay = Math.round((s.durationHours || 0) * (details.hourlyRate || s.hourlyRate || 2500));

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {details.staffName ? details.staffName[0] : 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{details.staffName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{details.staffEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {details.department}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {s.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {s.clockInTime ? new Date(s.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {s.clockOutTime ? new Date(s.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-emerald-600 font-semibold italic">In Progress</span>}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {s.status === 'active' ? 'Active' : `${s.durationHours} hrs`}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(details.hourlyRate, 'NGN')}/hr
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-blue-700">
                        {formatCurrency(computedPay, 'NGN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {s.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🟢 Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Clock out ${details.staffName}?`)) {
                                  clockOutStaff(s.id);
                                }
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Clock Out
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                applyShiftHoursToPayroll(s.staffId, selectedPeriod !== 'all' ? selectedPeriod : 'September 2026');
                                setSyncToast({
                                  message: `Synced ${s.durationHours} hrs (${formatCurrency(computedPay, 'NGN')}) for ${details.staffName} into payroll!`,
                                  type: 'success'
                                });
                                setTimeout(() => setSyncToast(null), 4000);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Reconcile
                            </button>
                          )}

                          {hasPayrollAccess && (
                            <button
                              type="button"
                              onClick={() => {
                                if (details.user) {
                                  openEditStaffModal(details.user);
                                } else {
                                  openEditStaffModal({
                                    id: s.staffId,
                                    full_name: details.staffName,
                                    email: details.staffEmail,
                                    department: details.department,
                                    job_title: details.jobTitle,
                                    role: 'employee',
                                    hourly_rate: details.hourlyRate,
                                    is_active: true
                                  });
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                              title="Edit staff profile"
                            >
                              <Edit size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Clock In Modal */}
      {manualClockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setManualClockInModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Manual Staff Clock-In</h3>
              <button type="button" onClick={() => setManualClockInModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-slate-500">Record a shift start manually for an employee:</p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Staff Member *</label>
                <select
                  value={manualStaffId}
                  onChange={e => setManualStaffId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Employee --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.job_title || u.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualClockInModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!manualStaffId}
                  onClick={() => {
                    clockInStaff(manualStaffId);
                    setManualClockInModalOpen(false);
                    setManualStaffId('');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold"
                >
                  Start Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Create / Edit Payroll Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsRecordModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0D52F8] text-white flex items-center justify-center font-bold">
                  <Banknote size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingRecordId ? `Edit Payroll Entry: ${formStaffName}` : 'Generate Staff Pay Slip'}
                  </h2>
                  <p className="text-[11px] text-slate-500">Configure salary compensation, allowances, tax & deductions.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRecordSubmit} className="space-y-4">
              {/* Employee Selection */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Employee Selection</span>
                  <select
                    onChange={e => handleStaffSelect(e.target.value)}
                    value={formStaffId}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="">-- Select Employee to Pay --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.job_title || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Staff Name *</label>
                    <input
                      type="text"
                      required
                      value={formStaffName}
                      onChange={e => setFormStaffName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Staff Email</label>
                    <input
                      type="email"
                      value={formStaffEmail}
                      onChange={e => setFormStaffEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={e => setFormDepartment(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                    <input
                      type="text"
                      value={formJobTitle}
                      onChange={e => setFormJobTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Period & Payment Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payroll Period *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026"
                    value={formPeriod}
                    onChange={e => setFormPeriod(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    required
                    value={formPayDate}
                    onChange={e => setFormPayDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={e => setFormCurrency(e.target.value as Currency)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
                    disabled
                  >
                    <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as PayrollStatus)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-bold"
                  >
                    <option value="paid">Paid & Disbursed</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Earnings & Allowances */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Salary & Allowances
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Base Salary (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formBaseSalary}
                      onChange={e => setFormBaseSalary(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Housing (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formHousing}
                      onChange={e => setFormHousing(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Transport (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formTransport}
                      onChange={e => setFormTransport(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Utility / Data (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formUtility}
                      onChange={e => setFormUtility(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Bonus (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formBonus}
                      onChange={e => setFormBonus(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Deductions (Tax, Pension, Health)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">PAYE Income Tax (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formTax}
                      onChange={e => setFormTax(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Pension Contribution (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formPension}
                      onChange={e => setFormPension(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Health Insurance (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formHealth}
                      onChange={e => setFormHealth(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formBankName}
                    onChange={e => setFormBankName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formAccountNumber}
                    onChange={e => setFormAccountNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Name</label>
                  <input
                    type="text"
                    value={formAccountName}
                    onChange={e => setFormAccountName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-600">Gross Earnings: <strong>{formatCurrency(formGrossPay, formCurrency)}</strong></span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-rose-600">Deductions: <strong>-{formatCurrency(formTotalDeductions, formCurrency)}</strong></span>
                </div>
                <div className="text-sm font-black text-blue-900 font-mono">
                  Net Pay: {formatCurrency(formNetPay, formCurrency)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{editingRecordId ? 'Update Payroll Entry' : 'Save & Issue Payslip'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Payroll Access Management Modal (Super Admin / MD) */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAccessModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Key size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manage Staff Payroll Access</h2>
                  <p className="text-[11px] text-slate-500">Authorize specific staff members to view and process company payroll.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
              By default, only the <strong>Managing Director</strong> and <strong>Super Administrators</strong> can access payroll. You can grant delegated access to HR officers or finance leads below.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {users.map(u => {
                const isSuper = u.role === 'managing_director' || u.role === 'super_admin' || u.role === 'admin';
                const hasAccess = isSuper || u.hasPayrollAccess === true;

                return (
                  <div key={u.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.full_name}</span>
                        {isSuper && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Executive
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{u.job_title || u.role} • {u.department || 'Operations'}</div>
                    </div>

                    <div>
                      {isSuper ? (
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold">
                          Always Allowed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStaffPayrollAccess(u.id, !hasAccess)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                            hasAccess
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                          }`}
                        >
                          {hasAccess ? (
                            <>
                              <X size={12} />
                              <span>Revoke Access</span>
                            </>
                          ) : (
                            <>
                              <Check size={12} />
                              <span>Grant Access</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Official Printable Employee Payslip Modal (Outside hidden dashboard) */}
    {selectedRecordForPayslip && (() => {
      const p = selectedRecordForPayslip;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:static print:p-0 print:m-0 print:overflow-visible print:bg-white print:block print:w-full">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs print:hidden" onClick={() => setSelectedRecordForPayslip(null)} />
          <div
            id="printable-payslip"
            className="printable-sheet relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-slate-800 my-4 max-h-[90vh] overflow-y-auto print:p-0 print:my-0 print:max-w-full print:shadow-none print:border-none print:max-h-none print:overflow-visible print:rounded-none"
          >
            {/* Official Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D52F8] text-white flex items-center justify-center font-black text-sm">
                  M
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900 leading-tight">MODE DIGITAL CREATIONS</h2>
                  <p className="text-[10px] text-slate-500">Corporate Headquarters • Technology & Enterprise Cloud</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Official Payslip
                </span>
                <div className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{p.period}</div>
                <div className="text-[9px] text-slate-400">Pay Date: {formatDate(p.payDate)}</div>
              </div>
            </div>

            {/* Employee Meta Grid */}
            <div className="my-3 p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Employee</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{p.staffName}</div>
                {p.staffEmail && <div className="text-[9px] text-slate-500">{p.staffEmail}</div>}
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Position</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{p.jobTitle || p.department}</div>
                <div className="text-[9px] text-slate-500">{p.department}</div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bank Details</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{p.bankName || 'Bank Wire'}</div>
                <div className="text-[9px] font-mono text-slate-500">{p.accountNumber ? `Acc: ${p.accountNumber}` : 'Direct Transfer'}</div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Disbursement</span>
                <div className="mt-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {p.status === 'paid' ? 'DISBURSED' : p.status}
                  </span>
                </div>
                {p.approvedBy && (
                  <div className="text-[8px] text-slate-400 mt-0.5 font-medium">By: {p.approvedBy}</div>
                )}
              </div>
            </div>

            {/* Earnings & Deductions Breakdown (Strictly Side-by-Side in Print) */}
            <div className="grid grid-cols-2 print:grid-cols-2 gap-3 text-xs">
              {/* Earnings Column */}
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1.5 print:bg-white print:border-slate-300">
                <div className="font-bold text-slate-900 pb-1 border-b border-slate-200 uppercase text-[9px] tracking-wider text-blue-600">
                  Gross Earnings & Allowances
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600">Base Salary</span>
                  <span className="font-mono font-semibold">{formatCurrency(p.baseSalary, p.currency)}</span>
                </div>
                {p.allowances?.housing && p.allowances.housing > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Housing Allowance</span>
                    <span className="font-mono font-semibold">{formatCurrency(p.allowances.housing, p.currency)}</span>
                  </div>
                ) : null}
                {p.allowances?.transport && p.allowances.transport > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Transport Allowance</span>
                    <span className="font-mono font-semibold">{formatCurrency(p.allowances.transport, p.currency)}</span>
                  </div>
                ) : null}
                {p.allowances?.utility && p.allowances.utility > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Utility / Data</span>
                    <span className="font-mono font-semibold">{formatCurrency(p.allowances.utility, p.currency)}</span>
                  </div>
                ) : null}
                {p.bonuses > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Bonus & Commissions</span>
                    <span className="font-mono font-semibold text-emerald-700">+{formatCurrency(p.bonuses, p.currency)}</span>
                  </div>
                ) : null}
                {p.shiftHours && p.shiftHours > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Verified Shift Attendance</span>
                    <span className="font-mono font-semibold text-blue-700">{p.shiftHours} hrs worked</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-200 text-xs">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono">{formatCurrency(p.grossPay, p.currency)}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1.5 print:bg-white print:border-slate-300">
                <div className="font-bold text-slate-900 pb-1 border-b border-slate-200 uppercase text-[9px] tracking-wider text-rose-600">
                  Statutory & Voluntary Deductions
                </div>
                {p.deductions?.tax && p.deductions.tax > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">PAYE Income Tax</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCurrency(p.deductions.tax, p.currency)}</span>
                  </div>
                ) : null}
                {p.deductions?.pension && p.deductions.pension > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Pension (8%)</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCurrency(p.deductions.pension, p.currency)}</span>
                  </div>
                ) : null}
                {p.deductions?.healthInsurance && p.deductions.healthInsurance > 0 ? (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600">Health Insurance / NHIS</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCurrency(p.deductions.healthInsurance, p.currency)}</span>
                  </div>
                ) : null}
                {(!p.deductions?.tax && !p.deductions?.pension && !p.deductions?.healthInsurance) || p.totalDeductions === 0 ? (
                  <div className="py-2 text-[10px] text-slate-400 italic">
                    No statutory or voluntary deductions withheld.
                  </div>
                ) : null}
                <div className="flex justify-between font-extrabold text-rose-800 pt-1.5 border-t border-slate-200 text-xs">
                  <span>Total Deductions</span>
                  <span className="font-mono">-{formatCurrency(p.totalDeductions, p.currency)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay Banner */}
            <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Net Take-Home Pay</span>
                <div className="text-xl font-black text-emerald-950 font-mono mt-0.5">
                  {formatCurrency(p.netPay, p.currency)}
                </div>
              </div>
              <div className="text-right text-[10px] text-emerald-800 font-semibold">
                <span>ACH Corporate Bank Wire</span>
                <p className="text-[9px] text-emerald-600 font-normal">Disbursed &amp; Reconciled</p>
              </div>
            </div>

            {/* Authorization & Signatures */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-500">
              <div>
                <div className="font-semibold text-slate-700">Executive Authorization</div>
                <div className="h-8 flex items-end">
                  <span className="font-serif italic font-bold text-blue-900 text-sm">Davids Ogan</span>
                </div>
                <div className="border-t border-slate-300 pt-1 text-[9px]">
                  Managing Director &amp; Founder • MODE Digital Creations
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-700">Employee Acknowledgment</div>
                <div className="h-8 flex items-end">
                  <span className="text-[9px] text-slate-400 italic">Digitally Verified &amp; Accepted</span>
                </div>
                <div className="border-t border-slate-300 pt-1 text-[9px]">
                  {p.staffName} ({p.staffEmail})
                </div>
              </div>
            </div>

            {/* Action Buttons (Strictly Hidden on Print) */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 mt-4 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedRecordForPayslip(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Official Payslip</span>
              </button>
            </div>
          </div>
        </div>
      );
    })()}

      {/* Staff Roster & Profile Management Modal */}
      {staffRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStaffRosterModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">Company Staff Roster &amp; Profiles</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {users.length} Registered Staff
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update actual staff names, job titles, and departments. Edits instantly reflect on live shift clock-in cards, shift reports, and payroll.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStaffRosterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">All Registered Employees</span>
              <button
                type="button"
                onClick={openAddStaffModal}
                className="px-3 py-1.5 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Add Staff Member</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {users.map(u => {
                const isSuper = u.role === 'managing_director' || u.role === 'super_admin';
                const activeShiftForUser = shifts.find(
                  s => (s.staffId === u.id || s.staffEmail?.toLowerCase() === u.email?.toLowerCase()) && s.status === 'active'
                );

                return (
                  <div
                    key={u.id}
                    className="p-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {u.full_name ? u.full_name[0] : 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-xs">{u.full_name}</span>
                          {isSuper && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                              Super Admin
                            </span>
                          )}
                          {activeShiftForUser ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ON SHIFT
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                              Off Duty
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {u.job_title || u.role} • <strong className="text-slate-600 font-medium">{u.department || 'Operations'}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {u.email} • Rate: {formatCurrency(u.hourly_rate || (u.role === 'managing_director' ? 5000 : u.role === 'administration' ? 6500 : u.role === 'developer' ? 3500 : u.role === 'sales' ? 2800 : u.role === 'manager' ? 3000 : 2500), 'NGN')}/hr
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditStaffModal(u)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit size={12} />
                        <span>Edit Name &amp; Profile</span>
                      </button>

                      {!isSuper && u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${u.full_name} from company staff directory?`)) {
                              deleteUserProfile(u.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Remove Staff"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setStaffRosterModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Staff Profile Modal */}
      {(editingStaffMember !== null || isAddStaffModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setEditingStaffMember(null);
              setIsAddStaffModalOpen(false);
            }}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingStaffMember ? `Edit Staff Profile: ${editingStaffMember.full_name}` : 'Register New Staff Member'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update actual staff identity. All live and recorded shifts will immediately reflect this name.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingStaffMember(null);
                  setIsAddStaffModalOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaffMember} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Alabi, Ngozi Okonjo"
                  value={staffFormName}
                  onChange={e => setStaffFormName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@modedigitalcreations.ng"
                    value={staffFormEmail}
                    onChange={e => setStaffFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales & Growth, Engineering, Administration"
                    value={staffFormDept}
                    onChange={e => setStaffFormDept(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Head of Sales, Lead Frontend Engineer"
                    value={staffFormJob}
                    onChange={e => setStaffFormJob(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Role</label>
                  <select
                    value={staffFormRole}
                    onChange={e => setStaffFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                  >
                    <option value="employee">Employee / Officer</option>
                    <option value="manager">Manager / Supervisor</option>
                    <option value="developer">Developer / Engineer</option>
                    <option value="sales">Sales &amp; Growth</option>
                    <option value="administration">Administration / Finance</option>
                    <option value="managing_director">Managing Director</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Hourly Rate (₦/hr)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={staffFormHourlyRate}
                    onChange={e => setStaffFormHourlyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={staffFormPhone}
                    onChange={e => setStaffFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStaffMember(null);
                    setIsAddStaffModalOpen(false);
                  }}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check size={14} />
                  <span>{editingStaffMember ? 'Save Staff Changes' : 'Register Staff Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  </>
);
}
