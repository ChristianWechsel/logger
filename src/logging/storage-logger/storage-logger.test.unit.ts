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

  it("should upload log entries on batch threshold", (done) => {
    const actualBatches: LogEntry[][] = [];

    const storageLogger = new StorageLogger(
      "appName",
      {
        upload: (data) => {
          actualBatches.push(data);
          return Promise.resolve();
        },
      },
      { batch: { threshold: 3 } },
    );

    storageLogger.info("info message", "context");
    storageLogger.warn("warn message", "context");
    storageLogger.error("error message", "context");
    storageLogger.debug("debug message", "context");

    storageLogger
      .close()
      .then(() => {
        try {
          expect(actualBatches).toHaveLength(2);
          expect(actualBatches[0]).toHaveLength(3);
          expect(actualBatches[1]).toHaveLength(1);
          done();
        } catch (error) {
          done(error);
        }
      })
      .catch(done);
  });

  it("close consider not finished uploads as they might take longer", (done) => {
    let counterUploads = 0;

    const calcTimeout = () => {
      let timeout: number;
      if (counterUploads === 0) {
        timeout = 1000;
      } else {
        timeout = 10;
      }
      counterUploads++;
      return timeout;
    };

    const actualBatches: LogEntry[][] = [];

    const storageLogger = new StorageLogger(
      "appName",
      {
        upload: (data) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              actualBatches.push(data);
              resolve();
            }, calcTimeout());
          });
        },
      },
      { batch: { threshold: 3 } },
    );

    storageLogger.info("info message", "context");
    storageLogger.warn("warn message", "context");
    storageLogger.error("error message", "context");
    storageLogger.debug("debug message", "context");

    storageLogger
      .close()
      .then(() => {
        try {
          expect(actualBatches).toHaveLength(2);
          expect(actualBatches[0]).toHaveLength(1);
          expect(actualBatches[1]).toHaveLength(3);
          done();
        } catch (error) {
          done(error);
        }
      })
      .catch(done);
  });

  it("close consider not finished multiple uploads as they might take longer", (done) => {
    let counterUploads = 0;

    const calcTimeout = () => {
      let timeout: number;
      if (counterUploads === 0) {
        timeout = 1000;
      } else if (counterUploads === 1) {
        timeout = 500;
      } else {
        timeout = 10;
      }
      counterUploads++;
      return timeout;
    };

    const actualBatches: LogEntry[][] = [];

    const storageLogger = new StorageLogger(
      "appName",
      {
        upload: (data) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              actualBatches.push(data);
              resolve();
            }, calcTimeout());
          });
        },
      },
      { batch: { threshold: 2 } },
    );

    storageLogger.info("1");
    storageLogger.warn("2");
    storageLogger.error("3");
    storageLogger.debug("4");
    storageLogger.debug("5");

    storageLogger
      .close()
      .then(() => {
        try {
          expect(actualBatches).toHaveLength(3);
          expect(actualBatches[0]).toHaveLength(1);
          expect(actualBatches[1]).toHaveLength(2);
          expect(actualBatches[2]).toHaveLength(2);
          done();
        } catch (error) {
          done(error);
        }
      })
      .catch(done);
  });

  it("should suppress upload errors on close", async () => {
    const storageLogger = new StorageLogger("appName", {
      upload: () => {
        return Promise.reject(new Error("Upload failed"));
      },
    });

    storageLogger.info("info message", "context");
    storageLogger.warn("warn message", "context");
    storageLogger.error("error message", "context");
    storageLogger.debug("debug message", "context");

    await expect(storageLogger.close()).resolves.toBeDefined();
  });

  it("should continue uploading after a batch upload fails", async () => {
    let uploadCount = 0;
    const actualBatches: LogEntry[][] = [];

    const storageLogger = new StorageLogger(
      "appName",
      {
        upload: (data) => {
          uploadCount++;
          if (uploadCount === 1) {
            return Promise.reject(new Error("Upload failed"));
          }
          return new Promise((resolve) => {
            setTimeout(() => {
              actualBatches.push(data);
              resolve();
            }, 10);
          });
        },
      },
      { batch: { threshold: 2 } },
    );

    storageLogger.info("1");
    storageLogger.warn("2");
    storageLogger.error("3");
    storageLogger.debug("4");
    storageLogger.debug("5");

    await expect(storageLogger.close()).resolves.toBeDefined();
    expect(uploadCount).toBe(3);
    expect(actualBatches).toHaveLength(2);
    expect(actualBatches[0]).toHaveLength(2);
    expect(actualBatches[1]).toHaveLength(1);
  });

  it.only("callback onError", (done) => {
    const storageLogger = new StorageLogger("appName", {
      upload: () => {
        return Promise.reject(new Error("Upload failed"));
      },
    });

    storageLogger.onError((err) => {
      try {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Upload failed");
        done();
      } catch (error) {
        done(error);
      }
    });

    storageLogger.info("info message", "context");
    storageLogger.warn("warn message", "context");
    storageLogger.error("error message", "context");
    storageLogger.debug("debug message", "context");

    storageLogger.close();
  });
});
