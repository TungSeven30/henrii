/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SyncStatus } from "./sync-status";
import { useDuplicateStore } from "../../stores/duplicate-store";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    return (key: string, values?: { count?: number }) => {
      if (key === "duplicatesDetected") {
        return `${values?.count ?? 0} duplicate events detected`;
      }
      return key;
    };
  },
}));

function setFlags(
  flags: Array<{
    id: string;
    tableName: string;
    eventId: string;
    nearbyIds: string[];
    timestamp: string;
    resolved: boolean;
    createdAt: string;
  }>,
) {
  useDuplicateStore.setState({ flags });
}

describe("sync-status", () => {
  beforeEach(() => {
    setFlags([]);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when all duplicates are resolved", () => {
    setFlags([
      {
        id: "flag_1",
        tableName: "feedings",
        eventId: "event_1",
        nearbyIds: [],
        timestamp: "2026-02-11T06:00:00.000Z",
        resolved: true,
        createdAt: "2026-02-11T06:00:00.000Z",
      },
    ]);

    const { container } = render(<SyncStatus />);
    expect(container.firstChild).toBeNull();
  });

  it("shows unresolved duplicate count", () => {
    setFlags([
      {
        id: "flag_1",
        tableName: "feedings",
        eventId: "event_1",
        nearbyIds: [],
        timestamp: "2026-02-11T06:00:00.000Z",
        resolved: false,
        createdAt: "2026-02-11T06:00:00.000Z",
      },
      {
        id: "flag_2",
        tableName: "sleep_sessions",
        eventId: "event_2",
        nearbyIds: [],
        timestamp: "2026-02-11T06:30:00.000Z",
        resolved: false,
        createdAt: "2026-02-11T06:30:00.000Z",
      },
    ]);

    render(<SyncStatus />);
    expect(screen.getByText("2 duplicate events detected")).toBeTruthy();
  });
});
