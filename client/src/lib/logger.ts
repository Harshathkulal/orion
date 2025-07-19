class Logger {
  info(message: string, context?: Record<string, unknown>) {
    console.info(`[INFO]: ${message}`, context ?? {});
    // Sentry.captureMessage(message, { level: 'info', ...context });
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[WARN]: ${message}`, context ?? {});

    //Send to external logging tool
  }

  error(message: string, context?: Record<string, unknown>) {
    console.error(`[ERROR]: ${message}`, context ?? {});

    // Send to Datadog, Sentry,.
    // (Datadog with dd-trace):
    // if (process.env.NODE_ENV === "production") {
    //   tracer.trace("logger.error", { resource: message }, (span) => {
    //     if (context) span.setTags(context);
    //     span.finish();
    //   });
    // }
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG]: ${message}`, context ?? {});
    }
  }
}

export const logger = new Logger();
