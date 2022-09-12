import { toError } from "./toError";

describe("Conversion to Error", () => {
  it("should convert a number", () => {
    expect(toError(90)).toEqual(new Error("90"));
  });

  it("should convert a string", () => {
    expect(toError("Dodo")).toEqual(new Error("Dodo"));
  });

  it("should convert a boolean", () => {
    expect(toError(true)).toEqual(new Error("true"));
  });

  it("should convert null", () => {
    expect(toError(null)).toEqual(new Error("null"));
  });

  it("should convert undefined", () => {
    expect(toError(undefined)).toEqual(new Error("undefined"));
  });

  it("should leave an error just as it is", () => {
    const testError = new Error("Alpha error", { cause: new Error("Beta") });

    expect(toError(testError)).toBe(testError);
  });
});
