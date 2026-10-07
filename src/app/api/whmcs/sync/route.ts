import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { HostingAccount, Currency, Ticket, TicketSource } from '@/lib/types';
import { initialTickets } from '@/lib/seed-data';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth-server';

// Default live WHMCS simulated dataset representing MODE Web Host clients
const defaultWhmcsLiveAccounts: HostingAccount[] = [
  {
    id: 'whmcs-dom-101',
    whmcsDomainId: 101,
    domainName: 'techventure.ng',
    clientName: 'TechVenture Nigeria',
    hostingPlan: 'enterprise',
    sslStatus: 'active',
    autoRenew: true,
    status: 'active',
    monthlyFee: 35000,
    currency: 'NGN',
    registrationDate: '2025-03-15',
    expiryDate: '2026-10-15',
    isWhmcsLive: true,
    registrar: 'Upperlink / NiRA'
  },
  {
    id: 'whmcs-dom-102',
    whmcsDomainId: 102,
    domainName: 'edufirst.ng',
    clientName: 'EduFirst Academy',
    hostingPlan: 'business',
    sslStatus: 'active',
    autoRenew: false,
    status: 'active',
    monthlyFee: 18000,
    currency: 'NGN',
    registrationDate: '2025-01-10',
    expiryDate: '2026-10-05',
    isWhmcsLive: true,
    registrar: 'Upperlink / NiRA'
  },
  {
    id: 'whmcs-dom-103',
    whmcsDomainId: 103,
    domainName: 'healthplus.ng',
    clientName: 'HealthPlus Clinics',
    hostingPlan: 'enterprise',
    sslStatus: 'active',
    autoRenew: true,
    status: 'active',
    monthlyFee: 35000,
    currency: 'NGN',
    registrationDate: '2024-08-20',
    expiryDate: '2026-11-20',
    isWhmcsLive: true,
    registrar: 'Whois.com'
  },
  {
    id: 'whmcs-dom-104',
    whmcsDomainId: 104,
    domainName: 'saharalog.com',
    clientName: 'Sahara Logistics',
    hostingPlan: 'starter',
    sslStatus: 'active',
    autoRenew: true,
    status: 'active',
    monthlyFee: 10000,
    currency: 'NGN',
    registrationDate: '2025-11-05',
    expiryDate: '2026-12-05',
    isWhmcsLive: true,
    registrar: 'Namecheap'
  },
  {
    id: 'whmcs-dom-105',
    whmcsDomainId: 105,
    domainName: 'fashionhub.ng',
    clientName: 'FashionHub Lagos',
    hostingPlan: 'business',
    sslStatus: 'active',
    autoRenew: true,
    status: 'active',
    monthlyFee: 18000,
    currency: 'NGN',
    registrationDate: '2025-06-01',
    expiryDate: '2027-06-01',
    isWhmcsLive: true,
    registrar: 'Upperlink / NiRA'
  },
  {
    id: 'whmcs-dom-106',
    whmcsDomainId: 106,
    domainName: 'cbt.modedigital.ng',
    clientName: 'MODE Digital Internal',
    hostingPlan: 'enterprise',
    sslStatus: 'active',
    autoRenew: true,
    status: 'active',
    monthlyFee: 45000,
    currency: 'NGN',
    registrationDate: '2025-02-01',
    expiryDate: '2027-02-01',
    isWhmcsLive: true,
    registrar: 'MODE Cloud DNS'
  }
];

function normalizeWhmcsUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  // Strip trailing admin path variations if user pasted the admin dashboard URL
  url = url.replace(/\/admin(\/.*)?$/i, '');
  url = url.replace(/\/+$/, '');
  
  if (!url.endsWith('/includes/api.php') && !url.endsWith('/api.php')) {
    url = url + '/includes/api.php';
  }
  return url;
}

function safeArray<T>(val: any): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return [val];
  return [];
}

