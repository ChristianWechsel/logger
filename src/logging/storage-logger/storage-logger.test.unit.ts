import type { LogEntry } from "../../types/log-entry.js";
import { StorageLogger } from "./storage-logger.js";

describe("StorageLogger", () => {
  it("should upload log entries on close", (done) => {
    const storageLogger = new StorageLogger("appName", {
      upload: (data) => {
        try {
          expect(data).toHaveLength(4);
          expect(data).toEqual<LogEntry[]>([
            {
              message: "info message",
              context: "context",
              level: "info",
              timestamp: expect.any(Date),
            },
            {
              message: "warn message",
              context: "context",
              level: "warn",
              timestamp: expect.any(Date),
            },
            {
              message: "error message",
              context: "context",
              level: "error",
              timestamp: expect.any(Date),
            },
            {
              message: "debug message",
              context: "context",
              level: "debug",
              timestamp: expect.any(Date),
            },
          ]);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      },
    });

    storageLogger.info("info message", "context");
    storageLogger.warn("warn message", "context");
    storageLogger.error("error message", "context");
    storageLogger.debug("debug message", "context");

    storageLogger
      .close()
      .then(() => done())
      .catch(done);
  });
});
