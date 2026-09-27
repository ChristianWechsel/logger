export class BooleanState {
  private state: boolean;
  private switchedTrueToFalse: boolean;

  constructor(startState: boolean) {
    this.state = startState;
    this.switchedTrueToFalse = false;
  }

  updateStateIfChanged(newState: boolean) {
    if (this.state !== newState) {
      if (this.state && !newState) {
        this.switchedTrueToFalse = true;
      }
      this.state = newState;
    }
  }

  hasStateSwitchedTrueToFalse() {
    return this.switchedTrueToFalse;
  }

  resetHasSwitchedTrueToFalse() {
    this.switchedTrueToFalse = false;
  }

  getState() {
    return this.state;
  }
}
