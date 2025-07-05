class Logger {
    error(message: string, context?: Record<string, unknown>) {
      console.error(message, context);
      // In production, integrate with logging services like Sentry, Datadog, etc.
    }
  }
  
  export const logger = new Logger();