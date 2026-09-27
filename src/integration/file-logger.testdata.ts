const timestampPattern = "\\d{4}-\\d{2}-\\d{2}:\\d{2}:\\d{2}:\\d{2}\\.\\d{3}";

export type LogLevel = "info" | "warn" | "error" | "debug";

export type LogCall = {
  level: LogLevel;
  message: string;
  context?: string;
};

export type FileLoggerScenario = {
  logCalls: LogCall[];
  expectedPatterns: RegExp[];
};

export class FileLoggerIntegrationTestdata {
  singleEntryScenario(appName: string): FileLoggerScenario {
    const logCalls: LogCall[] = [
      { level: "info", message: "application started" },
      {
        level: "error",
        message: "connection failed",
        context: "DatabaseClient",
      },
    ];
    return {
      logCalls,
      expectedPatterns: logCalls.map((call) =>
        this.buildExpectedPattern(appName, call),
      ),
    };
  }

  burstEntryScenario(appName: string, entryCount: number): FileLoggerScenario {
    const logCalls: LogCall[] = Array.from(
      { length: entryCount },
      (_, index) => ({
        level: "info",
        message: `burst message ${index}`,
      }),
    );
    return {
      logCalls,
      expectedPatterns: logCalls.map((call) =>
        this.buildExpectedPattern(appName, call),
      ),
    };
  }

  backpressureWarningPattern(appName: string): RegExp {
    return this.buildExpectedPattern(appName, {
      level: "warn",
      message: "Backpressure detected, write stream is full.",
    });
  }

  private buildExpectedPattern(appName: string, call: LogCall): RegExp {
    const contextPart = call.context ? ` \\[${call.context}\\]` : "";
    return new RegExp(
      `^${timestampPattern} \\[${appName}\\]${contextPart} ${call.level}: ${call.message}$`,
    );
  }
}
