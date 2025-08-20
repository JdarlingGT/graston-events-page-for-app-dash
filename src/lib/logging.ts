/**
 * Structured logging utilities with correlation ID support.
 *
 * Adds a correlation ID to every log entry to make tracing easy across services.
 * Correlation ID strategy:
 *  - Honors incoming 'x-correlation-id' from the request if present
 *  - Otherwise generates a new ID and can be set by middleware on the response
 *
 * Safe for server runtime (console.* based). In production you can route to
 * a proper logger (e.g., pino, winston) while preserving the interface here.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  correlationId?: string;
  context?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  timestamp: string; // ISO
  message: string;
  correlationId?: string;
  meta?: Record<string, unknown>;
}

/**
 * Derive correlation id from request headers or provided fallback string.
 */
export function getCorrelationId(headers?: Headers, fallback?: string): string | undefined {
  const fromHeader = headers?.get('x-correlation-id') || headers?.get('X-Correlation-Id');
  return fromHeader ?? fallback;
}

/**
 * Generate a lightweight correlation id (UUID-like) without external deps.
 */
export function generateCorrelationId(): string {
  // Pseudo-UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Emit a structured log.
 */
export function log(level: LogLevel, message: string, meta?: LogMeta) {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    correlationId: meta?.correlationId,
    meta: sanitizeMeta(meta),
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case 'debug':
    case 'info':
      console.log(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    case 'error':
      console.error(line);
      break;
  }
}

function sanitizeMeta(meta?: LogMeta): Record<string, unknown> | undefined {
  if (!meta) {
return undefined;
}
  const { correlationId, ...rest } = meta;
  // Avoid circular structures by safe-stringifying objects if needed
  try {
    JSON.stringify(rest);
    return rest;
  } catch {
    return { meta: '[unserializable]' };
  }
}

// Convenience wrappers
export const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};

/**
 * Create a child logger bound to a fixed correlationId and optional context.
 */
export function createRequestLogger(correlationId?: string, context?: string) {
  const base: LogMeta = { correlationId, context };
  return {
    debug: (message: string, meta?: LogMeta) =>
      logger.debug(message, { ...base, ...meta }),
    info: (message: string, meta?: LogMeta) =>
      logger.info(message, { ...base, ...meta }),
    warn: (message: string, meta?: LogMeta) =>
      logger.warn(message, { ...base, ...meta }),
    error: (message: string, meta?: LogMeta) =>
      logger.error(message, { ...base, ...meta }),
  };
}