type LogLevel = 'info' | 'warn' | 'error';

const formatMessage = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${
    meta ? ` | ${JSON.stringify(meta)}` : ''
  }`;
};

const log = (level: LogLevel, message: string, meta?: unknown) => {
  const formatted = formatMessage(level, message, meta);
  switch (level) {
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
    default:
      console.log(formatted);
  }
};

export const logger = {
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
};
