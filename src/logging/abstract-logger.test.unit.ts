import { AbstractLogger } from "./abstract-logger.js";
import {
  AbstractLoggerTestdataFactory,
  FIXED_DATE,
} from "./abstract-logger.testdata.js";

class TestLogger extends AbstractLogger {
  info(): void {}
  warn(): void {}
  error(): void {}
  debug(): void {}

  public callFormatMessage(
    level: string,
    message: string,
    context?: string,
  ): string {
    return this.formatMessage(level, message, context);
  }

  public callSanitizeMessage(message: string): string {
    return this.sanitizeMessage(message);
  }

  public callFormatTimestamp(): string {
    return this.formatTimestamp();
  }
}

describe("AbstractLogger", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("fail-fast validation", () => {
    it("throws when appName is empty", () => {
      expect(() => new TestLogger("")).toThrow(
        "TestLogger: appName must be a non-empty string",
      );
    });

    it("throws when appName is blank", () => {
      expect(() => new TestLogger("   ")).toThrow(
        "TestLogger: appName must be a non-empty string",
      );
    });
  });

  describe("formatTimestamp", () => {
    it("formats the current time as yyyy-mm-dd:hh:mm:ss.ms in UTC", () => {
      const logger = new TestLogger("test-app");

      expect(logger.callFormatTimestamp()).toBe("2024-01-15:10:30:45.123");
    });
  });

  describe("sanitizeMessage", () => {
    it("returns the original message when non-empty", () => {
      const logger = new TestLogger("test-app");

      expect(logger.callSanitizeMessage("hello")).toBe("hello");
    });

    it("returns placeholder when message is empty", () => {
      const logger = new TestLogger("test-app");

      expect(logger.callSanitizeMessage("")).toBe("[empty message]");
    });

    it("returns placeholder when message is blank", () => {
      const logger = new TestLogger("test-app");

      expect(logger.callSanitizeMessage("   ")).toBe("[empty message]");
    });
  });

  describe("formatMessage", () => {
    const testData = new AbstractLoggerTestdataFactory();

    it.each([
      testData.without_context(),
      testData.with_context(),
      testData.empty_message_is_sanitized(),
      testData.blank_message_is_sanitized(),
    ])("$name", ({ level, message, context, expected }) => {
      const logger = new TestLogger("test-app");

      expect(logger.callFormatMessage(level, message, context)).toBe(expected);
    });
  });
});
