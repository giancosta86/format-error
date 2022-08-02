export type FormatErrorOptions = Readonly<{
  showClass: boolean;
  showMessage: boolean;
  showCauseChain: boolean;
  showStackTrace: boolean;
}>;

const DEFAULT_OPTIONS = {
  showClass: true,
  showMessage: true,
  showCauseChain: false,
  showStackTrace: false
} as FormatErrorOptions;

export function formatError(
  error: unknown,
  options?: Partial<FormatErrorOptions>
): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const actualOptions = { ...DEFAULT_OPTIONS, ...options };

  validateOptions(actualOptions);

  const buffer: string[] = [];

  formatErrorToBuffer(error, actualOptions, buffer);

  if (actualOptions.showStackTrace) {
    formatStackTrace(error, buffer);
  }

  return buffer.join("");
}

function validateOptions(options: FormatErrorOptions): void {
  if (!(options.showClass || options.showMessage)) {
    throw new Error(
      "Cannot format an error when neither its class nor its message is requested"
    );
  }
}

function formatErrorToBuffer(
  error: Error,
  options: FormatErrorOptions,
  buffer: string[]
): void {
  formatCoreInfo(error, options, buffer);

  if (options.showCauseChain && error.cause) {
    formatCause(error.cause, options, buffer);
  }
}

function formatCoreInfo(
  error: Error,
  options: FormatErrorOptions,
  buffer: string[]
): void {
  if (options.showClass) {
    buffer.push(error.constructor.name);

    if (options.showMessage) {
      buffer.push("(");

      if (error.message) {
        buffer.push('"');
      }
    }
  }

  if (options.showMessage) {
    buffer.push(error.message);

    if (options.showClass) {
      if (error.message) {
        buffer.push('"');
      }

      buffer.push(")");
    }
  }
}

function formatCause(
  cause: Error,
  options: FormatErrorOptions,
  buffer: string[]
): void {
  buffer.push(". Cause: ");
  formatErrorToBuffer(cause, options, buffer);
}

function formatStackTrace(error: Error, buffer: string[]): void {
  if (!error.stack) {
    return;
  }

  buffer.push("\n");
  buffer.push(error.stack);
}
