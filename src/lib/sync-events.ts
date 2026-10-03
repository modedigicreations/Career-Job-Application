import { EventEmitter } from 'events';

class SyncBroadcaster extends EventEmitter {}

// Preserve singleton across hot reloads in development
const globalForSync = globalThis as unknown as { syncBroadcaster?: SyncBroadcaster };

export const syncBroadcaster = globalForSync.syncBroadcaster || new SyncBroadcaster();
syncBroadcaster.setMaxListeners(200);

if (process.env.NODE_ENV !== 'production') {
  globalForSync.syncBroadcaster = syncBroadcaster;
}

export interface SyncBroadcastMessage {
  type: 'delta' | 'snapshot' | 'ping';
  entity?: string;
  action?: 'upsert' | 'delete';
  item?: any;
  id?: string;
  timestamp: string;
}

export function broadcastSyncEvent(message: SyncBroadcastMessage) {
  try {
    syncBroadcaster.emit('sync_event', message);
  } catch (err) {
    console.error('[SyncBroadcaster] Broadcast error:', err);
  }
}
