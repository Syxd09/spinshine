type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type TelemetryEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __telemetryEvents?: TelemetryEvents;
    __reportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
    // Keep legacy fallback references as undefined to prevent crash if external preview runs
    __lovableEvents?: unknown;
    __lovableReportRuntimeError?: unknown;
  }
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.__telemetryEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  window.__reportRuntimeError?.({
    message,
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
  });
}
