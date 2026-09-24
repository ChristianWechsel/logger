export const FIXED_DATE = new Date("2024-01-15T10:30:45.123Z");

const FIXED_TIMESTAMP = "2024-01-15:10:30:45.123";

export type ConsoleLoggerTestdata = {
  name: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: string;
  expectedConsoleMethod: "log" | "warn" | "error" | "debug";
  expectedOutput: string;
};

export class ConsoleLoggerTestdataFactory {
  info_without_context(): ConsoleLoggerTestdata {
    return {
      name: "info_without_context",
      level: "info",
      message: "starting application",
      expectedConsoleMethod: "log",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] info: starting application`,
    };
  }

  info_with_context(): ConsoleLoggerTestdata {
    return {
      name: "info_with_context",
      level: "info",
      message: "user logged in",
      context: "AuthService",
      expectedConsoleMethod: "log",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] [AuthService] info: user logged in`,
    };
  }

  warn_without_context(): ConsoleLoggerTestdata {
    return {
      name: "warn_without_context",
      level: "warn",
      message: "low memory",
      expectedConsoleMethod: "warn",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] warn: low memory`,
    };
  }

  warn_with_context(): ConsoleLoggerTestdata {
    return {
      name: "warn_with_context",
      level: "warn",
      message: "deprecated api used",
      context: "ApiGateway",
      expectedConsoleMethod: "warn",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] [ApiGateway] warn: deprecated api used`,
    };
  }

  error_without_context(): ConsoleLoggerTestdata {
    return {
      name: "error_without_context",
      level: "error",
      message: "connection failed",
      expectedConsoleMethod: "error",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] error: connection failed`,
    };
  }

  error_with_context(): ConsoleLoggerTestdata {
    return {
      name: "error_with_context",
      level: "error",
      message: "database timeout",
      context: "Database",
      expectedConsoleMethod: "error",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] [Database] error: database timeout`,
    };
  }

  debug_without_context(): ConsoleLoggerTestdata {
    return {
      name: "debug_without_context",
      level: "debug",
      message: "cache miss",
      expectedConsoleMethod: "debug",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] debug: cache miss`,
    };
  }

  debug_with_context(): ConsoleLoggerTestdata {
    return {
      name: "debug_with_context",
      level: "debug",
      message: "query executed",
      context: "Repository",
      expectedConsoleMethod: "debug",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] [Repository] debug: query executed`,
    };
  }

  empty_message_is_sanitized(): ConsoleLoggerTestdata {
    return {
      name: "empty_message_is_sanitized",
      level: "info",
      message: "",
      expectedConsoleMethod: "log",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] info: [empty message]`,
    };
  }

  blank_message_is_sanitized(): ConsoleLoggerTestdata {
    return {
      name: "blank_message_is_sanitized",
      level: "warn",
      message: "   ",
      expectedConsoleMethod: "warn",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] warn: [empty message]`,
    };
  }
}
