import type { Condition } from "@/types";

export type BadgeMetric =
	| "reports"
	| "uniqueLocations"
	| "photoReports"
	| "highRatings"
	| "streakDays"
	| "kidFriendlyReports";

export interface BadgeDefinition {
	id: string;
	name: string;
	description: string;
	iconPath: string;
	metric: BadgeMetric;
	target: number;
}

export interface BadgeProgress extends BadgeDefinition {
	current: number;
	earned: boolean;
	percent: number;
	earnedAt: string | null;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
	{
		id: "first-report",
		name: "First Report",
		description: "Submit your first condition report.",
		iconPath: "badges/1.svg",
		metric: "reports",
		target: 1,
	},
	{
		id: "trail-spotter",
		name: "Trail Spotter",
		description: "Submit 5 condition reports.",
		iconPath: "badges/2.svg",
		metric: "reports",
		target: 5,
	},
	{
		id: "field-researcher",
		name: "Playground Scout",
		description: "Submit 3 reports tagged kid-friendly.",
		iconPath: "badges/3.svg",
		metric: "kidFriendlyReports",
		target: 3,
	},
	{
		id: "community-observer",
		name: "Community Observer",
		description: "Report at 3 unique locations.",
		iconPath: "badges/4.svg",
		metric: "uniqueLocations",
		target: 3,
	},
	{
		id: "map-rover",
		name: "Map Rover",
		description: "Report at 10 unique locations.",
		iconPath: "badges/5.svg",
		metric: "uniqueLocations",
		target: 10,
	},
	{
		id: "photo-proof",
		name: "Photo Proof",
		description: "Upload 3 reports with photos.",
		iconPath: "badges/6.svg",
		metric: "photoReports",
		target: 3,
	},
	{
		id: "quality-scout",
		name: "Quality Scout",
		description: "Submit 10 reports rated Good or Excellent.",
		iconPath: "badges/7.svg",
		metric: "highRatings",
		target: 10,
	},
	{
		id: "streak-starter",
		name: "Streak Starter",
		description: "Report on 3 consecutive days.",
		iconPath: "badges/8.svg",
		metric: "streakDays",
		target: 3,
	},
];

function toDateKey(value: string): string {
	return new Date(value).toISOString().slice(0, 10);
}

function sortOldestFirst(conditions: Condition[]): Condition[] {
	return [...conditions].sort(
		(a, b) =>
			new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
	);
}

function getMetricCount(metric: BadgeMetric, conditions: Condition[]): number {
	if (metric === "reports") return conditions.length;

	if (metric === "uniqueLocations") {
		return new Set(conditions.map((c) => c.location_id)).size;
	}

	if (metric === "photoReports") {
		return conditions.filter((c) => Boolean(c.photo_url)).length;
	}

	if (metric === "highRatings") {
		return conditions.filter((c) => c.rating >= 4).length;
	}

	if (metric === "kidFriendlyReports") {
		return conditions.filter((c) => c.tags?.includes("kid-friendly")).length;
	}

	const uniqueDays = Array.from(new Set(conditions.map((c) => toDateKey(c.condition_date))))
		.map((d) => new Date(d).getTime())
		.sort((a, b) => a - b);

	if (uniqueDays.length === 0) return 0;

	let longest = 1;
	let streak = 1;

	for (let i = 1; i < uniqueDays.length; i += 1) {
		const prev = uniqueDays[i - 1];
		const cur = uniqueDays[i];
		const dayDiff = (cur - prev) / (1000 * 60 * 60 * 24);

		if (dayDiff === 1) {
			streak += 1;
			longest = Math.max(longest, streak);
		} else if (dayDiff > 1) {
			streak = 1;
		}
	}

	return longest;
}

function getEarnedAt(
	badge: BadgeDefinition,
	conditions: Condition[],
): string | null {
	const ordered = sortOldestFirst(conditions);
	if (ordered.length === 0) return null;

	if (badge.metric === "streakDays") {
		const uniqueDays = Array.from(new Set(ordered.map((c) => toDateKey(c.condition_date))));
		if (uniqueDays.length === 0) return null;

		let streak = 1;
		if (badge.target === 1) return uniqueDays[0];

		for (let i = 1; i < uniqueDays.length; i += 1) {
			const prev = new Date(uniqueDays[i - 1]).getTime();
			const cur = new Date(uniqueDays[i]).getTime();
			const dayDiff = (cur - prev) / (1000 * 60 * 60 * 24);

			if (dayDiff === 1) {
				streak += 1;
				if (streak >= badge.target) return uniqueDays[i];
			} else if (dayDiff > 1) {
				streak = 1;
			}
		}

		return null;
	}

	let count = 0;
	const uniqueLocations = new Set<string>();

	for (const condition of ordered) {
		if (badge.metric === "reports") {
			count += 1;
		} else if (badge.metric === "uniqueLocations") {
			uniqueLocations.add(condition.location_id);
			count = uniqueLocations.size;
		} else if (badge.metric === "photoReports") {
			count += condition.photo_url ? 1 : 0;
		} else if (badge.metric === "highRatings") {
			count += condition.rating >= 4 ? 1 : 0;
		} else if (badge.metric === "kidFriendlyReports") {
			count += condition.tags?.includes("kid-friendly") ? 1 : 0;
		}

		if (count >= badge.target) {
			return toDateKey(condition.created_at);
		}
	}

	return null;
}

export function getBadgeProgress(conditions: Condition[]): BadgeProgress[] {
	return BADGE_DEFINITIONS.map((badge) => {
		const current = getMetricCount(badge.metric, conditions);
		const earned = current >= badge.target;

		return {
			...badge,
			current,
			earned,
			percent: Math.min(100, Math.round((current / badge.target) * 100)),
			earnedAt: earned ? getEarnedAt(badge, conditions) : null,
		};
	});
}

