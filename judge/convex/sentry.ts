// convex/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export const sentryWrap = (handler: any) => {
  return async (ctx: any, args: any) => {
    try {
      return await handler(ctx, args);
    } catch (err) {
      Sentry.captureException(err, {
        extra: {
          args,
          user: ctx?.auth?.identity ?? null,
        },
      });
      throw err;
    }
  };
};
