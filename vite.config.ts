import {randomUUID} from 'node:crypto';
import {defineConfig} from 'vite';

// Evaluated once per Vite server start (or production build). Every browser
// served by that process receives the same ID, while a restart gets a new room.
const sessionId = randomUUID();
export default defineConfig({
  define: {__OTT_SESSION_ID__: JSON.stringify(sessionId)},
});
