import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getConditionsByUserId } from "@/lib/db";
import { RATING_LABELS } from "@/types";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  let conditions: (import("@/types").Condition & { location_name: string })[] = [];

  try {
    conditions = await getConditionsByUserId(session.user.id!);
  } catch {
    // DB may not be configured during development
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
