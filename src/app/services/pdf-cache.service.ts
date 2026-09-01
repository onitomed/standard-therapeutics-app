import { Injectable } from '@angular/core';

export interface CachedPdf {
  etag: string;
  blob: Blob;
  cachedAt: number;
}

const DB_NAME = 'standard-therapeutics-pdf-cache';
const DB_VERSION = 1;
const STORE_NAME = 'pdfs';

// A minimal IndexedDB-backed cache for downloaded report PDFs, keyed by
// caller-supplied string (the reports page uses the patient id, so
// different patients logged into the same browser never see each other's
// cached file). Paired with the ETag the backend now sends, so a repeat
// visit can render instantly from here while a background conditional
// request confirms nothing changed.
@Injectable({
  providedIn: 'root'
})
export class PdfCacheService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
          reject(new Error('IndexedDB not available'));
          return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  async get(key: string): Promise<CachedPdf | undefined> {
    try {
      const db = await this.openDb();
      return await new Promise<CachedPdf | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result as CachedPdf | undefined);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // IndexedDB unavailable (private browsing, disabled, quota, ...) —
      // caller just falls back to a normal network fetch every time.
      return undefined;
    }
  }

  async set(key: string, etag: string, blob: Blob): Promise<void> {
    try {
      const db = await this.openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({ etag, blob, cachedAt: Date.now() }, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Best-effort cache — a write failure shouldn't break the report view.
    }
  }
}
