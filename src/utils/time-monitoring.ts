type TimeCycle = "new-day";
type CallBack = () => void;

export class TimeMonitoring {
  private previousDate: Date;
  private callbacks: Partial<Record<TimeCycle, CallBack>>;

  constructor() {
    this.previousDate = new Date();
    this.callbacks = {};
  }

  newDate(currentDate: Date) {
    const isNewDay =
      currentDate.getUTCFullYear() !== this.previousDate.getUTCFullYear() ||
      currentDate.getUTCMonth() !== this.previousDate.getUTCMonth() ||
      currentDate.getUTCDate() !== this.previousDate.getUTCDate();
    if (isNewDay && this.callbacks["new-day"]) {
      this.callbacks["new-day"]();
      this.previousDate = currentDate;
    }
  }

  on(type: TimeCycle, cb: CallBack) {
    this.callbacks[type] = cb;
  }
}
