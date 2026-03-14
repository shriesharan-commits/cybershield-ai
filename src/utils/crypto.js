// ─── CRYPTOGRAPHIC UTILITIES ─────────────────────────────────────────────────

/**
 * Computes SHA-256 hash of a string using the Web Crypto API.
 * @param {string} msg - The input string to hash.
 * @returns {Promise<string>} Hex-encoded SHA-256 digest.
 */
export const sha256 = async (msg) => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(msg)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Pure-JS MD5 implementation (RFC 1321).
 * NOTE: MD5 is cryptographically broken — use only for legacy compatibility checks.
 * @param {string} str - The input string to hash.
 * @returns {string} Hex-encoded MD5 digest.
 */
export const md5 = (str) => {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  let l = str.length,
    i = 0;
  const words = [];
  for (i = 0; i < l; i++) {
    words[i >> 2] = words[i >> 2] | (str.charCodeAt(i) << ((i % 4) << 3));
  }
  words[l >> 2] |= 0x80 << ((l % 4) << 3);
  words[((((l + 8) >> 6) << 4) + 14)] = l * 8;

  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878;

  for (i = 0; i < words.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    a = md5ff(a,b,c,d,words[i],7,-680876936);     d = md5ff(d,a,b,c,words[i+1],12,-389564586);
    c = md5ff(c,d,a,b,words[i+2],17,606105819);   b = md5ff(b,c,d,a,words[i+3],22,-1044525330);
    a = md5ff(a,b,c,d,words[i+4],7,-176418897);   d = md5ff(d,a,b,c,words[i+5],12,1200080426);
    c = md5ff(c,d,a,b,words[i+6],17,-1473231341); b = md5ff(b,c,d,a,words[i+7],22,-45705983);
    a = md5ff(a,b,c,d,words[i+8],7,1770035416);   d = md5ff(d,a,b,c,words[i+9],12,-1958414417);
    c = md5ff(c,d,a,b,words[i+10],17,-42063);     b = md5ff(b,c,d,a,words[i+11],22,-1990404162);
    a = md5ff(a,b,c,d,words[i+12],7,1804603682);  d = md5ff(d,a,b,c,words[i+13],12,-40341101);
    c = md5ff(c,d,a,b,words[i+14],17,-1502002290);b = md5ff(b,c,d,a,words[i+15],22,1236535329);
    a = md5gg(a,b,c,d,words[i+1],5,-165796510);   d = md5gg(d,a,b,c,words[i+6],9,-1069501632);
    c = md5gg(c,d,a,b,words[i+11],14,643717713);  b = md5gg(b,c,d,a,words[i],20,-373897302);
    a = md5gg(a,b,c,d,words[i+5],5,-701558691);   d = md5gg(d,a,b,c,words[i+10],9,38016083);
    c = md5gg(c,d,a,b,words[i+15],14,-660478335); b = md5gg(b,c,d,a,words[i+4],20,-405537848);
    a = md5gg(a,b,c,d,words[i+9],5,568446438);    d = md5gg(d,a,b,c,words[i+14],9,-1019803690);
    c = md5gg(c,d,a,b,words[i+3],14,-187363961);  b = md5gg(b,c,d,a,words[i+8],20,1163531501);
    a = md5gg(a,b,c,d,words[i+13],5,-1444681467); d = md5gg(d,a,b,c,words[i+2],9,-51403784);
    c = md5gg(c,d,a,b,words[i+7],14,1735328473);  b = md5gg(b,c,d,a,words[i+12],20,-1926607734);
    a = md5hh(a,b,c,d,words[i+5],4,-378558);      d = md5hh(d,a,b,c,words[i+8],11,-2022574463);
    c = md5hh(c,d,a,b,words[i+11],16,1839030562); b = md5hh(b,c,d,a,words[i+14],23,-35309556);
    a = md5hh(a,b,c,d,words[i+1],4,-1530992060);  d = md5hh(d,a,b,c,words[i+4],11,1272893353);
    c = md5hh(c,d,a,b,words[i+7],16,-155497632);  b = md5hh(b,c,d,a,words[i+10],23,-1094730640);
    a = md5hh(a,b,c,d,words[i+13],4,681279174);   d = md5hh(d,a,b,c,words[i],11,-358537222);
    c = md5hh(c,d,a,b,words[i+3],16,-722521979);  b = md5hh(b,c,d,a,words[i+6],23,76029189);
    a = md5hh(a,b,c,d,words[i+9],4,-640364487);   d = md5hh(d,a,b,c,words[i+12],11,-421815835);
    c = md5hh(c,d,a,b,words[i+15],16,530742520);  b = md5hh(b,c,d,a,words[i+2],23,-995338651);
    a = md5ii(a,b,c,d,words[i],6,-198630844);      d = md5ii(d,a,b,c,words[i+7],10,1126891415);
    c = md5ii(c,d,a,b,words[i+14],15,-1416354905);b = md5ii(b,c,d,a,words[i+5],21,-57434055);
    a = md5ii(a,b,c,d,words[i+12],6,1700485571);  d = md5ii(d,a,b,c,words[i+3],10,-1894986606);
    c = md5ii(c,d,a,b,words[i+10],15,-1051523);   b = md5ii(b,c,d,a,words[i+1],21,-2054922799);
    a = md5ii(a,b,c,d,words[i+8],6,1873313359);   d = md5ii(d,a,b,c,words[i+15],10,-30611744);
    c = md5ii(c,d,a,b,words[i+6],15,-1560198380); b = md5ii(b,c,d,a,words[i+13],21,1309151649);
    a = md5ii(a,b,c,d,words[i+4],6,-145523070);   d = md5ii(d,a,b,c,words[i+11],10,-1120210379);
    c = md5ii(c,d,a,b,words[i+2],15,718787259);   b = md5ii(b,c,d,a,words[i+9],21,-343485551);
    a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
  }

  return [a, b, c, d]
    .map((n) => {
      let hex = "";
      for (let j = 0; j < 4; j++)
        hex +=
          ((n >> (j * 8 + 4)) & 0x0f).toString(16) +
          ((n >> (j * 8)) & 0x0f).toString(16);
      return hex;
    })
    .join("");
};

/**
 * Calculates Shannon entropy of a password in bits.
 * Higher entropy = more unpredictable = harder to crack.
 * @param {string} pw - The password string.
 * @returns {number} Entropy in bits.
 */
export const passwordEntropy = (pw) => {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  return pw.length * Math.log2(pool || 1);
};

/**
 * Caesar cipher — shifts alphabetic characters by a fixed amount.
 * @param {string} text - Input text.
 * @param {number} shift - Number of positions to shift (1–25).
 * @param {boolean} decrypt - If true, reverses the shift.
 * @returns {string} Transformed text.
 */
export const caesarCipher = (text, shift, decrypt = false) => {
  const s = decrypt ? (26 - shift) % 26 : shift;
  return text
    .split("")
    .map((c) => {
      if (/[a-z]/.test(c))
        return String.fromCharCode(((c.charCodeAt(0) - 97 + s) % 26) + 97);
      if (/[A-Z]/.test(c))
        return String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65);
      return c;
    })
    .join("");
};
