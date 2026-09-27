import { BooleanState } from "./boolean-state.js";

describe("BooleanState", () => {
  describe("constructor", () => {
    it("sets the initial state to true", () => {
      const state = new BooleanState(true);

      expect(state.getState()).toBe(true);
    });

    it("sets the initial state to false", () => {
      const state = new BooleanState(false);

      expect(state.getState()).toBe(false);
    });

    it("does not mark switchedTrueToFalse as happened initially", () => {
      const state = new BooleanState(true);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(false);
    });
  });

  describe("updateStateIfChanged", () => {
    it("updates the state from false to true", () => {
      const state = new BooleanState(false);

      state.updateStateIfChanged(true);

      expect(state.getState()).toBe(true);
    });

    it("updates the state from true to false", () => {
      const state = new BooleanState(true);

      state.updateStateIfChanged(false);

      expect(state.getState()).toBe(false);
    });

    it("keeps the state unchanged when the new state equals the current state", () => {
      const state = new BooleanState(true);

      state.updateStateIfChanged(true);

      expect(state.getState()).toBe(true);
    });

    it("marks switchedTrueToFalse as happened when switching from true to false", () => {
      const state = new BooleanState(true);

      state.updateStateIfChanged(false);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(true);
    });

    it("does not mark switchedTrueToFalse when switching from false to true", () => {
      const state = new BooleanState(false);

      state.updateStateIfChanged(true);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(false);
    });

    it("does not mark switchedTrueToFalse when state stays true", () => {
      const state = new BooleanState(true);

      state.updateStateIfChanged(true);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(false);
    });

    it("does not mark switchedTrueToFalse when state stays false", () => {
      const state = new BooleanState(false);

      state.updateStateIfChanged(false);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(false);
    });
  });

  describe("hasStateSwitchedTrueToFalse", () => {
    it("remains true after multiple subsequent updates once switched", () => {
      const state = new BooleanState(true);

      state.updateStateIfChanged(false);
      state.updateStateIfChanged(false);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(true);
    });
  });

  describe("resetHasSwitchedTrueToFalse", () => {
    it("resets switchedTrueToFalse back to false", () => {
      const state = new BooleanState(true);
      state.updateStateIfChanged(false);

      state.resetHasSwitchedTrueToFalse();

      expect(state.hasStateSwitchedTrueToFalse()).toBe(false);
    });

    it("allows switchedTrueToFalse to be detected again after a reset", () => {
      const state = new BooleanState(true);
      state.updateStateIfChanged(false);
      state.resetHasSwitchedTrueToFalse();

      state.updateStateIfChanged(true);
      state.updateStateIfChanged(false);

      expect(state.hasStateSwitchedTrueToFalse()).toBe(true);
    });
  });

  describe("getState", () => {
    it("returns the current state", () => {
      const state = new BooleanState(false);

      expect(state.getState()).toBe(false);
    });
  });
});
