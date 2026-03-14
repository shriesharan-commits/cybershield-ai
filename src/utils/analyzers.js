// ─── SECURITY ANALYZER UTILITIES ─────────────────────────────────────────────

/**
 * Analyzes a URL for phishing indicators.
 * Checks: keyword patterns, suspicious TLDs, subdomain depth,
 * numeric patterns, HTTPS enforcement, URL encoding, IDN homograph attacks.
 * @param {string} url - The URL string to inspect.
 * @returns {{ risks: Array<{level: string, msg: string}>, score: number }}
 */
export const analyzeURL = (url) => {
  const risks = [];
  let score = 100;

  try {
    const u = new URL(url.startsWith("http") ? url : "http://" + url);
    const host = u.hostname.toLowerCase();

    // Brand-impersonation / phishing keywords
    const phishingPatterns = [
      "paypa1", "g00gle", "arnazon", "faceb00k", "micros0ft",
      "secure-", "login-", "verify-", "account-", "update-",
      "banking", "wallet", "crypto", "nft", "admin", "support-",
    ];
    phishingPatterns.forEach((p) => {
      if (host.includes(p)) {
        risks.push({ level: "CRITICAL", msg: `Phishing keyword: "${p}"` });
        score -= 30;
      }
    });

    // Abused free / throwaway TLDs
    const suspiciousTLDs = [
      ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq",
      ".top", ".click", ".link", ".online",
    ];
    suspiciousTLDs.forEach((t) => {
      if (host.endsWith(t)) {
        risks.push({ level: "HIGH", msg: `Suspicious TLD: ${t}` });
        score -= 20;
      }
    });

    // Excessive subdomain depth (> 3 dots in hostname)
    if ((host.match(/\./g) || []).length > 3) {
      risks.push({ level: "HIGH", msg: "Excessive subdomains" });
      score -= 15;
    }

    // Long numeric sequences in domain
    if (/\d{4,}/.test(host)) {
      risks.push({ level: "MEDIUM", msg: "Suspicious numeric patterns in domain" });
      score -= 10;
    }

    // No TLS
    if (u.protocol === "http:") {
      risks.push({ level: "MEDIUM", msg: "No HTTPS encryption" });
      score -= 10;
    }

    // Abnormally long URL
    if (url.length > 100) {
      risks.push({ level: "LOW", msg: `Unusually long URL (${url.length} chars)` });
      score -= 5;
    }

    // URL-encoded characters (possible obfuscation)
    if (url.includes("%")) {
      risks.push({ level: "MEDIUM", msg: "URL encoding detected (possible obfuscation)" });
      score -= 10;
    }

    // IDN Homograph Attack — Cyrillic lookalikes
    if (/[а-яА-Я]/.test(url)) {
      risks.push({ level: "CRITICAL", msg: "Cyrillic characters (IDN Homograph Attack!)" });
      score -= 40;
    }

    if (risks.length === 0) {
      risks.push({ level: "SAFE", msg: "No obvious threats detected" });
    }
  } catch {
    risks.push({ level: "CRITICAL", msg: "Malformed/invalid URL" });
    score = 0;
  }

  return { risks, score: Math.max(0, score) };
};

/**
 * Decodes and security-audits a JSON Web Token (JWT).
 * Checks for: alg:none attack, symmetric key weakness, expiry, missing claims.
 * @param {string} token - The raw JWT string (header.payload.signature).
 * @returns {{ valid: boolean, header?, payload?, risks?, error? }}
 */
export const jwtDecode = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT structure");

    const decode = (str) =>
      JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));

    const header = decode(parts[0]);
    const payload = decode(parts[1]);
    const risks = [];

    // Critical: alg:none bypasses signature verification entirely
    if (header.alg === "none")
      risks.push({ level: "CRITICAL", msg: 'Algorithm "none" — no signature verification!' });

    // Medium: symmetric key may be brute-forced
    if (header.alg === "HS256")
      risks.push({ level: "MEDIUM", msg: "Symmetric key — if key is weak, token is forgeable" });

    // Check expiry claim
    if (payload.exp) {
      const exp = new Date(payload.exp * 1000);
      if (exp < new Date())
        risks.push({ level: "HIGH", msg: `Token EXPIRED at ${exp.toLocaleString()}` });
    }
    if (!payload.exp)
      risks.push({ level: "MEDIUM", msg: "No expiry (exp) claim — token never expires" });

    if (!payload.iss)
      risks.push({ level: "LOW", msg: "No issuer (iss) claim" });

    return { valid: true, header, payload, risks };
  } catch (e) {
    return { valid: false, error: e.message };
  }
};
