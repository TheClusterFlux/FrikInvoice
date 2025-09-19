// Frontend logging utility
// Can be easily disabled for production by setting LOG_LEVEL to 'none'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 999
};

// Get log level from environment variable or default to 'debug' in development
const getLogLevel = (): LogLevel => {
  const envLevel = process.env.REACT_APP_LOG_LEVEL as LogLevel;
  if (envLevel && LOG_LEVELS.hasOwnProperty(envLevel)) {
    return envLevel;
  }
  
  // Default to debug in development, warn in production
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
};

const currentLogLevel = getLogLevel();

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
};

const formatMessage = (level: string, component: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
  
  if (data !== undefined) {
    return `${baseMessage} | Data: ${JSON.stringify(data, null, 2)}`;
  }
  
  return baseMessage;
};

export const logger = {
  debug: (component: string, message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', component, message, data));
    }
  },
  
  info: (component: string, message: string, data?: any) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', component, message, data));
    }
  },
  
  warn: (component: string, message: string, data?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', component, message, data));
    }
  },
  
  error: (component: string, message: string, data?: any) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', component, message, data));
    }
  }
};

// Export for easy access
export default logger;
