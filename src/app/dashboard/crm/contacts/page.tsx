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
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate, formatWhatsAppUrl, formatMailtoUrl } from '@/lib/utils';

const WhatsAppIcon = ({ className = "w-3 h-3 fill-current" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactsPage() {
  const { contacts, addContact } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New Contact Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');

  const filteredContacts = contacts.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.company.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addContact({
      name,
      email,
      phone,
      company,
      position,
      notes,
      isActive: true,
    });

    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setPosition('');
    setNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client & Executive Contacts
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {contacts.length} Verified Contacts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Decision makers, project sponsors, and billing contacts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#0D52F8] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contact name or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D52F8] flex items-center justify-center font-bold text-sm">
                {contact.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">{contact.name}</h3>
                <span className="text-[11px] text-slate-500">{contact.position} • {contact.company}</span>
              </div>
            </div>

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
            </div>

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
              <span className="text-[10px] text-slate-400">
                {formatDate(contact.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Contact Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setNewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Add Client Contact</h2>
            <form onSubmit={handleCreate} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amina Yusuf"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Title / Role</label>
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    placeholder="Director of Operations"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
