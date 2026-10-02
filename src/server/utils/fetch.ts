export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  timeoutMs?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    backoffMs = 1000,
    timeoutMs = 15000,
    headers,
    ...restOptions
  } = options;

  const userAgent =
    'TechFossil-Ingestion-Bot/1.0 (+https://github.com/techfossil/archive)';

  const mergedHeaders: HeadersInit = {
    'User-Agent': userAgent,
    Accept: 'application/json, application/xml, text/xml, text/plain, */*',
    ...(headers || {}),
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (attempt < retries) {
          const delay = backoffMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < retries) {
        const delay = backoffMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} retries`);
}
