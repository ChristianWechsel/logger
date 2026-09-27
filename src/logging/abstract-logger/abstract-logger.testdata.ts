import type { LogLevel } from "../../types/log-level.js";

export const FIXED_DATE = new Date("2024-01-15T10:30:45.123Z");

export const FIXED_TIMESTAMP = "2024-01-15:10:30:45.123";

export type FormatMessageTestdata = {
  name: string;
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  expected: string;
};

export class AbstractLoggerTestdataFactory {
  without_context(): FormatMessageTestdata {
    return {
      name: "without_context",
      level: "info",
      message: "starting application",
      timestamp: FIXED_DATE,
      expected: `${FIXED_TIMESTAMP} [test-app] info: starting application`,
    };
  }

  with_context(): FormatMessageTestdata {
    return {
      name: "with_context",
      level: "warn",
      message: "low memory",
      context: "System",
      timestamp: FIXED_DATE,
      expected: `${FIXED_TIMESTAMP} [test-app] [System] warn: low memory`,
    };
  }

  empty_message_is_sanitized(): FormatMessageTestdata {
    return {
      name: "empty_message_is_sanitized",
      level: "error",
      message: "",
      timestamp: FIXED_DATE,
      expected: `${FIXED_TIMESTAMP} [test-app] error: [empty message]`,
    };
  }

  blank_message_is_sanitized(): FormatMessageTestdata {
    return {
      name: "blank_message_is_sanitized",
      level: "debug",
      message: "   ",
      timestamp: FIXED_DATE,
      expected: `${FIXED_TIMESTAMP} [test-app] debug: [empty message]`,
    };
  }

  without_context_as_json(): FormatMessageTestdata {
    return {
      name: "without_context_as_json",
      level: "info",
      message: "starting application",
      timestamp: FIXED_DATE,
      expected: JSON.stringify({
        timestamp: FIXED_TIMESTAMP,
        appName: "test-app",
        level: "info",
        message: "starting application",
      }),
    };
  }

  with_context_as_json(): FormatMessageTestdata {
    return {
      name: "with_context_as_json",
      level: "warn",
      message: "low memory",
      context: "System",
      timestamp: FIXED_DATE,
      expected: JSON.stringify({
        timestamp: FIXED_TIMESTAMP,
        appName: "test-app",
        level: "warn",
        message: "low memory",
        context: "System",
      }),
    };
  }

  empty_message_is_sanitized_as_json(): FormatMessageTestdata {
    return {
      name: "empty_message_is_sanitized_as_json",
      level: "error",
      message: "",
      timestamp: FIXED_DATE,
      expected: JSON.stringify({
        timestamp: FIXED_TIMESTAMP,
        appName: "test-app",
        level: "error",
        message: "[empty message]",
      }),
    };
  }
}
