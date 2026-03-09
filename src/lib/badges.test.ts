import { describe, expect, it } from "vitest";
import type { Condition } from "@/types";
import { getBadgeProgress } from "@/lib/badges";

function condition(overrides: Partial<Condition>): Condition {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    location_id: overrides.location_id ?? "loc-1",
    condition_date: overrides.condition_date ?? "2025-01-01",
    rating: overrides.rating ?? 3,
    description: overrides.description ?? "Report",
    photo_url: overrides.photo_url ?? null,
    created_at: overrides.created_at ?? "2025-01-01T12:00:00.000Z",
    user_id: overrides.user_id,
    user_name: overrides.user_name,
    user_image: overrides.user_image,
  };
}

describe("getBadgeProgress", () => {
  it("returns all badges with zero progress when user has no reports", () => {
    const badges = getBadgeProgress([]);

    expect(badges).toHaveLength(8);
    expect(badges.every((b) => b.current === 0 && b.earned === false)).toBe(true);
  });

  it("earns first-report and trail-spotter at 5 reports", () => {
    const reports = Array.from({ length: 5 }, (_, i) =>
      condition({
        id: `r-${i}`,
        location_id: "loc-a",
        condition_date: `2025-01-0${i + 1}`,
        created_at: `2025-01-0${i + 1}T12:00:00.000Z`,
      }),
    );

    const badges = getBadgeProgress(reports);
    const first = badges.find((b) => b.id === "first-report");
    const trail = badges.find((b) => b.id === "trail-spotter");

    expect(first?.earned).toBe(true);
    expect(trail?.earned).toBe(true);
    expect(trail?.earnedAt).toBe("2025-01-05");
  });

  it("calculates unique location and photo/high-rating metrics", () => {
    const reports = [
      condition({ id: "1", location_id: "loc-a", rating: 4, photo_url: "x", created_at: "2025-01-01T12:00:00.000Z" }),
      condition({ id: "2", location_id: "loc-b", rating: 5, photo_url: "x", created_at: "2025-01-02T12:00:00.000Z" }),
      condition({ id: "3", location_id: "loc-c", rating: 4, photo_url: "x", created_at: "2025-01-03T12:00:00.000Z" }),
    ];

    const badges = getBadgeProgress(reports);

    expect(badges.find((b) => b.id === "community-observer")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "photo-proof")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "quality-scout")?.current).toBe(3);
  });

  it("awards streak badge for consecutive report days", () => {
    const reports = [
      condition({ id: "1", condition_date: "2025-02-01", created_at: "2025-02-01T09:00:00.000Z" }),
      condition({ id: "2", condition_date: "2025-02-02", created_at: "2025-02-02T09:00:00.000Z" }),
      condition({ id: "3", condition_date: "2025-02-03", created_at: "2025-02-03T09:00:00.000Z" }),
      condition({ id: "4", condition_date: "2025-02-08", created_at: "2025-02-08T09:00:00.000Z" }),
    ];

    const badges = getBadgeProgress(reports);
    const streak = badges.find((b) => b.id === "streak-starter");

    expect(streak?.earned).toBe(true);
    expect(streak?.current).toBe(3);
    expect(streak?.earnedAt).toBe("2025-02-03");
  });
});
