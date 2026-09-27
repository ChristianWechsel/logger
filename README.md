# @christian-wechsel/logger

A lightweight, dependency-free TypeScript logging library for Node.js with a console logger and a file logger (daily rotation, JSON/text format, backpressure-safe writes).

## Installation

```shell
npm install @christian-wechsel/logger
```

## Quick Start

```typescript
import { ConsoleLogger, FileLogger } from "@christian-wechsel/logger";

const consoleLogger = new ConsoleLogger("my-app");
consoleLogger.info("Application started");
consoleLogger.warn("Low memory", "SystemMonitor");
consoleLogger.error("Connection failed", "DatabaseClient");

const fileLogger = new FileLogger("my-app", {
  pathFolder: "./logs",
  extension: "log",
});
fileLogger.info("Application started");
await fileLogger.close();
```

Every log line is formatted as:

```text
2024-01-15:10:30:45.123 [my-app] [DatabaseClient] error: Connection failed
```

## API

### `Logger` (interface)

The common contract implemented by every logger:

```typescript
interface Logger {
  info(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  error(message: string, context?: string): void;
  debug(message: string, context?: string): void;
}
```

`context` is optional and is rendered as `[Context]` right before the log level, e.g. for tagging the originating module/class.

### `ConsoleLogger`

Writes formatted log lines to the standard console methods (`console.log`/`warn`/`error`/`debug`).

```typescript
import { ConsoleLogger } from "@christian-wechsel/logger";

const logger = new ConsoleLogger("my-app");
logger.debug("Cache miss", "Repository");
```

Throws if `appName` is empty or blank.

### `FileLogger`

Writes formatted log lines to a file on disk.

```typescript
import { FileLogger } from "@christian-wechsel/logger";

const logger = new FileLogger(
  "my-app",
  { pathFolder: "./logs", extension: "log" },
  "json", // optional, defaults to "text"
);

logger.info("Application started");

// Always close the logger during shutdown to flush and release the file handle.
await logger.close();
```

**Constructor:** `new FileLogger(appName, file, format?)`

| Parameter         | Type                                   | Description                                                        |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `appName`         | `string`                                 | Non-empty application identifier, included in every log line.       |
| `file.pathFolder` | `string`                                 | Folder the log files are written to (must already exist).           |
| `file.extension`  | `string`                                 | File extension appended to the generated file name (e.g. `"log"`). |
| `format`          | `"text" \| "json"` (default `"text"`)   | Rendering format for each log entry.                                |

Throws if `appName`, `file.pathFolder`, or `file.extension` is empty or blank.

**Behavior:**

- **File naming & daily rotation:** files are named `<appName>.<yyyy-mm-dd>.<extension>` (UTC date). The logger automatically rotates to a new file the moment the UTC day changes — no restart required.
- **Format:** `"text"` produces the same human-readable line as `ConsoleLogger`; `"json"` produces one JSON object per line (JSON Lines / `.jsonl`-style), e.g. `{"timestamp":"...","appName":"my-app","level":"info","message":"..."}`.
- **Backpressure handling:** if the underlying write stream can't keep up, the logger buffers a single warning ("Backpressure detected, write stream is full.") and **drops** the log lines that couldn't be written, instead of buffering unbounded amounts of data in memory. This is a deliberate trade-off favoring process stability (bounded memory) over completeness of logs — it targets low/medium-traffic workloads where sustained backpressure is rare. Once the stream drains, normal writing resumes and the buffered warning is flushed.
- **`close()`** resolves once all pending writes have been flushed and the file handle closed. Always call it before your process exits.

### `AbstractLogger`

Base class for building custom loggers (e.g. to ship logs to an external service). Extend it and implement `info`/`warn`/`error`/`debug`; the protected helpers `createLogEntry`, `formatMessage`, and `formatMessageAsJson` are available for formatting.

```typescript
import { AbstractLogger, type LogEntry } from "@christian-wechsel/logger";

class HttpLogger extends AbstractLogger {
  info(message: string, context?: string): void {
    this.send(this.createLogEntry("info", message, context));
  }
  warn(message: string, context?: string): void {
    this.send(this.createLogEntry("warn", message, context));
  }
  error(message: string, context?: string): void {
    this.send(this.createLogEntry("error", message, context));
  }
  debug(message: string, context?: string): void {
    this.send(this.createLogEntry("debug", message, context));
  }

  private send(entry: LogEntry): void {
    // e.g. fetch("https://logs.example.com", { method: "POST", body: this.formatMessageAsJson(entry) });
  }
}
```

### Types

Exported for consumers building custom loggers or handling log data:

| Type             | Shape                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| `LogLevel`        | `"info" \| "warn" \| "error" \| "debug"`                                    |
| `LogEntry`        | `{ timestamp: Date; level: LogLevel; message: string; context?: string }`   |
| `LogFormat`       | `"text" \| "json"`                                                          |
| `FileLoggerFile`  | `{ pathFolder: string; extension: string }`                                 |

