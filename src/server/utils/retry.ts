/**
 * TechFossil Robust Retry and Network Utility
 * Implements exponential backoff with jitter and timeout abort control.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  backoffFactor?: number;
  timeoutMs?: number;
  retryOn?: (error: unknown) => boolean;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialBackoffMs = options.initialBackoffMs ?? 800;
  const maxBackoffMs = options.maxBackoffMs ?? 8000;
  const backoffFactor = options.backoffFactor ?? 2;
  const retryOn = options.retryOn ?? (() => true);

  let attempt = 0;
  let currentBackoff = initialBackoffMs;

  while (true) {
    try {
      attempt++;
      return await fn();
    } catch (err: unknown) {
      if (attempt > maxRetries || !retryOn(err)) {
        throw err;
      }

      // Add full jitter (0 to currentBackoff)
      const jitter = Math.random() * (currentBackoff * 0.3);
      const delay = Math.min(currentBackoff + jitter, maxBackoffMs);
      
      console.warn(
        `[Retry] Attempt ${attempt}/${maxRetries} failed: ${err instanceof Error ? err.message : String(err)}. Retrying in ${Math.round(delay)}ms...`
      );

      await sleep(delay);
      currentBackoff *= backoffFactor;
    }
  }
}

/**
 * Fetch wrapper with AbortController timeout and standard User-Agent header
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 9000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has('User-Agent')) {
      headers.set('User-Agent', 'TechFossil-Intelligence-Archive/1.0 (+https://github.com/techfossil/archive)');
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json, application/xml, text/xml, */*');
    }

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    return res;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
