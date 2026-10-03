import fs from 'fs';
import path from 'path';
import {
  Signal,
  Technology,
  TimelineEvent,
  Release,
  SecurityAdvisory,
  ResearchPaper,
  ProcessingJob,
} from '../types';

export interface PersistentArchiveData {
  signals?: Signal[];
  technologies?: Technology[];
  timelineEvents?: TimelineEvent[];
  releases?: Release[];
  securityAdvisories?: SecurityAdvisory[];
  researchPapers?: ResearchPaper[];
  jobs?: ProcessingJob[];
  lastSavedAt?: string;
}

export class PersistenceEngine {
  private filePath: string;
  private isWriting = false;

  constructor(customPath?: string) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('Unable to create data directory for persistence:', err);
      }
    }
    this.filePath = customPath || path.join(dataDir, 'archive-store.json');
  }

  /**
   * Loads persisted archive records from disk if present
   */
  public load(): PersistentArchiveData | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      if (!raw || !raw.trim()) return null;

      const data: PersistentArchiveData = JSON.parse(raw);
      console.log(
        `[Persistence] Loaded ${data.signals?.length || 0} signals from ${this.filePath}`
      );
      return data;
    } catch (err) {
      console.warn('[Persistence] Failed to read persistent archive file:', err);
      return null;
    }
  }

  /**
   * Persists the current archive state atomically using a temporary file
   */
  public async save(data: PersistentArchiveData): Promise<boolean> {
    if (this.isWriting) {
      return false; // Prevent concurrent write collisions
    }
    this.isWriting = true;

    const tempPath = `${this.filePath}.tmp.${Date.now()}`;
    try {
      const payload: PersistentArchiveData = {
        ...data,
        lastSavedAt: new Date().toISOString(),
      };
      const json = JSON.stringify(payload, null, 2);

      await fs.promises.writeFile(tempPath, json, 'utf-8');
      try {
        await fs.promises.rename(tempPath, this.filePath);
      } catch {
        await fs.promises.copyFile(tempPath, this.filePath);
        await fs.promises.unlink(tempPath).catch(() => {});
      }
      return true;
    } catch (err) {
      console.error('[Persistence] Atomic write failed:', err);
      try {
        if (fs.existsSync(tempPath)) {
          await fs.promises.unlink(tempPath);
        }
      } catch {
        // Ignore unlink error
      }
      return false;
    } finally {
      this.isWriting = false;
    }
  }

  /**
   * Synchronous save for process shutdown or CLI scripts
   */
  public saveSync(data: PersistentArchiveData): boolean {
    const tempPath = `${this.filePath}.tmp.${Date.now()}`;
    try {
      const payload: PersistentArchiveData = {
        ...data,
        lastSavedAt: new Date().toISOString(),
      };
      const json = JSON.stringify(payload, null, 2);
      fs.writeFileSync(tempPath, json, 'utf-8');
      try {
        fs.renameSync(tempPath, this.filePath);
      } catch {
        fs.copyFileSync(tempPath, this.filePath);
        try { fs.unlinkSync(tempPath); } catch {}
      }
      return true;
    } catch (err) {
      console.error('[Persistence] Synchronous write failed:', err);
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch {
        // Ignore
      }
      return false;
    }
  }
}

export const persistenceEngine = new PersistenceEngine();
