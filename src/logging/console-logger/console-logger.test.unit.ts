import { ConsoleLogger } from "../console-logger.js";
import {
  ConsoleLoggerTestdataFactory,
  FIXED_DATE,
} from "../console-logger.testdata.js";

describe("ConsoleLogger", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("fail-fast validation", () => {
    it("throws when appName is empty", () => {
      expect(() => new ConsoleLogger("")).toThrow(
        "ConsoleLogger: appName must be a non-empty string",
      );
    });

    it("throws when appName is blank", () => {
      expect(() => new ConsoleLogger("   ")).toThrow(
        "ConsoleLogger: appName must be a non-empty string",
      );
    });
  });

  describe("logging methods", () => {
    const testData = new ConsoleLoggerTestdataFactory();

    it.each([
      testData.info_without_context(),
      testData.info_with_context(),
      testData.warn_without_context(),
      testData.warn_with_context(),
      testData.error_without_context(),
      testData.error_with_context(),
      testData.debug_without_context(),
      testData.debug_with_context(),
      testData.empty_message_is_sanitized(),
      testData.blank_message_is_sanitized(),
    ])(
      "$name",
      ({ level, message, context, expectedConsoleMethod, expectedOutput }) => {
        const consoleSpy = jest
          .spyOn(console, expectedConsoleMethod)
          .mockImplementation(() => {});
        const logger = new ConsoleLogger("test-app");

        logger[level](message, context);

        expect(consoleSpy).toHaveBeenCalledWith(expectedOutput);
      },
    );
  });
});
