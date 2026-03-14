// ─── src/hooks/useAPI.js ──────────────────────────────────────────────────────
// Custom React hooks that call the Express backend API.
// Each hook manages its own loading/error/data state.

import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api"; // Proxied by Vite → http://localhost:5000

// ─── GENERIC FETCH HOOK ───────────────────────────────────────────────────────
/**
 * Generic data fetching hook.
 * @param {string} endpoint - API path e.g. "/cves"
 * @param {object} params   - Optional query parameters
 */
export function useFetch(endpoint, params = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "ALL")
  ).toString();

  const url = `${BASE_URL}${endpoint}${queryString ? "?" + queryString : ""}`;

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

// ─── CVE HOOKS ────────────────────────────────────────────────────────────────

/**
 * Fetches CVEs with optional filtering and search.
 * @param {{ search?: string, severity?: string, vector?: string }} filters
 */
export function useCVEs(filters = {}) {
  return useFetch("/cves", filters);
}

/**
 * Fetches aggregate CVE stats for the dashboard metric cards.
 */
export function useCVEStats() {
  return useFetch("/cves/stats/summary");
}

/**
 * Fetches a single CVE by ID.
 * @param {string} id - e.g. "CVE-2024-3094"
 */
export function useCVE(id) {
  return useFetch(id ? `/cves/${id}` : null);
}

// ─── DASHBOARD HOOKS ──────────────────────────────────────────────────────────

/**
 * Fetches the security alert feed from the database.
 */
export function useAlerts() {
  return useFetch("/dashboard/alerts");
}

/**
 * Fetches threat distribution data for the bar chart.
 */
export function useThreatDistribution() {
  return useFetch("/dashboard/threat-distribution");
}

// ─── MUTATION HELPERS ─────────────────────────────────────────────────────────

/**
 * Adds a new CVE to the database.
 * @param {object} cveData - The CVE fields to insert
 * @returns {Promise<object>} The created CVE record
 */
export async function addCVE(cveData) {
  const res = await fetch(`${BASE_URL}/cves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cveData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/**
 * Updates a CVE record.
 * @param {string} id     - CVE ID to update
 * @param {object} fields - Fields to update (partial)
 */
export async function updateCVE(id, fields) {
  const res = await fetch(`${BASE_URL}/cves/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/**
 * Deletes a CVE record.
 * @param {string} id - CVE ID to delete
 */
export async function deleteCVE(id) {
  const res = await fetch(`${BASE_URL}/cves/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.message;
}

/**
 * Adds a new alert to the dashboard feed.
 * @param {{ type: string, message: string, time_ago?: string }} alertData
 */
export async function addAlert(alertData) {
  const res = await fetch(`${BASE_URL}/dashboard/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alertData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
