import { TimeMonitoring } from "./time-monitoring.js";

describe("TimeMonitoring", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T10:30:45.123Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("newDate", () => {
    it("does not fire the callback for a later time on the same UTC day", () => {
      const timeMonitoring = new TimeMonitoring();
      const callback = jest.fn();
      timeMonitoring.on("new-day", callback);

      timeMonitoring.newDate(new Date("2024-01-15T23:59:59.999Z"));

      expect(callback).not.toHaveBeenCalled();
    });

    it("fires the callback when the UTC day changes", () => {
      const timeMonitoring = new TimeMonitoring();
      const callback = jest.fn();
      timeMonitoring.on("new-day", callback);

      timeMonitoring.newDate(new Date("2024-01-16T00:00:00.000Z"));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("fires the callback when only the month changes but the day-of-month matches", () => {
      const timeMonitoring = new TimeMonitoring();
      const callback = jest.fn();
      timeMonitoring.on("new-day", callback);

      timeMonitoring.newDate(new Date("2024-02-15T10:30:45.123Z"));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("fires the callback when only the year changes but month and day-of-month match", () => {
      const timeMonitoring = new TimeMonitoring();
      const callback = jest.fn();
      timeMonitoring.on("new-day", callback);

      timeMonitoring.newDate(new Date("2025-01-15T10:30:45.123Z"));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("fires the callback only once even when called repeatedly on the new day", () => {
      const timeMonitoring = new TimeMonitoring();
      const callback = jest.fn();
      timeMonitoring.on("new-day", callback);

      timeMonitoring.newDate(new Date("2024-01-16T00:00:00.000Z"));
      timeMonitoring.newDate(new Date("2024-01-16T05:00:00.000Z"));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("does not throw when no callback has been registered", () => {
      const timeMonitoring = new TimeMonitoring();

      expect(() =>
        timeMonitoring.newDate(new Date("2024-01-16T00:00:00.000Z")),
      ).not.toThrow();
    });
  });
});
