export type ServiceErrorCode = "NOT_FOUND" | "VALIDATION_ERROR" | "FORBIDDEN" | "CONFLICT" | "MOCK_FAILURE" | "ABORTED";

export interface ServiceErrorShape {
  code: ServiceErrorCode;
  message: string;
  status: number;
  retryable: boolean;
  fieldErrors?: Record<string, string>;
}

export class MockApiError extends Error implements ServiceErrorShape {
  readonly code: ServiceErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors?: Record<string, string>;

  constructor(shape: ServiceErrorShape) {
    super(shape.message);
    this.name = "MockApiError";
    this.code = shape.code;
    this.status = shape.status;
    this.retryable = shape.retryable;
    this.fieldErrors = shape.fieldErrors;
  }
}

export interface MockServiceOptions {
  delayMs?: number;
  fail?: boolean;
  signal?: AbortSignal;
}

export type AsyncState<T> =
  | { status: "idle"; data?: undefined; error?: undefined }
  | { status: "loading"; data?: T; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: T; error: ServiceErrorShape };

export const asyncState = {
  idle<T>(): AsyncState<T> {
    return { status: "idle" };
  },
  loading<T>(data?: T): AsyncState<T> {
    return { status: "loading", data };
  },
  success<T>(data: T): AsyncState<T> {
    return { status: "success", data };
  },
  error<T>(error: ServiceErrorShape, data?: T): AsyncState<T> {
    return { status: "error", error, data };
  },
};

export function toServiceError(error: unknown): ServiceErrorShape {
  if (error instanceof MockApiError) {
    return { code: error.code, message: error.message, status: error.status, retryable: error.retryable, fieldErrors: error.fieldErrors };
  }
  return { code: "MOCK_FAILURE", message: "The mock service could not complete the request.", status: 500, retryable: true };
}

export function createMockId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function simulateRequest<T>(operation: () => T, options: MockServiceOptions = {}): Promise<T> {
  const { delayMs = 280, fail = false, signal } = options;

  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new MockApiError({ code: "ABORTED", message: "The request was cancelled.", status: 499, retryable: true }));
      return;
    }

    const handleAbort = () => {
      clearTimeout(timer);
      reject(new MockApiError({ code: "ABORTED", message: "The request was cancelled.", status: 499, retryable: true }));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      if (fail) {
        reject(new MockApiError({ code: "MOCK_FAILURE", message: "Simulated network error. Try the action again.", status: 503, retryable: true }));
        return;
      }
      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    }, Math.max(0, delayMs));

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}
