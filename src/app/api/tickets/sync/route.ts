import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Ticket, TicketSource } from '@/lib/types';
import { initialTickets } from '@/lib/seed-data';
import { broadcastSyncEvent } from '@/lib/sync-events';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'mode-ops-db.json');

function readTicketsFromDb(): Ticket[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.tickets) && parsed.tickets.length > 0) {
        return parsed.tickets;
      }
    }
  } catch (err) {
    console.error('[API /api/tickets/sync] Error reading tickets:', err);
  }
  return initialTickets;
}

function saveTicketsToDb(tickets: Ticket[]) {
  try {
    let currentDb: any = {};
    if (fs.existsSync(DB_PATH)) {
      currentDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
    currentDb.tickets = tickets;
    currentDb.ticketsLastUpdated = new Date().toISOString();
    currentDb.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(currentDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[API /api/tickets/sync] Error saving tickets:', err);
  }
}

export async function GET() {
  const tickets = readTicketsFromDb();
  const whmcsCount = tickets.filter(t => t.sourceChannel === 'whmcs').length;
  const contactMailCount = tickets.filter(t => t.sourceChannel === 'contact_email').length;
  const billingMailCount = tickets.filter(t => t.sourceChannel === 'billing_email').length;

  return NextResponse.json({
    success: true,
    tickets,
    totalCount: tickets.length,
    breakdown: {
      whmcs: whmcsCount,
      contactEmail: contactMailCount,
      billingEmail: billingMailCount
    },
    channels: [
      'WHMCS Portal',
      'contact@modewebhost.com.ng',
      'billing@modewebhost.com.ng'
    ]
  });
}

/**
 * Webhook & Email Ingestion Handler
 * Accepts automated tickets piped from contact@modewebhost.com.ng, billing@modewebhost.com.ng, or WHMCS webhooks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existingTickets = readTicketsFromDb();
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    // Detect channel from recipient or explicit channel property
    const recipient = (body.recipient || body.to || '').toLowerCase().trim();
    const isBilling = recipient.includes('billing@') || body.channel === 'billing' || (body.department || '').toLowerCase().includes('bill');
    const isContact = recipient.includes('contact@') || body.channel === 'contact' || (body.department || '').toLowerCase().includes('tech') || (body.department || '').toLowerCase().includes('support');
    const isWhmcs = body.sourceChannel === 'whmcs' || body.source === 'whmcs' || !!body.whmcsTicketId;

    const sourceChannel: TicketSource = isBilling ? 'billing_email' : isContact ? 'contact_email' : isWhmcs ? 'whmcs' : 'portal';

    const department = isBilling 
      ? 'Billing & Renewals' 
      : isContact 
      ? 'Technical Support' 
      : (body.department || 'Technical Support');

    const prefix = isBilling ? 'MWH-BIL' : isContact ? 'MWH-CNT' : 'WHMCS';
    const ticketSeq = Math.floor(100 + Math.random() * 900);
    const ticketNumber = body.ticketNumber || `#${prefix}-${ticketSeq}`;

    const newTicket: Ticket = {
      id: body.id || `tk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticketNumber,
      clientName: body.clientName || body.senderName || (body.email ? body.email.split('@')[0] : 'Client'),
      clientEmail: body.clientEmail || body.email || body.sender,
      clientId: body.clientId,
      subject: body.subject || 'Support Enquiry',
      description: body.description || body.message || body.body || 'No description provided.',
      status: body.status || 'open',
      priority: body.priority || (isBilling ? 'medium' : 'high'),
      department,
      sourceChannel,
      whmcsTicketId: body.whmcsTicketId,
      assignedTo: body.assignedTo,
      assignedStaffName: body.assignedStaffName,
      lastReplyAt: nowIso,
      createdAt: body.createdAt || today,
      updatedAt: nowIso
    };

    const updatedTickets = [newTicket, ...existingTickets.filter(t => t.id !== newTicket.id)];
    saveTicketsToDb(updatedTickets);

    // Broadcast in real-time across connected dashboards via SSE!
    broadcastSyncEvent({
      type: 'delta',
      entity: 'tickets',
      action: 'upsert',
      item: newTicket,
      timestamp: nowIso
    });

    return NextResponse.json({
      success: true,
      message: `Ticket ${newTicket.ticketNumber} ingested successfully via ${newTicket.sourceChannel}.`,
      ticket: newTicket
    });
  } catch (err: any) {
    console.error('[API /api/tickets/sync] Error ingesting ticket:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to ingest ticket' },
      { status: 500 }
    );
  }
}
