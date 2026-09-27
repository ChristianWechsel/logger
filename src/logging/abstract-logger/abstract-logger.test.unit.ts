import type { LogEntry } from "../../types/log-entry.js";
import type { LogLevel } from "../../types/log-level.js";
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

  public callFormatMessage(entry: LogEntry): string {
    return this.formatMessage(entry);
  }

  public callFormatMessageAsJson(entry: LogEntry): string {
    return this.formatMessageAsJson(entry);
  }

  public callCreateLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
  ): LogEntry {
    return this.createLogEntry(level, message, context);
  }

  public callSanitizeMessage(message: string): string {
    return this.sanitizeMessage(message);
  }

  public callFormatTimestamp(date?: Date): string {
    return this.formatTimestamp(date);
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

    it("formats an explicitly passed date instead of the current time", () => {
      const logger = new TestLogger("test-app");

      expect(
        logger.callFormatTimestamp(new Date("2020-06-01T00:00:00.000Z")),
      ).toBe("2020-06-01:00:00:00.000");
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
    ])("$name", ({ level, message, context, timestamp, expected }) => {
      const logger = new TestLogger("test-app");

      expect(
        logger.callFormatMessage({ level, message, context, timestamp }),
      ).toBe(expected);
    });
  });

  describe("formatMessageAsJson", () => {
    const testData = new AbstractLoggerTestdataFactory();

    it.each([
      testData.without_context_as_json(),
      testData.with_context_as_json(),
      testData.empty_message_is_sanitized_as_json(),
    ])("$name", ({ level, message, context, timestamp, expected }) => {
      const logger = new TestLogger("test-app");

      expect(
        logger.callFormatMessageAsJson({ level, message, context, timestamp }),
      ).toBe(expected);
    });
  });

  describe("createLogEntry", () => {
    it("captures the current time as a plain Date, decoupled from rendering", () => {
      const logger = new TestLogger("test-app");

      const entry = logger.callCreateLogEntry("info", "hello", "System");

      expect(entry).toEqual({
        timestamp: FIXED_DATE,
        level: "info",
        message: "hello",
        context: "System",
      });
    });

    it("keeps the timestamp fixed even if rendered later", () => {
      const logger = new TestLogger("test-app");

      const entry = logger.callCreateLogEntry("info", "hello");
      jest.setSystemTime(new Date("2024-01-15T10:30:50.000Z"));

      expect(logger.callFormatMessage(entry)).toBe(
        "2024-01-15:10:30:45.123 [test-app] info: hello",
      );
    });
  });
});
