'use client';

import React, { useState } from 'react';
import {
  Banknote,
  DollarSign,
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
  UserCheck,
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
import type { PayrollRecord, PayrollStatus, Currency, UserProfile } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayrollPage() {
  const {
    currentUser,
    setCurrentUserRole,
    users,
    payrollRecords,
    addPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord,
    processPayrollBatch,
    setStaffPayrollAccess
  } = useAppStore();

  // Access Control: Super Admin, Managing Director, Admin, or staff explicitly assigned payroll access
  const isSuperAdminOrMD =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'managing_director' ||
    currentUser.role === 'admin';
  const hasPayrollAccess = isSuperAdminOrMD || currentUser.hasPayrollAccess === true;

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
  const [formDepartment, setFormDepartment] = useState('Engineering');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formPeriod, setFormPeriod] = useState('September 2026');
  const [formPayDate, setFormPayDate] = useState('2026-09-28');
  const [formCurrency, setFormCurrency] = useState<Currency>('NGN');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(500000);
  const [formHousing, setFormHousing] = useState<number>(100000);
  const [formTransport, setFormTransport] = useState<number>(50000);
  const [formUtility, setFormUtility] = useState<number>(15000);
  const [formBonus, setFormBonus] = useState<number>(0);
  const [formTax, setFormTax] = useState<number>(40000);
  const [formPension, setFormPension] = useState<number>(25000);
  const [formHealth, setFormHealth] = useState<number>(10000);
  const [formBankName, setFormBankName] = useState('Guaranty Trust Bank (GTB)');
  const [formAccountNumber, setFormAccountNumber] = useState('0123456789');
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

          {/* Quick Impersonation Switcher for testing/demo */}
          <div className="mt-6 pt-6 border-t border-slate-100 max-w-md mx-auto text-left">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Test with Authorized Role (Demo Mode)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrentUserRole('managing_director')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Switch to MD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  // Switch to accounts role which has payroll access
                  setCurrentUserRole('accounts');
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserCheck size={14} />
                <span>Switch to Accounts Lead</span>
              </button>
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
    setFormStaffId(users[0]?.id || 'u1');
    setFormStaffName(users[0]?.full_name || 'Davids Ogan');
    setFormStaffEmail(users[0]?.email || 'davids@modedigital.ng');
    setFormDepartment(users[0]?.department || 'Executive');
    setFormJobTitle(users[0]?.job_title || 'Managing Director');
    setFormPeriod(selectedPeriod === 'all' ? 'September 2026' : selectedPeriod);
    setFormPayDate(new Date().toISOString().split('T')[0]);
    setFormCurrency('NGN');
    setFormBaseSalary(500000);
    setFormHousing(100000);
    setFormTransport(50000);
    setFormUtility(15000);
    setFormBonus(0);
    setFormTax(40000);
    setFormPension(25000);
    setFormHealth(10000);
    setFormBankName('Guaranty Trust Bank (GTB)');
    setFormAccountNumber('0123456789');
    setFormAccountName(users[0]?.full_name || '');
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
    const selected = users.find(u => u.id === staffId);
    if (selected) {
      setFormStaffId(selected.id);
      setFormStaffName(selected.full_name);
      setFormStaffEmail(selected.email);
      setFormDepartment(selected.department || 'Operations');
      setFormJobTitle(selected.job_title || 'Staff Specialist');
      setFormAccountName(selected.full_name);
    }
  };

  const handleSaveRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffName || !formPeriod) return;

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
            <DollarSign size={20} />
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

      {/* Official Printable Employee Payslip Modal */}
      {selectedRecordForPayslip && (() => {
        const p = selectedRecordForPayslip;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedRecordForPayslip(null)} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 z-10 text-slate-800 my-8 max-h-[90vh] overflow-y-auto">
              {/* Official Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D52F8] text-white flex items-center justify-center font-black text-lg">
                    M
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900">MODE DIGITAL CREATIONS</h2>
                    <p className="text-[11px] text-slate-500">Corporate Headquarters • Technology & Enterprise Cloud</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Official Payslip
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1 font-mono">{p.period}</div>
                  <div className="text-[10px] text-slate-400">Pay Date: {formatDate(p.payDate)}</div>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Employee Name</span>
                  <div className="font-bold text-slate-900 mt-0.5">{p.staffName}</div>
                  <div className="text-[10px] text-slate-500">{p.staffEmail}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <div className="font-bold text-slate-900 mt-0.5">{p.department}</div>
                  <div className="text-[10px] text-slate-500">{p.jobTitle}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</span>
                  <div className="font-bold text-slate-900 mt-0.5">{p.bankName || 'Bank Transfer'}</div>
                  <div className="text-[10px] font-mono text-slate-500">Acc: {p.accountNumber || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Disbursement Status</span>
                  <div className="mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {p.status === 'paid' ? 'DISBURSED' : p.status}
                    </span>
                  </div>
                  {p.approvedBy && (
                    <div className="text-[9px] text-slate-400 mt-0.5">By: {p.approvedBy}</div>
                  )}
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Earnings Column */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 pb-1 border-b border-slate-200 uppercase text-[10px] tracking-wider text-blue-600">
                    Gross Earnings & Allowances
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Basic Base Salary</span>
                    <span className="font-mono font-semibold">{formatCurrency(p.baseSalary, p.currency)}</span>
                  </div>
                  {p.allowances?.housing && p.allowances.housing > 0 ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Housing Allowance</span>
                      <span className="font-mono font-semibold">{formatCurrency(p.allowances.housing, p.currency)}</span>
                    </div>
                  ) : null}
                  {p.allowances?.transport && p.allowances.transport > 0 ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Transport Allowance</span>
                      <span className="font-mono font-semibold">{formatCurrency(p.allowances.transport, p.currency)}</span>
                    </div>
                  ) : null}
                  {p.allowances?.utility && p.allowances.utility > 0 ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Utility / Phone / Internet</span>
                      <span className="font-mono font-semibold">{formatCurrency(p.allowances.utility, p.currency)}</span>
                    </div>
                  ) : null}
                  {p.bonuses > 0 ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Performance Bonus & Commissions</span>
                      <span className="font-mono font-semibold text-emerald-700">+{formatCurrency(p.bonuses, p.currency)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono">{formatCurrency(p.grossPay, p.currency)}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 pb-1 border-b border-slate-200 uppercase text-[10px] tracking-wider text-rose-600">
                    Statutory & Voluntary Deductions
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">PAYE Income Tax</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCurrency(p.deductions?.tax || 0, p.currency)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Employee Pension Contribution (8%)</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCurrency(p.deductions?.pension || 0, p.currency)}</span>
                  </div>
                  {p.deductions?.healthInsurance ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Health Insurance / NHIS</span>
                      <span className="font-mono font-semibold text-rose-700">-{formatCurrency(p.deductions.healthInsurance, p.currency)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-extrabold text-rose-800 pt-2 border-t border-slate-200">
                    <span>Total Deductions</span>
                    <span className="font-mono">-{formatCurrency(p.totalDeductions, p.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Banner */}
              <div className="my-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Net Take-Home Pay</span>
                  <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
                    {formatCurrency(p.netPay, p.currency)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-800 font-semibold">
                  <span>Processed via ACH Bank Wire</span>
                  <p className="text-[10px] text-emerald-600 font-normal">Electronic Funds Transfer Confirmed</p>
                </div>
              </div>

              {/* Authorization & Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-[11px] text-slate-500">
                <div>
                  <div className="font-semibold text-slate-700">Executive Authorization</div>
                  <div className="h-10 flex items-end">
                    <span className="font-serif italic font-bold text-blue-900 text-sm">Davids Ogan</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[10px]">
                    Managing Director &amp; Founder • MODE Digital Creations
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Employee Acknowledgment</div>
                  <div className="h-10 flex items-end">
                    <span className="text-[10px] text-slate-400 italic">Digitally Verified &amp; Accepted</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[10px]">
                    {p.staffName} ({p.staffEmail})
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForPayslip(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Official Payslip</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
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
  );
}
