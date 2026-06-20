type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: number = (() => {
  if (typeof process === 'undefined') return LOG_LEVELS.info;
  switch (process.env.LOG_LEVEL) {
    case 'debug': return LOG_LEVELS.debug;
    case 'info': return LOG_LEVELS.info;
    case 'warn': return LOG_LEVELS.warn;
    case 'error': return LOG_LEVELS.error;
    default: return process.env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.debug;
  }
})();

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}] [${context}]`;
  if (data === undefined) return `${prefix} ${message}`;
  return `${prefix} ${message} ${JSON.stringify(data)}`;
}

export const logger = {
  debug(context: string, message: string, data?: unknown): void {
    if (LOG_LEVELS.debug < currentLevel) return;
    console.debug(formatMessage('debug', context, message, data));
  },

  info(context: string, message: string, data?: unknown): void {
    if (LOG_LEVELS.info < currentLevel) return;
    console.log(formatMessage('info', context, message, data));
  },

  warn(context: string, message: string, data?: unknown): void {
    if (LOG_LEVELS.warn < currentLevel) return;
    console.warn(formatMessage('warn', context, message, data));
  },

  error(context: string, message: string, data?: unknown): void {
    if (LOG_LEVELS.error < currentLevel) return;
    console.error(formatMessage('error', context, message, data));
  },
};