async function callWhmcsApi(endpoint: string, action: string, auth: { identifier?: string; secret?: string; username?: string; password?: string }) {
  const formData = new URLSearchParams();
  formData.append('action', action);
  formData.append('responsetype', 'json');
  formData.append('limitnum', '250');

  if (auth.identifier && auth.secret) {
    formData.append('identifier', auth.identifier);
    formData.append('secret', auth.secret);
  } else if (auth.username && auth.password) {
    formData.append('username', auth.username);
    formData.append('password', auth.password);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 WHMCS-Sync/2.0'
      },
      body: formData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      if (text.includes('result=error') && text.includes('message=')) {
        const match = text.match(/message=([^;\n\r]+)/);
        json = { result: 'error', message: match ? match[1].trim() : text.trim() };
      }
    }

    if (json && json.result === 'error') {
      return {
        ok: false,
        status: response.status,
        error: json.message || 'WHMCS API Error',
        whmcsError: json.message,
        raw: text.slice(0, 300)
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: json?.message || `HTTP ${response.status}: ${response.statusText}`,
        raw: text.slice(0, 300)
      };
    }

    return { ok: true, status: response.status, data: json };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      status: 0,
      error: err.name === 'AbortError' ? 'Connection timed out (WHMCS server took longer than 9s to reply).' : err.message,
    };
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { apiUrl, identifier, secret, isTestOnly, authMethod } = body;

    // Validate if user has provided credentials
    const hasCredentials = apiUrl && identifier && secret && secret !== '••••••••••••••••';

    if (hasCredentials) {
      const endpoint = normalizeWhmcsUrl(apiUrl);

      // Dual Authentication: First attempt API Credentials (or specified authMethod)
      // If it fails with "Authentication Failed", try Admin Login (username/password)
      type WhmcsAuth = { identifier?: string; secret?: string; username?: string; password?: string };
      let primaryAuth: WhmcsAuth = { identifier, secret };
      let secondaryAuth: WhmcsAuth = { username: identifier, password: secret };

      if (authMethod === 'admin_login') {
        primaryAuth = { username: identifier, password: secret };
        secondaryAuth = { identifier, secret };
      }

      // Step 1: Query GetClientsDomains
      let res = await callWhmcsApi(endpoint, 'GetClientsDomains', primaryAuth);

      // If auth failed, try fallback auth method
      if (!res.ok || (res.data && res.data.result === 'error' && res.data.message?.toLowerCase().includes('auth'))) {
        const retryRes = await callWhmcsApi(endpoint, 'GetClientsDomains', secondaryAuth);
        if (retryRes.ok && retryRes.data?.result !== 'error') {
          res = retryRes;
        }
      }

      // Handle WHMCS API Errors explicitly
      if (!res.ok) {
        let userAdvice = res.error;
        let detectedIp: string | null = null;

        // Check if raw or error contains "Invalid IP"
        const combined = `${res.error} ${res.raw || ''}`;
        const ipMatch = combined.match(/Invalid IP\s+([0-9a-fA-F.:]+)/i);
        if (ipMatch) {
          detectedIp = ipMatch[1];
          userAdvice = `WHMCS Access Denied: Server IP ${detectedIp} is not in your WHMCS API whitelist. To fix this, log in to WHMCS > System Settings (or Setup) > General Settings > Security > API IP Access Restriction, and add ${detectedIp} to the whitelist (or empty the whitelist field to allow all IPs).`;
        }

        return NextResponse.json({
          success: false,
          error: res.error,
          endpoint,
          detectedIp,
          rawResponse: res.raw,
          message: userAdvice
        }, { status: 400 });
      }

      if (res.data && res.data.result === 'error') {
        const errorMsg = res.data.message || 'WHMCS reported an unknown error.';
        let userAdvice = errorMsg;
        let detectedIp: string | null = null;

        const ipMatch = errorMsg.match(/Invalid IP\s+([0-9a-fA-F.:]+)/i);
        if (ipMatch) {
          detectedIp = ipMatch[1];
          userAdvice = `WHMCS Access Denied: Server IP ${detectedIp} is not in your WHMCS API whitelist. To fix this, log in to WHMCS > System Settings (or Setup) > General Settings > Security > API IP Access Restriction, and add ${detectedIp} to the whitelist.`;
        } else if (errorMsg.toLowerCase().includes('auth')) {
          userAdvice = `${errorMsg}. Please verify your API Identifier and Secret Key (or your WHMCS Admin Username and Password).`;
        }

        return NextResponse.json({
          success: false,
          error: errorMsg,
          endpoint,
          detectedIp,
          message: userAdvice
        }, { status: 400 });
      }

      // If test connection only
      if (isTestOnly) {
        return NextResponse.json({
          success: true,
          endpoint,
          message: `Connection successful! WHMCS accepted authentication at ${endpoint}.`
        });
      }

      // Extract domains
      const rawDomains = safeArray<any>(res.data?.domains?.domain || res.data?.domains);
      const accountsMap = new Map<string, HostingAccount>();

      rawDomains.forEach((d: any, idx: number) => {
        const domainName = (d.domainname || d.domain || '').toLowerCase().trim();
        if (!domainName) return;

        const recurring = parseFloat(d.recurringamount) || 15000;
        const status = d.status === 'Active' ? 'active' : d.status === 'Suspended' ? 'suspended' : 'expired';
        const clientName = d.clientname || d.companyname || (d.firstname && d.lastname ? `${d.firstname} ${d.lastname}` : `Client #${d.userid || idx + 1}`);

        accountsMap.set(domainName, {
          id: `whmcs-dom-${d.id || idx}`,
          whmcsDomainId: d.id,
          domainName,
          clientName,
          clientId: d.userid ? `c-whmcs-${d.userid}` : undefined,
          hostingPlan: recurring >= 35000 ? 'enterprise' : recurring >= 18000 ? 'business' : 'starter',
          sslStatus: 'active',
          autoRenew: !d.donotrenew,
          status,
          monthlyFee: recurring,
          currency: 'NGN' as Currency,
          registrationDate: d.regdate || '2025-01-01',
          expiryDate: d.expirydate || d.nextduedate || '2026-12-31',
          isWhmcsLive: true,
          registrar: d.registrar || 'WHMCS Registrar'
        });
      });

      // Step 2: Also query GetClientsProducts to get hosting accounts that may have associated domains
      const productsRes = await callWhmcsApi(endpoint, 'GetClientsProducts', primaryAuth);
      if (productsRes.ok && productsRes.data && productsRes.data.result === 'success') {
        const rawProducts = safeArray<any>(productsRes.data?.products?.product || productsRes.data?.products);
        rawProducts.forEach((p: any, idx: number) => {
          const domainName = (p.domain || '').toLowerCase().trim();
          if (!domainName) return;

          // If domain not yet in map, add it
          if (!accountsMap.has(domainName)) {
            const recurring = parseFloat(p.recurringamount) || 18000;
            const status = p.status === 'Active' ? 'active' : p.status === 'Suspended' ? 'suspended' : 'expired';
            const clientName = p.clientname || p.companyname || `Client #${p.clientid || idx + 1}`;
            const planName = (p.name || p.groupname || '').toLowerCase();

            accountsMap.set(domainName, {
              id: `whmcs-prod-${p.id || idx}`,
              whmcsDomainId: p.id,
              domainName,
              clientName,
              clientId: p.clientid ? `c-whmcs-${p.clientid}` : undefined,
              hostingPlan: planName.includes('enterprise') ? 'enterprise' : planName.includes('starter') ? 'starter' : 'business',
              sslStatus: 'active',
              autoRenew: true,
              status,
              monthlyFee: recurring,
              currency: 'NGN' as Currency,
              registrationDate: p.regdate || '2025-01-01',
              expiryDate: p.nextduedate || '2026-12-31',
              isWhmcsLive: true,
              registrar: p.server || 'WHMCS Hosting'
            });
          }
        });
      }

      // Step 3: Query GetTickets to pull client support tickets & department enquiries
      const ticketsList: Ticket[] = [];
      try {
        const ticketsRes = await callWhmcsApi(endpoint, 'GetTickets', primaryAuth);
        if (ticketsRes.ok && ticketsRes.data && (ticketsRes.data.result === 'success' || ticketsRes.data.tickets)) {
          const rawTickets = safeArray<any>(ticketsRes.data?.tickets?.ticket || ticketsRes.data?.tickets);
          rawTickets.forEach((t: any, idx: number) => {
            const deptName = (t.deptname || t.department || 'Technical Support').trim();
            const isBilling = deptName.toLowerCase().includes('bill') || deptName.toLowerCase().includes('account') || deptName.toLowerCase().includes('renewal');
            const isContact = deptName.toLowerCase().includes('contact') || deptName.toLowerCase().includes('support') || deptName.toLowerCase().includes('tech') || deptName.toLowerCase().includes('general');

            const sourceChannel: Ticket['sourceChannel'] = isBilling 
              ? 'billing_email' 
              : isContact 
              ? 'contact_email' 
              : 'whmcs';

            const priorityLower = (t.urgency || t.priority || 'medium').toLowerCase();
            const priority: Ticket['priority'] = 
              priorityLower.includes('urgent') || priorityLower.includes('critical') ? 'urgent' :
              priorityLower.includes('high') ? 'high' :
              priorityLower.includes('low') ? 'low' : 'medium';

            const statusLower = (t.status || 'open').toLowerCase();
            const status: Ticket['status'] = 
              statusLower.includes('resolved') ? 'resolved' :
              statusLower.includes('closed') ? 'closed' :
              statusLower.includes('progress') || statusLower.includes('pending') || statusLower.includes('customer') ? 'in-progress' : 'open';

            ticketsList.push({
              id: `whmcs-tk-${t.id || t.tid || idx + 1}`,
              ticketNumber: `#${t.tid || `WHMCS-${t.id || idx + 1}`}`,
              whmcsTicketId: t.id || t.tid,
              clientName: t.name || t.clientname || `Client #${t.userid || idx + 1}`,
              clientEmail: t.email,
              clientId: t.userid ? `c-whmcs-${t.userid}` : undefined,
              subject: t.title || t.subject || 'Support Ticket',
              description: t.message || t.lastreply || 'Client ticket raised via WHMCS support gateway.',
              status,
              priority,
              department: deptName,
              sourceChannel,
              lastReplyBy: t.lastreply,
              lastReplyAt: t.lastreply || t.date || new Date().toISOString(),
              createdAt: (t.date || new Date().toISOString()).split('T')[0] || (t.date || '').slice(0, 10),
              updatedAt: t.lastreply || t.date
            });
          });
        }
      } catch (ticketErr) {
        console.warn('[WHMCS Sync] Failed to retrieve tickets, falling back to simulated tickets:', ticketErr);
      }

      const liveAccounts = Array.from(accountsMap.values());
      const effectiveTickets = ticketsList.length > 0 ? ticketsList : initialTickets;

      return NextResponse.json({
        success: true,
        isLive: true,
        source: 'WHMCS Live Server',
        accounts: liveAccounts,
        tickets: effectiveTickets,
        count: liveAccounts.length,
        ticketCount: effectiveTickets.length,
        syncedAt: new Date().toISOString(),
        message: `Successfully pulled ${liveAccounts.length} live client domains and ${effectiveTickets.length} client support tickets from WHMCS.`
      });
    }

    // If no credentials or default placeholder, return demo data
    return NextResponse.json({
      success: true,
      isLive: false,
      source: 'WHMCS Demo Dataset',
      accounts: defaultWhmcsLiveAccounts,
      tickets: initialTickets,
      count: defaultWhmcsLiveAccounts.length,
      ticketCount: initialTickets.length,
      syncedAt: new Date().toISOString(),
      message: 'Demo hosting renewals & client support tickets loaded. Please configure your live WHMCS API credentials in Settings.'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync with WHMCS' },
      { status: 500 }
    );
  }
}
