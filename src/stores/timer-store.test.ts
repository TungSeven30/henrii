/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimerStore } from "./timer-store";

function resetTimerStore() {
  useTimerStore.setState({
    activeTimers: [],
  });
}

describe("timer-store", () => {
  beforeEach(() => {
    resetTimerStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts a timer and returns its id", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("timer_1");

    const id = useTimerStore.getState().startTimer({
      type: "feeding",
      startedAt: "2026-02-11T03:00:00.000Z",
      babyId: "baby_1",
    });

    expect(id).toBe("timer_1");
    expect(useTimerStore.getState().activeTimers).toEqual([
      {
        id: "timer_1",
        type: "feeding",
        startedAt: "2026-02-11T03:00:00.000Z",
        babyId: "baby_1",
      },
    ]);
  });

  it("stops a timer and returns the removed timer", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValueOnce("timer_1");
    useTimerStore.getState().startTimer({
      type: "sleep",
      startedAt: "2026-02-11T04:00:00.000Z",
      babyId: "baby_1",
    });

    const removed = useTimerStore.getState().stopTimer("timer_1");
    expect(removed?.id).toBe("timer_1");
    expect(useTimerStore.getState().activeTimers).toEqual([]);
  });

  it("filters timers by baby", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("timer_1")
      .mockReturnValueOnce("timer_2");

    useTimerStore.getState().startTimer({
      type: "sleep",
      startedAt: "2026-02-11T04:00:00.000Z",
      babyId: "baby_1",
    });
    useTimerStore.getState().startTimer({
      type: "feeding",
      startedAt: "2026-02-11T05:00:00.000Z",
      babyId: "baby_2",
    });

    const timers = useTimerStore.getState().getTimersByBaby("baby_2");
    expect(timers).toHaveLength(1);
    expect(timers[0]?.id).toBe("timer_2");
  });

  it("clears all timers", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("timer_1");
    useTimerStore.getState().startTimer({
      type: "feeding",
      startedAt: "2026-02-11T03:00:00.000Z",
      babyId: "baby_1",
    });

    useTimerStore.getState().clearAllTimers();
    expect(useTimerStore.getState().activeTimers).toEqual([]);
  });
});
