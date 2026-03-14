# 🛡️ CyberShield AI — Final Year Cybersecurity Project

A fully functional, client-side cybersecurity toolkit with 7 integrated modules.  
**Zero data transmitted — all analysis runs entirely in the browser.**

---

## 📁 Project Structure

```
cybershield/
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite bundler config
├── package.json                      # Dependencies
├── README.md
└── src/
    ├── main.jsx                      # React DOM entry point
    ├── App.jsx                       # Root component + navigation
    │
    ├── styles/
    │   └── global.css                # All CSS variables, layout, utilities
    │
    ├── data/
    │   └── constants.js              # CVE database, alert feed, sample data
    │
    ├── utils/
    │   ├── crypto.js                 # sha256, md5, passwordEntropy, caesarCipher
    │   └── analyzers.js              # analyzeURL (phishing), jwtDecode
    │
    └── components/
        ├── MatrixCanvas.jsx          # Animated matrix rain background
        ├── Dashboard.jsx             # Live metrics + traffic charts + alert feed
        ├── PhishingAnalyzer.jsx      # URL phishing heuristic scanner
        ├── PasswordAnalyzer.jsx      # Entropy analyzer + CSPRNG generator
        ├── HashToolkit.jsx           # SHA-256 / MD5 / Base64 / Base32 + hex dump
        ├── JWTAnalyzer.jsx           # JWT decoder + OWASP security audit
        ├── EncryptionPlayground.jsx  # Caesar / XOR / ROT-13 / Base64 demo
        └── ThreatIntel.jsx           # Searchable 2024 CVE database
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔬 Modules

| Module | Key Feature | Security Concept Covered |
|---|---|---|
| **Dashboard** | Live network traffic + threat chart | SOC monitoring, threat landscape |
| **Phishing Analyzer** | IDN homograph, TLD, keyword detection | URL-based social engineering |
| **Password Lab** | Entropy bits + GPU crack-time estimation | Authentication security |
| **Hash Toolkit** | SHA-256, MD5, Base64, Base32, hex dump | Cryptographic hash functions |
| **JWT Scanner** | alg:none attack, missing claims audit | Broken authentication (OWASP #2) |
| **Crypto Playground** | Caesar, XOR, ROT-13 with explanations | Classical → modern cryptography |
| **Threat Intel** | Searchable CVE table with CVSS scores | Vulnerability management |

---

## 🏗️ Architecture Decisions

- **No backend / no API keys required** — runs entirely in the browser
- **Web Crypto API** used for SHA-256 (native, FIPS 140-2 compliant)
- **crypto.getRandomValues()** for CSPRNG password generation (not Math.random)
- **Pure-JS MD5** included only as a deprecated-algorithm demonstration
- **Recharts** for real-time data visualization
- **Vite** for fast HMR during development

---

## 🎓 Academic Context

This project demonstrates practical understanding of:
- OWASP Top 10 vulnerability classes
- Cryptographic algorithm security levels (NIST recommendations)
- 2024 real-world CVEs (XZ Utils backdoor, Fortinet, Jenkins, PHP)
- Shannon entropy and information-theoretic security
- Browser security APIs (SubtleCrypto, getRandomValues)

---

*All analysis is educational and runs client-side. No sensitive data leaves the browser.*
