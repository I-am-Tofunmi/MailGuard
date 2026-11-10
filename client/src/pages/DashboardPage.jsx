import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Globe,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
  X,
  LoaderCircle,
  FileText,
  Trash2,
  RotateCcw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getScanHistory, deleteScan } from "../services/api";

function formatScanDate(isoString) {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardPage() {
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDomains = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getScanHistory({ limit: 5, page });
      if (res && res.data) {
        setDomains(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard domains:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains(currentPage);
  }, [fetchDomains, currentPage]);

  const getStatusStyles = (score) => {
    if (score >= 80) return "text-emerald-800";
    if (score >= 50) return "text-amber-700";
    return "text-red-700";
  };

  const getStatusDot = (score) => {
    if (score >= 80) return "bg-emerald-700";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusLabel = (score) => {
    if (score >= 80) return "Protected";
    if (score >= 50) return "Needs Review";
    return "Action Needed";
  };

  const handleViewReport = (domainItem) => {
    setOpenMenu(null);
    navigate("/results", {
      state: {
        scanId: domainItem.id,
        domain: domainItem.domain,
        score: domainItem.score,
        status: domainItem.status,
        summary: domainItem.summary,
        results: domainItem.results,
        isDemo: false,
      },
    });
  };

  const handleRunNewScan = (domainName) => {
    setOpenMenu(null);
    navigate("/scan", {
      state: { domain: domainName },
    });
  };

  const handleDeleteItem = async (id) => {
    setOpenMenu(null);
    if (!window.confirm("Are you sure you want to remove this domain audit?")) return;
    try {
      setDomains((prev) => prev.filter((d) => d.id !== id));
      await deleteScan(id);
      fetchDomains(currentPage);
    } catch (err) {
      console.error("Failed to delete domain audit:", err);
      fetchDomains(currentPage);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#071B36]">
              Active Monitoring
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review your domain deliverability performance and authentication status.
            </p>
          </div>

          <Link
            to="/scan"
            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#007F59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Plus size={16} />
            Run New Scan
          </Link>
        </div>

        {/* Status Banner */}
        <div className="mb-8 flex items-center gap-3 rounded-lg bg-[#9AF2CC] px-5 py-4">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-900" />

          <p className="text-sm font-medium text-emerald-950">
            {domains.length > 0
              ? `Monitoring ${pagination.total} domain audit ${
                  pagination.total === 1 ? "record" : "records"
                }. Live DNS deliverability engine active.`
              : "No domain checks recorded yet. Run your first scan to track deliverability and authentication health."}
          </p>
        </div>

        {/* Monitoring Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading && domains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LoaderCircle size={28} className="animate-spin text-emerald-700" />
              <p className="mt-3 text-sm text-gray-500">Loading your domains…</p>
            </div>
          ) : domains.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Globe size={36} className="mx-auto mb-3 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">
                No active domains yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                Scan your domain to identify SPF, DKIM, and DMARC issues and track your score.
              </p>
              <Link
                to="/scan"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Scan My Domain
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] border-collapse text-left">
                  <thead className="bg-[#F4F7FC]">
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                      <th className="px-5 py-4">Domain</th>
                      <th className="px-5 py-4">Health Score</th>
                      <th className="px-5 py-4 text-center">Issues Found</th>
                      <th className="px-5 py-4">Last Scan Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {domains.map((item) => {
                      const issuesCount =
                        (item.summary?.warnings || 0) + (item.summary?.errors || 0);

                      return (
                        <tr
                          key={item.id}
                          className="border-t border-gray-100 transition hover:bg-gray-50"
                        >
                          {/* Domain */}
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <Globe
                                size={17}
                                className="shrink-0 text-emerald-700"
                              />
                              <span className="text-sm font-semibold text-[#071B36]">
                                {item.domain}
                              </span>
                            </div>
                          </td>

                          {/* Health Score / Deliverability */}
                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                item.score >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.score >= 50
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.score}%
                            </span>
                          </td>

                          {/* Issues */}
                          <td className="px-5 py-5 text-center">
                            <span
                              className={`text-sm font-semibold ${
                                issuesCount > 0
                                  ? "text-red-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              {issuesCount}
                            </span>
                          </td>

                          {/* Last Scan */}
                          <td className="px-5 py-5">
                            <span className="text-sm text-gray-600">
                              {formatScanDate(item.created_at)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${getStatusDot(
                                  item.score
                                )}`}
                              />
                              <span
                                className={`text-xs font-semibold ${getStatusStyles(
                                  item.score
                                )}`}
                              >
                                {getStatusLabel(item.score)}
                              </span>
                            </div>
                          </td>

                          {/* Actions Menu */}
                          <td className="relative px-5 py-5 text-center">
                            <button
                              type="button"
                              aria-label={`Actions for ${item.domain}`}
                              aria-expanded={openMenu === item.id}
                              onClick={() =>
                                setOpenMenu(openMenu === item.id ? null : item.id)
                              }
                              className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                            >
                              <MoreVertical size={19} />
                            </button>

                            {openMenu === item.id && (
                              <div className="absolute right-10 top-12 z-20 w-44 rounded-lg border border-gray-200 bg-white p-2 text-left shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => handleViewReport(item)}
                                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                >
                                  <FileText size={14} />
                                  View Report
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRunNewScan(item.domain)}
                                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                >
                                  <RotateCcw size={14} />
                                  Re-scan Domain
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                  Delete Scan
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 px-5 py-4">
                <p className="text-xs text-gray-600">
                  Showing {domains.length} of {pagination.total} monitored records
                </p>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className="text-xs text-gray-500">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={currentPage >= pagination.totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
                        setOpenMenu(null);
                      }}
                      className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dashboard Empty Space Branding */}
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF2FD]">
            <ShieldCheck size={25} className="text-emerald-600" strokeWidth={1.5} />
          </div>

          <p className="text-sm italic text-gray-400">
            Secure email delivery made simple.
          </p>
        </div>
      </main>

      {/* Floating Tips Button */}
      <div className="fixed bottom-8 right-5 z-40">
        {showTips && (
          <div className="mb-3 w-[280px] max-w-[calc(100vw-40px)] rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">MailGuard Tips</h3>
              <button
                type="button"
                aria-label="Close tips"
                onClick={() => setShowTips(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={17} />
              </button>
            </div>

            <p className="text-xs leading-6 text-gray-600">
              Regularly review your SPF, DKIM, and DMARC configurations to identify
              email authentication issues before they affect inbox placement.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          aria-expanded={showTips}
          className="flex items-center gap-2 rounded-full bg-[#007F59] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800"
        >
          <Lightbulb size={17} />
          Tips
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default DashboardPage;
