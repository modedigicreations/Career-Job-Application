'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate, formatWhatsAppUrl, formatMailtoUrl } from '@/lib/utils';
import type { Contact } from '@/lib/types';

const WhatsAppIcon = ({ className = "w-3 h-3 fill-current" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteConfirmContact, setDeleteConfirmContact] = useState<Contact | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const filteredContacts = contacts.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.company.toLowerCase().includes(searchTerm.toLowerCase()) && !c.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setPosition('');
    setNotes('');
    setIsActive(true);
    setNewModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setName(contact.name || '');
    setEmail(contact.email || '');
    setPhone(contact.phone || '');
    setCompany(contact.company || '');
    setPosition(contact.position || '');
    setNotes(contact.notes || '');
    setIsActive(contact.isActive ?? true);
    setNewModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingContact) {
      updateContact(editingContact.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        position: position.trim(),
        notes: notes.trim(),
        isActive,
      });
    } else {
      addContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        position: position.trim(),
        notes: notes.trim(),
        isActive,
      });
    }

    setNewModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteSingle = (contact: Contact) => {
    deleteContact(contact.id);
    setSelectedIds(prev => prev.filter(id => id !== contact.id));
    setDeleteConfirmContact(null);
    if (editingContact?.id === contact.id) {
      setNewModalOpen(false);
      setEditingContact(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteContact(id));
    setSelectedIds([]);
    setBulkDeleteModalOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client &amp; Executive Contacts
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {contacts.length} {contacts.length === 1 ? 'Contact' : 'Contacts'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directory of corporate decision makers, project sponsors, and billing contacts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#0D52F8] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search & Selection Controls */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contact name, company, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {filteredContacts.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-blue-600 hover:text-blue-800 font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                selectedIds.length === filteredContacts.length && filteredContacts.length > 0
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}>
                {selectedIds.length === filteredContacts.length && filteredContacts.length > 0 && <Check size={10} />}
              </span>
              <span>{selectedIds.length === filteredContacts.length ? 'Deselect All' : 'Select All'}</span>
            </button>
            <span>•</span>
            <span>Showing {filteredContacts.length} of {contacts.length}</span>
          </div>
        )}
      </div>

      {/* Bulk Delete Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>{selectedIds.length}</strong> client {selectedIds.length === 1 ? 'contact' : 'contacts'} selected for removal.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Trash2 size={13} />
              <span>Remove Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Users size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No client contacts found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No contacts match "${searchTerm}". Clear your search query to see all clients.`
              : 'The client directory is currently empty. You can add verified clients whenever you are ready.'}
          </p>
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-3 px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add First Client</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => {
            const isSelected = selectedIds.includes(contact.id);

            return (
              <div
                key={contact.id}
                className={`p-5 rounded-2xl bg-white border transition space-y-3 relative group ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Top Row: Checkbox, Avatar, Name & Edit/Delete Actions */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelect(contact.id)}
                      className={`mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                      title={isSelected ? 'Deselect contact' : 'Select contact'}
                    >
                      {isSelected && <Check size={11} />}
                    </button>

                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D52F8] flex items-center justify-center font-bold text-sm shrink-0">
                      {contact.name ? contact.name[0] : 'C'}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-slate-900 truncate">
                        {contact.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 truncate">
                        {contact.position || 'Representative'} {contact.company ? `• ${contact.company}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(contact)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Edit client details"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmContact(contact)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove client from directory"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <a
                      href={formatMailtoUrl(contact.email, `MODE DIGITAL CREATIONS - Communication with ${contact.name}`, `Hello ${contact.name},\n\nWe hope this finds you well.`)}
                      className="text-slate-600 hover:text-blue-600 hover:underline truncate"
                      title={`Email ${contact.email}`}
                    >
                      {contact.email}
                    </a>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <a
                        href={formatWhatsAppUrl(contact.phone, `Hello ${contact.name}, this is MODE DIGITAL CREATIONS.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-emerald-600 hover:underline flex items-center gap-1.5"
                        title="Open in WhatsApp"
                      >
                        <span>{contact.phone}</span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          WhatsApp
                        </span>
                      </a>
                    </div>
                  )}
                  {contact.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 pt-0.5">
                      &quot;{contact.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Footer Actions: WhatsApp, Email & Creation Date */}
                <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {contact.phone && (
                      <a
                        href={formatWhatsAppUrl(contact.phone, `Hello ${contact.name}, this is MODE DIGITAL CREATIONS.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3 h-3 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={formatMailtoUrl(contact.email, `MODE DIGITAL CREATIONS - Communication with ${contact.name}`)}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0D52F8] border border-blue-200 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      title="Send Email"
                    >
                      <Mail size={12} />
                      <span>Email</span>
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(contact.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setNewModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingContact ? 'Edit Client Details' : 'Add Client Contact'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingContact
                    ? 'Update profile, organization, or contact phone.'
                    : 'Register a client representative in the directory.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amina Yusuf"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="amina@client.ng"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Sahara Logistics"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Title / Role</label>
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    placeholder="Director of Operations"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relationship Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Key decision maker for enterprise renewal..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                {editingContact ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmContact(editingContact);
                    }}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Client</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer shadow-xs"
                  >
                    {editingContact ? 'Save Changes' : 'Save Contact'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      {deleteConfirmContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteConfirmContact(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-10 text-xs animate-fade-in space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove Client Contact?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-800">{deleteConfirmContact.name}</strong> ({deleteConfirmContact.company || 'Client'}) from the directory?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
              <div><strong>Email:</strong> {deleteConfirmContact.email}</div>
              {deleteConfirmContact.phone && <div><strong>Phone:</strong> {deleteConfirmContact.phone}</div>}
              {deleteConfirmContact.position && <div><strong>Role:</strong> {deleteConfirmContact.position}</div>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmContact(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition cursor-pointer"
              >
                Keep Client
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingle(deleteConfirmContact)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setBulkDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-10 text-xs animate-fade-in space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove Selected Clients?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to remove all <strong className="text-slate-900">{selectedIds.length} selected clients</strong> from the directory? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Yes, Remove All {selectedIds.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
