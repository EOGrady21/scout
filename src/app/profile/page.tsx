import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getConditionsByUserId,
  getUserBadgeProgress,
  upsertBadgeCatalog,
  upsertUser,
  upsertUserBadgeProgress,
} from "@/lib/db";
import { BADGE_DEFINITIONS, getBadgeProgress } from "@/lib/badges";
import { RATING_LABELS } from "@/types";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  let queryUserId = session.user.id!;
  let conditions: (import("@/types").Condition & { location_name: string })[] = [];
  let badges = getBadgeProgress([]);

  try {
    if (session.user.email) {
      const user = await upsertUser({
        id: session.user.id!,
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
      });
      queryUserId = user.id;
    }

    conditions = await getConditionsByUserId(queryUserId);

    const computedBadges = getBadgeProgress(conditions);
    await upsertBadgeCatalog(BADGE_DEFINITIONS);
    await upsertUserBadgeProgress(queryUserId, computedBadges);
    badges = await getUserBadgeProgress(queryUserId);
  } catch {
    // DB may not be configured during development
    badges = getBadgeProgress(conditions);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* User info */}
      <div className="flex items-center gap-4 mb-8">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User"}
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {session.user.name}
          </h1>
          <p className="text-gray-500 text-sm">{session.user.email}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-xl border p-4 transition ${
              badge.earned
                ? "bg-white border-scout-green/30 shadow-sm"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Image
                src={`/${badge.iconPath}`}
                alt={badge.name}
                width={48}
                height={48}
                className={badge.earned ? "" : "grayscale opacity-60"}
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
                <p className="text-xs mt-2 text-gray-600">
                  Progress: {Math.min(badge.current, badge.target)}/{badge.target}
                </p>
                {badge.earnedAt ? (
                  <p className="text-xs mt-1 text-scout-green font-medium">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString("en-US")}
                  </p>
                ) : (
                  <p className="text-xs mt-1 text-gray-400">Not earned yet</p>
                )}
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full ${badge.earned ? "bg-scout-green" : "bg-gray-400"}`}
                style={{ width: `${badge.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Condition history */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Your Condition Reports
        {conditions.length > 0 && (
          <span className="ml-2 text-base font-normal text-gray-400">
            ({conditions.length})
          </span>
        )}
      </h2>

      {conditions.length === 0 ? (
        <p className="text-gray-500 text-sm">
          You haven&apos;t submitted any reports yet.{" "}
          <Link href="/" className="text-scout-green hover:underline">
            Explore locations
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {conditions.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-1">
                <Link
                  href={`/locations/${c.location_id}`}
                  className="font-semibold text-gray-800 hover:text-scout-green"
                >
                  {c.location_name}
                </Link>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${
                    c.rating >= 4
                      ? "bg-green-500"
                      : c.rating >= 3
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                >
                  {c.rating}★ {RATING_LABELS[c.rating]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(c.condition_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-600 text-sm">{c.description}</p>
              {c.tags && c.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <span
                      key={`${c.id}-${tag}`}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {c.photo_url && (
                <div className="mt-3 relative h-40 rounded-lg overflow-hidden">
                  <Image
                    src={c.photo_url}
                    alt="Condition photo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
