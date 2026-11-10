import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ClockIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MailSearch,
  ArrowRight,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getScanHistory, deleteScan } from "../services/api";

/**
 * Format an ISO timestamp string into a friendly relative label
 */
function friendlyDate(isoString) {
  if (!isoString) return "Recent";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 6) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getResultKey(score) {
  if (score >= 80) return "good";
  if (score >= 50) return "attention";
  return "action";
}

const RESULT_CONFIG = {
  good: {
    label: "Looking good",
    icon: CheckCircle2,
    badgeCls: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  attention: {
    label: "Needs attention",
    icon: AlertTriangle,
    badgeCls: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  action: {
    label: "Action recommended",
    icon: AlertCircle,
    badgeCls: "bg-red-50 text-red-700 border border-red-200",
  },
};

const FILTERS = [
  { value: "all", label: "All checks" },
  { value: "good", label: "Looking good (80+)" },
  { value: "attention", label: "Needs attention (50-79)" },
  { value: "action", label: "Action recommended (<50)" },
];

function HistoryPage() {
  const navigate = useNavigate();

  const [scans, setScans] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const params = {
        page,
        limit: 10,
      };

      if (query.trim()) {
        params.search = query.trim();
      }

      const res = await getScanHistory(params);

      if (res && res.data) {
        setScans(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to fetch scan history:", err);
      setFetchError(err.message || "Failed to load scan history.");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Client-side score filter
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      if (activeFilter === "all") return true;
      return getResultKey(scan.score) === activeFilter;
    });
  }, [scans, activeFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: pagination.total,
      good: scans.filter((s) => s.score >= 80).length,
      attention: scans.filter((s) => s.score < 80).length,
    };
  }, [scans, pagination.total]);

  function handleViewResult(entry) {
    navigate("/results", {
      state: {
        scanId: entry.id,
        domain: entry.domain,
        score: entry.score,
        status: entry.status,
        summary: entry.summary,
        results: entry.results,
        isDemo: false,
      },
    });
  }

  async function handleDeleteScan(e, id) {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this scan record?")) {
      return;
    }

    try {
      setDeletingId(id);
      // Optimistic deletion
      setScans((prev) => prev.filter((s) => s.id !== id));
      await deleteScan(id);
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete scan:", err);
      alert(err.message || "Failed to delete scan record.");
      fetchHistory();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#071B36]">
              Your Email Check History
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your domain health over time to ensure your quotes, proposals, and invoices reliably reach clients' inboxes.
            </p>
          </div>

          <Link
            to="/scan"
            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#007F59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Run New Domain Check
          </Link>
        </div>

        {/* Summary Stats */}
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
              {stats.attention}
            </p>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search by domain name…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
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

        {/* History List Content */}
        {loading && scans.length === 0 ? (
          <LoadingState />
        ) : fetchError ? (
          <ErrorState message={fetchError} onRetry={fetchHistory} />
        ) : filteredScans.length === 0 ? (
          scans.length === 0 ? (
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
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Table Header */}
            <div className="hidden grid-cols-[minmax(0,2fr)_130px_160px_140px] gap-4 border-b border-gray-100 bg-[#F4F7FC] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 md:grid">
              <span>Domain / Health</span>
              <span>Date</span>
              <span>Score & Status</span>
              <span className="text-right">Actions</span>
            </div>

            <ul>
              {filteredScans.map((entry, index) => {
                const resultKey = getResultKey(entry.score);
                const cfg = RESULT_CONFIG[resultKey];
                const Icon = cfg.icon;

                return (
                  <li
                    key={entry.id}
                    className={`grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-gray-50 md:grid-cols-[minmax(0,2fr)_130px_160px_140px] md:items-center md:gap-4 ${
                      index !== 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    {/* Domain & Summary metrics */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#071B36]">
                        {entry.domain}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {entry.summary
                          ? `${entry.summary.passed || 0} passed • ${
                              entry.summary.warnings || 0
                            } warnings • ${entry.summary.errors || 0} errors`
                          : `Status: ${entry.status}`}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ClockIcon size={13} className="shrink-0 text-gray-400" />
                      <span>{friendlyDate(entry.created_at)}</span>
                    </div>

                    {/* Score Badge */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.badgeCls}`}
                      >
                        <Icon size={13} className="shrink-0" />
                        {entry.score}/100 • {cfg.label}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 md:pt-0">
                      <button
                        type="button"
                        onClick={() => handleViewResult(entry)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                      >
                        View
                        <ArrowRight size={13} />
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === entry.id}
                        onClick={(e) => handleDeleteScan(e, entry.id)}
                        aria-label="Delete scan"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === entry.id ? (
                          <LoaderCircle size={14} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination & Summary Footer */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-[#F4F7FC] px-5 py-3 sm:flex-row">
              <p className="text-xs text-gray-500">
                Showing {filteredScans.length} of {pagination.total} total checks
              </p>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>

                  <span className="text-xs text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <MailSearch size={30} className="text-emerald-600" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-gray-900">No domain checks yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        Run your first email check to see whether your business proposals and invoices are landing in spam. It takes less than 60 seconds.
      </p>
      <Link
        to="/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Run My First Domain Check
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
        Try adjusting your search query or filter selection.
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
      <LoaderCircle size={28} className="animate-spin text-emerald-700" />
      <p className="mt-3 text-sm text-gray-500">Loading your check history…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-8 py-14 text-center">
      <AlertCircle size={28} className="mx-auto mb-3 text-red-500" />
      <h2 className="text-base font-semibold text-red-800">
        Unable to load history
      </h2>
      <p className="mt-1 text-sm text-red-700">
        {message || "Something went wrong. Please check your backend connection."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default HistoryPage;
