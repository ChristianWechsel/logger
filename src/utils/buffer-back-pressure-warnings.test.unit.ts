import type { Logger } from "../interfaces/logger.js";
import { BufferBackPressureWarnings } from "./buffer-back-pressure-warnings.js";

function createMockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}

describe("BufferBackPressureWarnings", () => {
  describe("add", () => {
    it("buffers a warning entry without writing to the logger", () => {
      const logger = createMockLogger();
      const buffer = new BufferBackPressureWarnings(logger);

      buffer.add();

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("writeToLogs", () => {
    it("writes each buffered warning to the logger", () => {
      const logger = createMockLogger();
      const buffer = new BufferBackPressureWarnings(logger);
      buffer.add();
      buffer.add();

      buffer.writeToLogs();

      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(
        "Backpressure detected, write stream is full.",
      );
    });

    it("clears the buffer after writing", () => {
      const logger = createMockLogger();
      const buffer = new BufferBackPressureWarnings(logger);
      buffer.add();

      buffer.writeToLogs();
      buffer.writeToLogs();

      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("does nothing when the buffer is empty", () => {
      const logger = createMockLogger();
      const buffer = new BufferBackPressureWarnings(logger);

      buffer.writeToLogs();

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
