import { toError } from "./toError";

export enum ErrorParts {
  Class = 1,
  Message = 2,
  Core = Class | Message,
  CauseChain = 4,
  Main = Core | CauseChain,
  Stack = 8,
  All = Core | CauseChain | Stack
}

export function formatError(
  error: unknown,
  parts: ErrorParts = ErrorParts.Core
): string {
  if (!(error instanceof Error)) {
    return error instanceof Object && "message" in error
      ? String(error["message"])
      : String(error);
  }

  const resultBuffer: string[] = [];

  formatMainParts(error, parts, resultBuffer);

  const includeStack = parts & ErrorParts.Stack;
  if (includeStack && error.stack) {
    resultBuffer.push("\n");
    resultBuffer.push(error.stack);
  }

  return resultBuffer.join("");
}

function formatMainParts(
  error: Error,
  parts: ErrorParts,
  resultBuffer: string[]
): void {
  formatCoreParts(error, parts, resultBuffer);

  const includeCause = parts & ErrorParts.CauseChain;
  if (includeCause && error.cause !== undefined) {
    resultBuffer.push(". Cause: ");
    formatMainParts(toError(error.cause), parts, resultBuffer);
  }
}

function formatCoreParts(
  error: Error,
  parts: ErrorParts,
  resultBuffer: string[]
): void {
  const includeClass = parts & ErrorParts.Class;
  const includeMessage = parts & ErrorParts.Message;

  if (!includeClass && !includeMessage) {
    throw new Error(
      "Cannot format an error when neither its class nor its message is requested"
    );
  }

  if (includeClass) {
    resultBuffer.push(error.constructor.name);

    if (includeMessage) {
      resultBuffer.push("(");

      if (error.message) {
        resultBuffer.push('"');
      }
    }
  }

  if (includeMessage) {
    resultBuffer.push(error.message);

    if (includeClass) {
      if (error.message) {
        resultBuffer.push('"');
      }

      resultBuffer.push(")");
    }
  }
}
