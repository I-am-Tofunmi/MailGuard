
import { useState } from "react";
import { Link } from "react-router-dom";
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
  AlertTriangle,
  Clock3,
  Info,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sampleDomains = [
  {
    id: 1,
    domain: "company-outreach.com",
    inboxRate: 98.4,
    issues: 0,
    lastScan: "Oct 24, 2024",
    status: "Protected",
  },
  {
    id: 2,
    domain: "marketing-hq.net",
    inboxRate: 94.1,
    issues: 2,
    lastScan: "Oct 23, 2024",
    status: "Needs Review",
  },
  {
    id: 3,
    domain: "internal-secure.io",
    inboxRate: 99.8,
    issues: 0,
    lastScan: "Oct 24, 2024",
    status: "Protected",
  },
  {
    id: 4,
    domain: "client-portal.biz",
    inboxRate: 82.3,
    issues: 1,
    lastScan: "Oct 21, 2024",
    status: "Stale",
  },
  {
    id: 5,
    domain: "store-example.com",
    inboxRate: 91.2,
    issues: 1,
    lastScan: "Oct 20, 2024",
    status: "Needs Review",
  },
  {
    id: 6,
    domain: "agency-mail.com",
    inboxRate: 97.6,
    issues: 0,
    lastScan: "Oct 19, 2024",
    status: "Protected",
  },
];

const ITEMS_PER_PAGE = 4;

function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [showTips, setShowTips] = useState(false);

  const totalPages = Math.ceil(
    sampleDomains.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const visibleDomains = sampleDomains.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getStatusStyles = (status) => {
    switch (status) {
      case "Protected":
        return "text-emerald-800";
      case "Needs Review":
        return "text-amber-700";
      case "Stale":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "Protected":
        return "bg-emerald-700";
      case "Needs Review":
        return "bg-amber-500";
      case "Stale":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
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
              Review your domain performance and email health status.
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

        {/* Demo Banner */}
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <div className="flex items-start gap-2">
            <Info size={16} className="shrink-0" />
            <p>
              Dashboard preview: the domains and inbox rates shown
              below are sample data, not actual monitoring results.
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="mb-8 flex items-center gap-3 rounded-lg bg-[#9AF2CC] px-5 py-4">

          <CheckCircle2
            size={20}
            className="shrink-0 text-emerald-900"
          />

          <p className="text-sm font-medium text-emerald-950">
            Preview of your domain monitoring overview.
            Connect your first domain to begin tracking email health.
          </p>

        </div>

        {/* Monitoring Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse text-left">

              <thead className="bg-[#F4F7FC]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  <th className="px-5 py-4">Domain</th>
                  <th className="px-5 py-4">Inbox Rate</th>
                  <th className="px-5 py-4 text-center">
                    Issues Found
                  </th>
                  <th className="px-5 py-4">Last Scan Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleDomains.map((domain) => (
                  <tr
                    key={domain.id}
                    className="border-t border-gray-100 transition hover:bg-gray-50"
                  >

                    {/* Domain */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <Globe
                          size={17}
                          className="shrink-0 text-emerald-700"
                        />

                        <span className="text-sm font-medium text-[#071B36]">
                          {domain.domain}
                        </span>
                      </div>
                    </td>

                    {/* Inbox Rate */}
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          domain.inboxRate >= 90
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {domain.inboxRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Issues */}
                    <td className="px-5 py-5 text-center">
                      <span
                        className={`text-sm font-medium ${
                          domain.issues > 0
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {domain.issues}
                      </span>
                    </td>

                    {/* Last Scan */}
                    <td className="px-5 py-5">
                      <span className="text-sm text-gray-600">
                        {domain.lastScan}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${getStatusDot(
                            domain.status
                          )}`}
                        />

                        <span
                          className={`text-xs font-medium ${getStatusStyles(
                            domain.status
                          )}`}
                        >
                          {domain.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="relative px-5 py-5 text-center">
                      <button
                        type="button"
                        aria-label={`Actions for ${domain.domain}`}
                        aria-expanded={openMenu === domain.id}
                        onClick={() =>
                          setOpenMenu(
                            openMenu === domain.id
                              ? null
                              : domain.id
                          )
                        }
                        className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                      >
                        <MoreVertical size={19} />
                      </button>

                      {openMenu === domain.id && (
                        <div className="absolute right-10 top-12 z-20 w-44 rounded-lg border border-gray-200 bg-white p-2 text-left shadow-lg">

                          <Link
                            to="/scan"
                            onClick={() => setOpenMenu(null)}
                            className="block rounded px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Run New Scan
                          </Link>

                          <button
                            type="button"
                            onClick={() => setOpenMenu(null)}
                            className="block w-full rounded px-3 py-2 text-left text-xs text-gray-500"
                          >
                            Close Menu
                          </button>

                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">

            <p className="text-xs text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                sampleDomains.length
              )} of {sampleDomains.length} sample domains
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => page - 1)
                }
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((page) => page + 1);
                  setOpenMenu(null);
                }}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>

            </div>
          </div>

        </div>

        {/* Dashboard Empty Space Branding */}
        <div className="mt-16 flex flex-col items-center justify-center text-center">

          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF2FD]">
            <ShieldCheck
              size={25}
              className="text-emerald-600"
              strokeWidth={1.5}
            />
          </div>

          <p className="text-sm italic text-gray-400">
            Secure email delivery made simple.
          </p>

        </div>

      </main>

      {/* Floating Tips Button */}
      <div className="fixed bottom-8 right-5 z-40">

        {showTips && (
          <div className="mb-3 w-[280px] rounded-xl border border-gray-200 bg-white p-5 shadow-xl">

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                MailGuard Tips
              </h3>

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
              Regularly review your SPF, DKIM, and DMARC
              configurations to identify email authentication
              issues before they affect your communications.
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
