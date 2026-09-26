export type FileLoggerTestdata = {
  name: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: string;
};

export class FileLoggerTestdataFactory {
  info(): FileLoggerTestdata {
    return {
      name: "info",
      level: "info",
      message: "starting application",
    };
  }

  warn(): FileLoggerTestdata {
    return {
      name: "warn",
      level: "warn",
      message: "low memory",
    };
  }

  error(): FileLoggerTestdata {
    return {
      name: "error",
      level: "error",
      message: "connection failed",
    };
  }

  debug(): FileLoggerTestdata {
    return {
      name: "debug",
      level: "debug",
      message: "cache miss",
      context: "Repository",
    };
  }
}
