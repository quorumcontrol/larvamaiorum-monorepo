import { memoize } from "./memoize";
import { Client } from 'colyseus.js'

export const client = memoize(() => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    if (params.get('localarena')) {
      return new Client("ws://localhost:2567")
    }
  }
  return new Client("wss://zh8smr.colyseus.de")
})

