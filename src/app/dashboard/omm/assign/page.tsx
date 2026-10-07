'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Building,
  Mail,
  Phone,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { isManagementUser } from '@/lib/utils';
import type { UserProfile, UserRole } from '@/lib/types';

export default function StaffAllocationPage() {
  const { users, updateUserProfile, addUserProfile, deleteUserProfile, currentUser } = useAppStore();
  const canManageStaff = isManagementUser(currentUser.role);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const openAddModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setJobTitle('');
    setDepartment('Operations');
    setRole('employee');
    setPhone('');
    setPassword('password123');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setFullName(u.full_name || '');
    setEmail(u.email || '');
    setJobTitle(u.job_title || '');
    setDepartment(u.department || 'Operations');
    setRole(u.role);
    setPhone(u.phone || '');
    setPassword(''); // never pre-fill — the stored value is a hash, and re-submitting it would hash-the-hash
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const isCustomized = typeof window !== 'undefined' && localStorage.getItem('mode_ops_users_customized') === 'true';
      if (isCustomized && users.length > 0) {
        // Push local customized real staff to server database
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity: 'users', data: users, timestamp: new Date().toISOString() })
        });
        setToastMessage('Real staff directory saved and permanently synced to server database.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const res = await fetch('/api/sync');
      if (res.ok) {
        const result = await res.json();
        if (result?.data?.users && typeof window !== 'undefined') {
          localStorage.setItem('mode_ops_users', JSON.stringify(result.data.users));
          window.dispatchEvent(new CustomEvent('mode_ops_users_changed', { detail: result.data.users }));
          setToastMessage('Staff directory synced with server database.');
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    } catch {
      setToastMessage('Failed to connect to server.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    if (editingUser) {
      updateUserProfile(editingUser.id, {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        job_title: jobTitle.trim(),
        department: department.trim(),
        role,
        phone: phone.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      setToastMessage(`Staff credentials for "${fullName.trim()}" updated and synced to server!`);
    } else {
      addUserProfile({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        job_title: jobTitle.trim() || 'Team Member',
        department: department.trim() || 'Operations',
        role,
        phone: phone.trim(),
        is_active: true,
        password: password.trim() || 'password123',
      });
      setToastMessage(`New staff member "${fullName.trim()}" registered and synced!`);
    }

    setTimeout(() => setToastMessage(null), 4000);
    closeModal();
  };

  const handleDelete = () => {
    if (!editingUser) return;
    if (editingUser.id === currentUser.id) {
      alert('You cannot delete your own active administrator profile.');
      return;
    }
    if (confirm(`Are you sure you want to remove ${editingUser.full_name} from staff directory?`)) {
      deleteUserProfile(editingUser.id);
      setToastMessage(`Staff member "${editingUser.full_name}" removed from directory.`);
      setTimeout(() => setToastMessage(null), 4000);
      closeModal();
    }
  };

  if (!canManageStaff) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
            <Lock size={28} />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Restricted
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
            Staff Allocation &amp; Management Hierarchy
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
            Editing staff roles, credentials, and the reporting hierarchy is restricted to managers, administrators, and the Managing Director.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Staff Allocation & Management Hierarchy
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Executive Directory
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Server Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review reporting chains, departmental assignments, and role-based permissions. Super Admins can update staff credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition disabled:opacity-50"
            title="Sync latest staff from server"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Server'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            <Plus size={15} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map(u => (
          <div
            key={u.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0D52F8] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    {u.full_name ? u.full_name[0] : 'U'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{u.full_name}</h3>
                    <span className="text-[11px] text-slate-500">{u.job_title}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(u)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition cursor-pointer"
                  title="Edit staff name, email, or role"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <strong className="text-slate-800">{u.department}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">System Role:</span>
                  <span className="text-blue-600 font-mono text-[10px] font-bold uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{u.email}</span>
                </div>
                {u.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-700 text-[11px]">{u.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={13} /> Active Personnel
              </span>
              <button
                type="button"
                onClick={() => openEditModal(u)}
                className="text-xs font-semibold text-[#0D52F8] hover:underline"
              >
                Edit Credentials
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit Staff Profile & Credentials' : 'Add New Staff Member'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Davids Ogan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@modedigitalcreations.ng"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="Managing Director"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Executive"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="managing_director">Managing Director (MD)</option>
                    <option value="manager">Operations Manager</option>
                    <option value="sales">Sales & Growth Lead</option>
                    <option value="administration">Administration</option>
                    <option value="developer">Engineering Lead</option>
                    <option value="employee">Staff Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">Staff Password & Credentials</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={editingUser ? "Leave blank to keep existing password" : "e.g. Mode2026!"}
                    className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <KeyRound size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Official login credential used by this staff member to authenticate.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingUser && editingUser.id !== currentUser.id ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-xs"
                  >
                    <Trash2 size={13} />
                    <span>Remove Staff</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Check size={14} />
                    <span>{editingUser ? 'Update Credentials' : 'Add Staff Member'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
