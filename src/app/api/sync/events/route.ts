import { cookies } from 'next/headers';
import { syncBroadcaster } from '@/lib/sync-events';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      try {
        controller.enqueue(
          encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`)
        );
      } catch {
        // Stream closed early
      }

      const onEvent = (msg: any) => {
        try {
          controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(msg)}\n\n`));
        } catch {
          // Stream error or client disconnected
        }
      };

      syncBroadcaster.on('sync_event', onEvent);

      // Heartbeat ping every 25 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      cleanup = () => {
        syncBroadcaster.off('sync_event', onEvent);
        clearInterval(pingInterval);
      };
    },
    cancel() {
      if (cleanup) cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
      'X-Accel-Buffering': 'no', // Disable buffering on Nginx/Cloudflare
    },
  });
}
