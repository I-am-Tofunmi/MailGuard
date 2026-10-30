import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ClockIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MailSearch,
  ArrowRight,
  Info,
  Filter,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MOCK_HISTORY } from "../data/mockHistory";

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Format an ISO date string (YYYY-MM-DD) into a friendly label like
 * "Today", "Yesterday", "3 days ago", or "Oct 16, 2026".
 */
function friendlyDate(isoString) {
  const date = new Date(isoString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (today - date) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 6) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── result badge config ────────────────────────────────────────────────────

const RESULT_CONFIG = {
  good: {
    label: "Looking good",
    icon: CheckCircle2,
    badgeCls:
      "bg-emerald-50 text-emerald-800 border border-emerald-200",
    dotCls: "bg-emerald-500",
  },
  attention: {
    label: "Needs attention",
    icon: AlertTriangle,
    badgeCls:
      "bg-amber-50 text-amber-800 border border-amber-200",
    dotCls: "bg-amber-400",
  },
  action: {
    label: "Action recommended",
    icon: AlertCircle,
    badgeCls:
      "bg-red-50 text-red-700 border border-red-200",
    dotCls: "bg-red-500",
  },
};

// ── filter options ─────────────────────────────────────────────────────────

const FILTERS = [
  { value: "all",       label: "All checks" },
  { value: "good",      label: "Looking good" },
  { value: "attention", label: "Needs attention" },
  { value: "action",    label: "Action recommended" },
];

// ── summary stats ──────────────────────────────────────────────────────────

function buildStats(entries) {
  return {
    total:     entries.length,
    good:      entries.filter((e) => e.result === "good").length,
    attention: entries.filter((e) => e.result === "attention").length,
    action:    entries.filter((e) => e.result === "action").length,
  };
}

// ── component ──────────────────────────────────────────────────────────────

function HistoryPage() {
  const navigate = useNavigate();

  // In a real implementation, replace MOCK_HISTORY with an API / Supabase call
  const allHistory = MOCK_HISTORY;
  const loading = false;  // set to true while fetching from API
  const fetchError = null; // set to an error message string on failure

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const stats = useMemo(() => buildStats(allHistory), [allHistory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allHistory.filter((entry) => {
      const matchesQuery =
        !q ||
        entry.email.toLowerCase().includes(q) ||
        entry.domain.toLowerCase().includes(q);
      const matchesFilter =
        activeFilter === "all" || entry.result === activeFilter;
      return matchesQuery && matchesFilter;
    });
  }, [allHistory, query, activeFilter]);

  function handleViewResult(entry) {
    navigate("/results", {
      state: {
        domain: entry.domain,
        isDemo: true,
        checks: entry.checks,
      },
    });
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-16 pt-10 sm:px-8 lg:px-12">

        {/* ── Page Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#071B36]">
              Your Email Check History
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep track of your email health and see how your delivery improves over time.
            </p>
          </div>

          <Link
            to="/scan"
            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#007F59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Run New Check
          </Link>
        </div>

        {/* ── Demo Notice ── */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <div className="flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>
              History preview: the entries below are sample data. Your real check
              history will appear here once the backend service is connected.
            </p>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Total Checks
            </p>
            <p className="mt-2 text-3xl font-bold text-[#071B36]">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
              Looking Good
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-800">
              {stats.good}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Needs Attention
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-800">
              {stats.attention + stats.action}
            </p>
          </div>
        </div>

        {/* ── Search + Filter Bar ── */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search by email address or domain…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
            <Filter size={14} className="shrink-0 text-gray-400" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  activeFilter === f.value
                    ? "border-emerald-600 bg-emerald-700 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── History List ── */}
        {loading ? (
          <LoadingState />
        ) : fetchError ? (
          <ErrorState message={fetchError} />
        ) : filtered.length === 0 ? (
          allHistory.length === 0 ? (
            <EmptyState />
          ) : (
            <NoResultsState
              onClear={() => {
                setQuery("");
                setActiveFilter("all");
              }}
            />
          )
        ) : (
          <HistoryList entries={filtered} onView={handleViewResult} />
        )}

      </main>

      <Footer />
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────

function HistoryList({ entries, onView }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Table header — desktop */}
      <div className="hidden grid-cols-[minmax(0,2fr)_130px_160px_120px] gap-4 border-b border-gray-100 bg-[#F4F7FC] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 md:grid">
        <span>Email / Domain</span>
        <span>Date</span>
        <span>Result</span>
        <span className="text-right">Action</span>
      </div>

      <ul>
        {entries.map((entry, index) => {
          const cfg = RESULT_CONFIG[entry.result] ?? RESULT_CONFIG.attention;
          const Icon = cfg.icon;

          return (
            <li
              key={entry.id}
              className={`grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-gray-50 md:grid-cols-[minmax(0,2fr)_130px_160px_120px] md:items-center md:gap-4 ${
                index !== 0 ? "border-t border-gray-100" : ""
              }`}
            >
              {/* Email + summary */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#071B36]">
                  {entry.email}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {entry.summary}
                </p>
              </div>

              {/* Date & Badge row on mobile, separate grid cells on md+ */}
              <div className="flex flex-wrap items-center justify-between gap-2 md:contents">
                <div className="flex items-center gap-1.5">
                  <ClockIcon size={13} className="shrink-0 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {friendlyDate(entry.date)}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.badgeCls}`}
                  >
                    <Icon size={13} className="shrink-0" />
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* View button */}
              <div className="pt-1 md:pt-0 md:text-right">
                <button
                  type="button"
                  onClick={() => onView(entry)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 sm:w-auto sm:py-1.5"
                >
                  View result
                  <ArrowRight size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer count */}
      <div className="border-t border-gray-100 bg-[#F4F7FC] px-5 py-3">
        <p className="text-xs text-gray-500">
          Showing {entries.length} {entries.length === 1 ? "check" : "checks"}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <MailSearch size={30} className="text-emerald-600" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-gray-900">
        No checks yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        Run your first email check to see how your business emails are performing. It only takes a minute.
      </p>
      <Link
        to="/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Run my first check
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function NoResultsState({ onClear }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-14 text-center">
      <Search size={30} className="mx-auto mb-4 text-gray-300" />
      <h2 className="text-base font-semibold text-gray-900">
        No matching checks found
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search or filter.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-sm font-medium text-emerald-700 hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
      <p className="text-sm text-gray-500">Loading your check history…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-8 py-14 text-center">
      <AlertCircle size={28} className="mx-auto mb-3 text-red-500" />
      <h2 className="text-base font-semibold text-red-800">
        Unable to load history
      </h2>
      <p className="mt-1 text-sm text-red-700">
        {message || "Something went wrong. Please try again later."}
      </p>
    </div>
  );
}

export default HistoryPage;
