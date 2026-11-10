import { supabase } from "../lib/supabaseClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Helper to fetch authorization headers using the current Supabase session
 */
async function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Could not retrieve Supabase session token:", err);
  }

  return headers;
}

/**
 * Generic fetch wrapper with token injection and error handling
 */
async function apiRequest(endpoint, options = {}) {
  const headers = await getAuthHeaders();

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Runs a DNS deliverability audit for a domain
 * @param {string} domain
 * @param {string[]} [selectors=[]]
 * @returns {Promise<object>}
 */
export async function runAudit(domain, selectors = []) {
  return apiRequest("/scan/audit", {
    method: "POST",
    body: JSON.stringify({ domain, selectors }),
  });
}

/**
 * Fetches paginated scan history for the authenticated user
 * @param {object} [params={}] { page, limit, search, status }
 * @returns {Promise<object>}
 */
export async function getScanHistory(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "all") {
    query.append("status", params.status);
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/history?${queryString}` : "/history";

  return apiRequest(endpoint, {
    method: "GET",
  });
}

/**
 * Fetches a single scan record by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getScanById(id) {
  return apiRequest(`/history/${id}`, {
    method: "GET",
  });
}

/**
 * Deletes a scan record by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteScan(id) {
  return apiRequest(`/history/${id}`, {
    method: "DELETE",
  });
}

export default {
  runAudit,
  getScanHistory,
  getScanById,
  deleteScan,
};
