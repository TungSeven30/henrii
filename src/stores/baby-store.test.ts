import { beforeEach, describe, expect, it } from "vitest";
import { useBabyStore } from "./baby-store";

describe("baby-store", () => {
  beforeEach(() => {
    useBabyStore.getState().reset();
  });

  it("hydrates with profile default baby id", () => {
    useBabyStore.getState().hydrateFromProfile({
      defaultBabyId: "baby_1",
      caregiverBabyIds: ["baby_2"],
    });

    expect(useBabyStore.getState().activeBabyId).toBe("baby_1");
    expect(useBabyStore.getState().hydrated).toBe(true);
  });

  it("falls back to caregiver baby id if no default id exists", () => {
    useBabyStore.getState().hydrateFromProfile({
      caregiverBabyIds: ["baby_9"],
    });

    expect(useBabyStore.getState().activeBabyId).toBe("baby_9");
  });
});
