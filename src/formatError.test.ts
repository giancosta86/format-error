import { ErrorParts, formatError } from "./formatError";

const TEST_FILE_REGEX = /formatError\.(test)\.(j|t)s/;

describe("Formatting an error", () => {
  describe("when passing a non-Error value", () => {
    it("should format a number", () => {
      const output = formatError(90);

      expect(output).toBe("90");
    });

    it("should format a string", () => {
      const output = formatError("Error string");

      expect(output).toBe("Error string");
    });

    it("should format a boolean", () => {
      const output = formatError(true);

      expect(output).toBe("true");
    });
  });

  describe("by default", () => {
    it("should return just the class and the message", () => {
      const output = formatError(
        new URIError("Zeta", { cause: new Error("Sigma") })
      );

      expect(output).toBe('URIError("Zeta")');
    });
  });

  describe("when requesting no core info component", () => {
    it("should throw", () => {
      expect(() => {
        formatError(
          new URIError("Yogi the Bear"),
          ErrorParts.CauseChain | ErrorParts.Stack
        );
      }).toThrow(/^Cannot format/);
    });
  });

  describe("when requesting the core info", () => {
    describe("when requesting just the class", () => {
      it("should return just the class", () => {
        const output = formatError(
          new URIError("Yogi the Bear"),
          ErrorParts.Class
        );

        expect(output).toBe("URIError");
      });
    });

    describe("when requesting just the message", () => {
      describe("when the message is present", () => {
        it("should return just the message", () => {
          const output = formatError(
            new URIError("Yogi the Bear"),
            ErrorParts.Message
          );

          expect(output).toBe("Yogi the Bear");
        });
      });

      describe("when the message is missing", () => {
        it("should return the empty string", () => {
          const output = formatError(new URIError(), ErrorParts.Message);

          expect(output).toBe("");
        });
      });
    });

    describe("when requesting both the class and the message", () => {
      describe("when the message is present", () => {
        it("should return both the class and the message", () => {
          const output = formatError(
            new URIError("Yogi the Bear"),
            ErrorParts.Core
          );

          expect(output).toBe('URIError("Yogi the Bear")');
        });
      });

      describe("when the message is missing", () => {
        it("should return the class with empty parentheses", () => {
          const output = formatError(new URIError(), ErrorParts.Core);

          expect(output).toBe("URIError()");
        });
      });
    });
  });

  describe("when requesting the cause chain", () => {
    describe("when there is just one cause in the chain", () => {
      describe("when requesting the class", () => {
        it("should return just the class, for the cause as well", () => {
          const error = new URIError("Yogi the Bear", {
            cause: new RangeError("Ciop the Chipmunk")
          });

          const output = formatError(
            error,
            ErrorParts.Class | ErrorParts.CauseChain
          );

          expect(output).toBe("URIError. Cause: RangeError");
        });
      });

      describe("when requesting the message", () => {
        it("should return just the message, for the cause as well", () => {
          const error = new URIError("Yogi the Bear", {
            cause: new RangeError("Ciop the Chipmunk")
          });

          const output = formatError(
            error,
            ErrorParts.Message | ErrorParts.CauseChain
          );

          expect(output).toBe("Yogi the Bear. Cause: Ciop the Chipmunk");
        });
      });

      describe("when requesting the entire core info", () => {
        it("should return the entire core info, for the cause as well", () => {
          const error = new URIError("Yogi the Bear", {
            cause: new RangeError("Ciop the Chipmunk")
          });

          const output = formatError(error, ErrorParts.Main);

          expect(output).toBe(
            'URIError("Yogi the Bear"). Cause: RangeError("Ciop the Chipmunk")'
          );
        });
      });
    });

    describe("when there are multiple causes in the chain", () => {
      describe("when requesting the class", () => {
        it("should return just the class, for the whole cause chain as well", () => {
          const error = new URIError("Alpha", {
            cause: new Error("Beta", { cause: new RangeError("Gamma") })
          });

          const output = formatError(
            error,
            ErrorParts.Class | ErrorParts.CauseChain
          );

          expect(output).toBe("URIError. Cause: Error. Cause: RangeError");
        });
      });

      describe("when requesting the message", () => {
        it("should return just the message, for the whole cause chain as well", () => {
          const error = new URIError("Alpha", {
            cause: new Error("Beta", { cause: new RangeError("Gamma") })
          });

          const output = formatError(
            error,
            ErrorParts.Message | ErrorParts.CauseChain
          );

          expect(output).toBe("Alpha. Cause: Beta. Cause: Gamma");
        });
      });

      describe("when requesting the entire core info", () => {
        it("should return the entire core info, for the whole cause chain as well", () => {
          const error = new URIError("Alpha", {
            cause: new Error("Beta", { cause: new RangeError("Gamma") })
          });

          const output = formatError(error, ErrorParts.Main);

          expect(output).toBe(
            'URIError("Alpha"). Cause: Error("Beta"). Cause: RangeError("Gamma")'
          );
        });
      });
    });
  });

  describe("when requesting the stack trace", () => {
    describe("when requesting the entire core info", () => {
      it("should return the core info and the stack trace", () => {
        const output = formatError(
          new Error("Cip", { cause: new Error("Ciop") }),
          ErrorParts.Core | ErrorParts.Stack
        );

        expect(output).toMatch(/^Error\("Cip"\)/);
        expect(output).not.toMatch("Ciop");
        expect(output).toMatch(TEST_FILE_REGEX);
      });
    });

    describe("when the stack trace is undefined", () => {
      it("should just ignore it", () => {
        const testError = new Error("Dodo");
        testError.stack = undefined;

        const output = formatError(
          testError,
          ErrorParts.Core | ErrorParts.Stack
        );

        expect(output).toBe('Error("Dodo")');
      });
    });

    describe("when requesting the entire core info and the cause chain", () => {
      it("should contain every detail", () => {
        const output = formatError(
          new RangeError("Cip", { cause: new URIError("Ciop") }),
          ErrorParts.All
        );

        expect(output).toMatch(
          /^RangeError\("Cip"\). Cause: URIError\("Ciop"\)/
        );
        expect(output).toMatch(TEST_FILE_REGEX);
      });
    });
  });
});
