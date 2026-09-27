export const FIXED_DATE = new Date("2024-01-15T10:30:45.123Z");

const FIXED_TIMESTAMP = "2024-01-15:10:30:45.123";

export type FileLoggerTestdata = {
  name: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: string;
  format?: "text" | "json";
  expectedOutput: string;
};

export class FileLoggerTestdataFactory {
  info(): FileLoggerTestdata {
    return {
      name: "info",
      level: "info",
      message: "starting application",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] info: starting application\n`,
    };
  }

  warn(): FileLoggerTestdata {
    return {
      name: "warn",
      level: "warn",
      message: "low memory",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] warn: low memory\n`,
    };
  }

  error(): FileLoggerTestdata {
    return {
      name: "error",
      level: "error",
      message: "connection failed",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] error: connection failed\n`,
    };
  }

  debug(): FileLoggerTestdata {
    return {
      name: "debug",
      level: "debug",
      message: "cache miss",
      context: "Repository",
      expectedOutput: `${FIXED_TIMESTAMP} [test-app] [Repository] debug: cache miss\n`,
    };
  }

  info_as_json(): FileLoggerTestdata {
    return {
      name: "info_as_json",
      level: "info",
      message: "starting application",
      format: "json",
      expectedOutput: `${JSON.stringify({
        timestamp: FIXED_TIMESTAMP,
        appName: "test-app",
        level: "info",
        message: "starting application",
      })}\n`,
    };
  }

  debug_as_json(): FileLoggerTestdata {
    return {
      name: "debug_as_json",
      level: "debug",
      message: "cache miss",
      context: "Repository",
      format: "json",
      expectedOutput: `${JSON.stringify({
        timestamp: FIXED_TIMESTAMP,
        appName: "test-app",
        level: "debug",
        message: "cache miss",
        context: "Repository",
      })}\n`,
    };
  }
}
