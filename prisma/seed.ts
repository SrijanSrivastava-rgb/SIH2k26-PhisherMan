import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PhisherMan Cyber-Void Database...');

  // 1. Seed Default Admin User
  const passwordHash = await bcrypt.hash('PhisherMan2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@phisherman.cyber' },
    update: {},
    create: {
      email: 'admin@phisherman.cyber',
      name: 'Cyber Immunity Operator',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=PhisherManOperator',
      settings: {
        create: {
          autoQuarantine: true,
          scanTimeoutSeconds: 30,
          alertEmail: 'admin@phisherman.cyber',
          customRules: JSON.stringify({ blockNewlyRegistered: true, strictSslValidation: true }),
          apiKeys: JSON.stringify({ virustotal: '', abuseipdb: '', openai: '', google_safebrowsing: '' }),
        },
      },
    },
  });

  // 2. Import Phishing Dataset from SQL file
  const sqlPath = path.join(__dirname, '../temp_repo/phishing-dataset-import-and-analysis-1786940417297.sql');
  if (fs.existsSync(sqlPath)) {
    console.log('Importing phishing dataset from SQL dump...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    const insertLines = sqlContent.split('\n').filter((l) => l.startsWith('INSERT INTO public.phishing_dataset'));

    let importedCount = 0;
    for (const line of insertLines) {
      const match = line.match(/VALUES\s*\((.+)\);/);
      if (!match) continue;

      const rawValues = match[1];
      // Helper to parse SQL value list safely
      const tokens: string[] = [];
      let inString = false;
      let currentToken = '';

      for (let i = 0; i < rawValues.length; i++) {
        const char = rawValues[i];
        if (char === "'" && (i === 0 || rawValues[i - 1] !== '\\')) {
          inString = !inString;
        } else if (char === ',' && !inString) {
          tokens.push(currentToken.trim());
          currentToken = '';
        } else {
          currentToken += char;
        }
      }
      if (currentToken.trim()) tokens.push(currentToken.trim());

      if (tokens.length >= 19) {
        const cleanStr = (val: string) => {
          if (!val || val === 'NULL') return null;
          return val.replace(/^'|'$/g, '').trim();
        };

        const cleanInt = (val: string) => {
          if (!val || val === 'NULL') return null;
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? null : parsed;
        };

        const cleanBool = (val: string) => {
          if (!val || val === 'NULL') return false;
          return val.toLowerCase() === 'true' || val === '1';
        };

        const id = cleanInt(tokens[0]);
        if (!id) continue;

        await prisma.phishingDataset.upsert({
          where: { id },
          update: {},
          create: {
            id,
            url: cleanStr(tokens[1]) || '',
            domain: cleanStr(tokens[2]) || '',
            label: cleanInt(tokens[3]) ?? 0,
            source: cleanStr(tokens[4]),
            targetBrand: cleanStr(tokens[5]),
            urlLength: cleanInt(tokens[6]),
            domainLength: cleanInt(tokens[7]),
            numDots: cleanInt(tokens[8]),
            numHyphens: cleanInt(tokens[9]),
            numDigits: cleanInt(tokens[10]),
            hasIpAddress: cleanBool(tokens[11]),
            hasAtSymbol: cleanBool(tokens[12]),
            hasHttps: cleanBool(tokens[13]),
            subdomainCount: cleanInt(tokens[14]),
            tld: cleanStr(tokens[15]),
            isPunycode: cleanBool(tokens[16]),
            minBrandLevenshtein: cleanInt(tokens[17]),
            closestBrand: cleanStr(tokens[18]),
          },
        });
        importedCount++;
      }
    }
    console.log(`Successfully imported ${importedCount} dataset records into SQLite.`);
  }

  // 3. Seed Initial Scan Results
  const sampleScans = [
    {
      url: 'https://paypaI-security-auth.net/login',
      domain: 'paypaI-security-auth.net',
      ipAddress: '194.26.29.110',
      status: 'COMPLETED',
      overallScore: 94,
      verdict: 'QUARANTINED',
      dnsData: JSON.stringify({
        aRecords: ['194.26.29.110'],
        mxRecords: [],
        nsRecords: ['ns1.offshore-dns.net', 'ns2.offshore-dns.net'],
        txtRecords: ['v=spf1 -all'],
        socketLatencyMs: 14,
        resolved: true,
      }),
      whoisData: JSON.stringify({
        registrar: 'NameCheap Inc. (Proxy Protected)',
        creationDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        domainAgeDays: 4,
        isNewDomain: true,
      }),
      sslData: JSON.stringify({
        valid: false,
        issuer: "Let's Encrypt Free DV (Expired)",
        validTo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: -2,
        protocol: 'TLSv1.2',
      }),
      domData: JSON.stringify({
        title: 'PayPal - Sign In to Your Account',
        hasLoginForm: true,
        hasPasswordInput: true,
        hiddenFieldsCount: 6,
        externalScriptRatio: 0.85,
        suspiciousFormActions: ['http://194.26.29.110/gate.php'],
      }),
      visualData: JSON.stringify({
        matchedBrand: 'PayPal',
        similarityScore: 94,
        typosquattingDetected: true,
      }),
      aiExplanation:
        "CRITICAL THREAT VERDICT: Target domain 'paypaI-security-auth.net' has been classified as QUARANTINED (Risk Score: 94/100). The target exhibits severe brand impersonation (94% visual match to PayPal), registered 4 days ago via a privacy proxy. The DOM contains a credential harvester form posting sensitive tokens to external IP 194.26.29.110. Immediate quarantine recommended.",
      stepTimings: JSON.stringify([
        { step: 'DNS Socket Interception', durationMs: 14, status: 'PASSED', details: 'Resolved IP: 194.26.29.110' },
        { step: 'WHOIS Registry Lookup', durationMs: 110, status: 'WARNING', details: 'Domain Age: 4 days' },
        { step: 'SSL Cert Security Verification', durationMs: 85, status: 'FAILED', details: 'Expired Certificate' },
        { step: 'DOM Analysis & Behavioral Inspection', durationMs: 140, status: 'FAILED', details: 'Credential harvester form detected' },
        { step: 'Visual Similarity & Brand Heuristics', durationMs: 40, status: 'FAILED', details: '94% visual match to PayPal' },
        { step: 'Final Verdict & AI Analysis', durationMs: 10, status: 'PASSED', details: 'Score: 94/100 - QUARANTINED' },
      ]),
      userId: adminUser.id,
    },
    {
      url: 'https://github.com/trending',
      domain: 'github.com',
      ipAddress: '140.82.121.4',
      status: 'COMPLETED',
      overallScore: 5,
      verdict: 'SAFE',
      dnsData: JSON.stringify({
        aRecords: ['140.82.121.4'],
        mxRecords: ['aspmx.l.google.com'],
        nsRecords: ['dns1.p08.nsone.net', 'dns2.p08.nsone.net'],
        txtRecords: ['v=spf1 include:mail.github.com ~all'],
        socketLatencyMs: 8,
        resolved: true,
      }),
      whoisData: JSON.stringify({
        registrar: 'MarkMonitor Inc.',
        creationDate: '2007-10-09T18:20:50Z',
        domainAgeDays: 6885,
        isNewDomain: false,
      }),
      sslData: JSON.stringify({
        valid: true,
        issuer: 'DigiCert TLS Hybrid ECC SHA384 2020 CA1',
        validTo: '2027-03-15T12:00:00Z',
        daysRemaining: 210,
        protocol: 'TLSv1.3',
      }),
      domData: JSON.stringify({
        title: 'Trending repositories on GitHub today',
        hasLoginForm: false,
        hasPasswordInput: false,
        hiddenFieldsCount: 12,
        externalScriptRatio: 0.05,
        suspiciousFormActions: [],
      }),
      visualData: JSON.stringify({
        matchedBrand: null,
        similarityScore: 0,
        typosquattingDetected: false,
      }),
      aiExplanation:
        "VERIFIED SAFE DOMAIN: Target 'github.com' passed all 6 security verification layers with an overall risk score of 5/100. Valid DigiCert EV SSL certificate, verified DNS socket telemetry, and clean DOM behavioral profiles.",
      stepTimings: JSON.stringify([
        { step: 'DNS Socket Interception', durationMs: 8, status: 'PASSED', details: 'Resolved IP: 140.82.121.4' },
        { step: 'WHOIS Registry Lookup', durationMs: 45, status: 'PASSED', details: 'Domain Age: 6885 days' },
        { step: 'SSL Cert Security Verification', durationMs: 30, status: 'PASSED', details: 'DigiCert Valid' },
        { step: 'DOM Analysis & Behavioral Inspection', durationMs: 90, status: 'PASSED', details: 'Clean profile' },
        { step: 'Visual Similarity & Brand Heuristics', durationMs: 15, status: 'PASSED', details: 'No brand spoofing' },
        { step: 'Final Verdict & AI Analysis', durationMs: 5, status: 'PASSED', details: 'Score: 5/100 - SAFE' },
      ]),
      userId: adminUser.id,
    },
    {
      url: 'https://m1crosoft-office365-verify.com/login.html',
      domain: 'm1crosoft-office365-verify.com',
      ipAddress: '45.142.214.7',
      status: 'COMPLETED',
      overallScore: 88,
      verdict: 'PHISHING',
      dnsData: JSON.stringify({
        aRecords: ['45.142.214.7'],
        mxRecords: [],
        nsRecords: ['ns1.bulletproof-host.ru'],
        txtRecords: [],
        socketLatencyMs: 22,
        resolved: true,
      }),
      whoisData: JSON.stringify({
        registrar: 'Regtime Ltd.',
        creationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        domainAgeDays: 7,
        isNewDomain: true,
      }),
      sslData: JSON.stringify({
        valid: false,
        issuer: 'Self-Signed Untrusted',
        validTo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 10,
        protocol: 'TLSv1.2',
      }),
      domData: JSON.stringify({
        title: 'Sign in to your Microsoft account',
        hasLoginForm: true,
        hasPasswordInput: true,
        hiddenFieldsCount: 4,
        externalScriptRatio: 0.9,
        suspiciousFormActions: ['http://45.142.214.7/steal.php'],
      }),
      visualData: JSON.stringify({
        matchedBrand: 'Microsoft',
        similarityScore: 88,
        typosquattingDetected: true,
      }),
      aiExplanation:
        "CRITICAL PHISHING ALERT: Target 'm1crosoft-office365-verify.com' detected attempting OAuth session hijacking against Microsoft 365. Homoglyph substitute ('1' instead of 'i'), registered 7 days ago.",
      stepTimings: JSON.stringify([]),
      userId: adminUser.id,
    },
  ];

  for (const scan of sampleScans) {
    await prisma.scanResult.create({ data: scan });
  }

  // 4. Seed Threat Campaigns
  const sampleCampaigns = [
    {
      name: 'Operation Cyber-Phantom',
      target: 'North American Banking Sector',
      threatLevel: 'CRITICAL',
      description: 'Distributed phishing infrastructure targeting online banking portals with reverse-proxy session hijackers.',
      status: 'ACTIVE',
      maliciousDomains: JSON.stringify([
        'paypaI-security-auth.net',
        'chase-online-verify-auth.com',
        'wellsfarg0-account-update.net',
      ]),
      maliciousIPs: JSON.stringify(['194.26.29.110', '45.142.214.7', '185.220.101.5']),
      iocs: JSON.stringify([
        'SHA256: 8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
        'POST /gate.php HTTP/1.1',
        'User-Agent: PhishKit-v4.2',
      ]),
      originLat: 55.7558,
      originLng: 37.6173,
      targetLat: 38.8951,
      targetLng: -77.0364,
    },
    {
      name: 'Apex Typo-Squatter Wave',
      target: 'Crypto Exchanges & Web3 Wallets',
      threatLevel: 'HIGH',
      description: 'Automated registration of 200+ homoglyph domains targeting Binance, Coinbase, and MetaMask users.',
      status: 'ACTIVE',
      maliciousDomains: JSON.stringify(['blnance-security.io', 'co1nbase-wallet-login.com', 'metamask-auth-fix.net']),
      maliciousIPs: JSON.stringify(['103.251.167.2', '91.240.118.15']),
      iocs: JSON.stringify(['JSON-RPC interception script', 'Fake seed phrase prompt modal']),
      originLat: 21.0285,
      originLng: 105.8542,
      targetLat: 37.7749,
      targetLng: -122.4194,
    },
  ];

  for (const campaign of sampleCampaigns) {
    await prisma.threatCampaign.create({ data: campaign });
  }

  // 5. Seed Threat Map Pings
  const samplePings = [
    {
      sourceIp: '194.26.29.110',
      targetIp: '54.239.28.85',
      sourceCountry: 'Russia (RU)',
      targetCountry: 'United States (US)',
      sourceLat: 55.7558,
      sourceLng: 37.6173,
      targetLat: 38.8951,
      targetLng: -77.0364,
      threatType: 'PayPal Credential Harvester',
      severity: 'CRITICAL',
    },
    {
      sourceIp: '45.142.214.7',
      targetIp: '13.107.42.14',
      sourceCountry: 'Romania (RO)',
      targetCountry: 'United Kingdom (GB)',
      sourceLat: 44.4323,
      sourceLng: 26.1063,
      targetLat: 51.5074,
      targetLng: -0.1278,
      threatType: 'Microsoft 365 OAuth Phish',
      severity: 'HIGH',
    },
    {
      sourceIp: '185.220.101.5',
      targetIp: '104.16.123.96',
      sourceCountry: 'Netherlands (NL)',
      targetCountry: 'India (IN)',
      sourceLat: 52.3676,
      sourceLng: 4.9041,
      targetLat: 28.6139,
      targetLng: 77.209,
      threatType: 'HDFC Bank Typo-Squatting',
      severity: 'CRITICAL',
    },
  ];

  for (const ping of samplePings) {
    await prisma.threatPing.create({ data: ping });
  }

  console.log('Seeding complete! Default login: admin@phisherman.cyber / PhisherMan2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
