/**
 * AI & Rule-Based Explanation Engine for MailGuard.
 * Translates technical DNS deliverability audit results into plain-English guidance
 * tailored for non-technical African SME owners.
 */

/**
 * Builds deterministic, rule-based deliverability explanation.
 * Always available, offline-capable, and zero-latency fallback.
 *
 * @param {string} domain
 * @param {object} results - DNS audit results for mx, spf, dmarc, dkim
 * @param {number} score - Overall deliverability score (0-100)
 * @returns {object} Structured explanation payload
 */
function buildRuleBasedExplanation(domain, results = {}, score = 0) {
  const mx = results.mx || {};
  const spf = results.spf || {};
  const dmarc = results.dmarc || {};
  const dkim = results.dkim || {};

  const steps = [];
  let stepIndex = 1;

  // 1. Evaluate MX (Mail Exchange)
  let mxAnalysis;
  if (mx.hasMx && mx.status === 'pass') {
    mxAnalysis = {
      status: 'pass',
      title: 'Inbound Mail Routing is Active',
      explanation: `Your domain is configured with Mail Exchange (${mx.primaryExchange || 'MX'}) records to receive incoming emails from customers and suppliers.`,
    };
  } else {
    mxAnalysis = {
      status: 'fail',
      title: 'No Inbound Mail Routing Configured',
      explanation: `Your domain is currently unable to receive emails. Anyone sending a message to your business will receive an immediate delivery failure bounce.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'MX',
      title: 'Configure Inbound Mail Routing',
      explanation: 'Required so receiving servers know which mail server handles your company emails.',
      recordType: 'MX',
      host: '@',
      value: 'mail.' + domain,
      priority: 10,
      location: 'DNS Manager (cPanel, Cloudflare, GoDaddy, or Namecheap)',
    });
  }

  // 2. Evaluate SPF (Sender Policy Framework)
  let spfAnalysis;
  const spfQualifier = spf.qualifier ? spf.qualifier.toLowerCase() : null;

  if (spf.rfcViolation) {
    spfAnalysis = {
      status: 'fail',
      title: 'Multiple Conflicting SPF Records Detected',
      explanation: `Your domain has more than one SPF record published. Under international email standards (RFC 7208), having multiple SPF records causes Gmail, Yahoo, and Microsoft to automatically fail authentication with a PermError.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'SPF',
      title: 'Consolidate into One Single SPF Record',
      explanation: 'Merge all authorized sending services into a single TXT record starting with v=spf1 and delete duplicate records.',
      recordType: 'TXT',
      host: '@',
      value: 'v=spf1 include:_spf.google.com ~all',
      location: 'DNS Management -> TXT Records',
    });
  } else if (!spf.hasSpf) {
    spfAnalysis = {
      status: 'fail',
      title: 'Missing SPF Authentication Record',
      explanation: `Without an SPF record, fraudsters and scammers can send fraudulent emails impersonating your company domain. Major email services (Gmail, Yahoo, Outlook) mark unverified emails as junk or spam.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'SPF',
      title: 'Publish an SPF Sender Authorization Record',
      explanation: 'Specifies which mail servers are permitted to send emails on your business behalf.',
      recordType: 'TXT',
      host: '@',
      value: 'v=spf1 include:_spf.google.com ~all',
      location: 'DNS Management -> Add TXT Record',
    });
  } else if (spfQualifier === '?all') {
    spfAnalysis = {
      status: 'warning',
      title: 'Weak SPF Policy Qualifier (?all)',
      explanation: `Your SPF record ends with ?all (Neutral). This policy tells mailbox providers you are unsure which servers are authorized, offering little protection against domain forgery.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'SPF',
      title: 'Strengthen SPF Fallback Mechanism',
      explanation: 'Change your SPF ending from ?all to ~all (SoftFail) or -all (HardFail) for proper enforcement.',
      recordType: 'TXT',
      host: '@',
      value: (spf.record || 'v=spf1 ~all').replace(/\?all/i, '~all'),
      location: 'DNS Management -> Edit SPF TXT Record',
    });
  } else if (spfQualifier === '+all') {
    spfAnalysis = {
      status: 'fail',
      title: 'Permissive SPF Policy (+all)',
      explanation: `Your SPF record ends with +all, which explicitly allows ANY mail server on the internet to send emails under your domain name. This severely damages your sender reputation.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'SPF',
      title: 'Remove Permissive +all Qualifier',
      explanation: 'Replace +all with ~all to prevent open sender spoofing.',
      recordType: 'TXT',
      host: '@',
      value: (spf.record || 'v=spf1 ~all').replace(/\+all/i, '~all'),
      location: 'DNS Management -> Edit SPF TXT Record',
    });
  } else {
    spfAnalysis = {
      status: 'pass',
      title: 'SPF Authorization is Properly Configured',
      explanation: `Your SPF policy is active (${spf.qualifier || '~all'}). Only authorized email servers are permitted to send emails on behalf of ${domain}.`,
    };
  }

  // 3. Evaluate DMARC (Domain-based Message Authentication)
  let dmarcAnalysis;
  const dmarcPolicy = (dmarc.policy || '').toLowerCase();

  if (!dmarc.hasDmarc) {
    dmarcAnalysis = {
      status: 'fail',
      title: 'Missing DMARC Protection Policy',
      explanation: `Your domain lacks a master DMARC security policy at _dmarc.${domain}. Inbox providers have no instructions on how to handle unauthorized emails, leaving your customers and partners vulnerable to phishing impersonation.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'DMARC',
      title: 'Create a DMARC Policy Record',
      explanation: 'Gives mailbox providers clear instructions on how to reject fake emails and sends you delivery health reports.',
      recordType: 'TXT',
      host: '_dmarc',
      value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; pct=100;`,
      location: 'DNS Management -> Add TXT Record at host _dmarc',
    });
  } else if (dmarcPolicy === 'none') {
    dmarcAnalysis = {
      status: 'warning',
      title: 'DMARC Policy in Monitoring-Only Mode (p=none)',
      explanation: `Your DMARC record is set to p=none. While this collects reports, it does not actively stop spoofed emails from reaching recipients. Google and Yahoo now require active enforcement for high-volume senders.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'DMARC',
      title: 'Upgrade DMARC to Quarantine or Reject',
      explanation: 'Change p=none to p=quarantine to instruct mailboxes to send unauthorized emails to spam folders.',
      recordType: 'TXT',
      host: '_dmarc',
      value: (dmarc.record || `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain};`).replace(/p=none/i, 'p=quarantine'),
      location: 'DNS Management -> Edit _dmarc TXT Record',
    });
  } else {
    dmarcAnalysis = {
      status: 'pass',
      title: `DMARC Protection Active (${dmarcPolicy})`,
      explanation: `Your domain enforces DMARC policy (${dmarcPolicy}). Unauthorized senders pretending to be your business will be quarantined or rejected by receiving mail servers.`,
    };
  }

  // 4. Evaluate DKIM (DomainKeys Identified Mail)
  let dkimAnalysis;
  if (dkim.discovered === true || dkim.status === 'pass') {
    dkimAnalysis = {
      status: 'pass',
      title: 'Cryptographic DKIM Signatures Discovered',
      explanation: `Active DKIM public keys were found on selector(s): ${dkim.discoveredSelectors?.join(', ') || 'default'}. Outgoing emails carry cryptographic proof that message content was not tampered with in transit.`,
    };
  } else {
    dkimAnalysis = {
      status: 'warning',
      title: 'DKIM Requires Email Provider Selector',
      explanation: `Standard selector probes did not detect a generic key. DKIM uses specific selector keys provided by your email host (such as Google Workspace, Microsoft 365, Mailgun, or SendGrid). Verify DKIM in your email provider admin console.`,
    };
    steps.push({
      step: stepIndex++,
      protocol: 'DKIM',
      title: 'Enable DKIM in your Email Provider Console',
      explanation: 'Generate a DKIM key inside Google Workspace, Microsoft 365, or cPanel and publish the TXT or CNAME record.',
      recordType: 'TXT / CNAME',
      host: '<selector>._domainkey',
      value: 'k=rsa; p=YOUR_PUBLIC_KEY',
      location: 'Email Admin Console (Google Workspace / Microsoft 365 / cPanel)',
    });
  }

  // Determine overall urgency
  let urgency = 'Low';
  if (score <= 50 || !mx.hasMx || spf.rfcViolation || !spf.hasSpf) {
    urgency = 'High';
  } else if (score < 80 || dmarcPolicy === 'none' || dkim.status === 'indeterminate') {
    urgency = 'Medium';
  }

  // Synthesize executive summary
  let summary = '';
  if (score >= 80) {
    summary = `Your domain (${domain}) has strong email deliverability fundamentals with a score of ${score}/100. Inbox providers like Gmail and Yahoo have the required cryptographic records to trust your outgoing messages.`;
  } else if (score >= 50) {
    summary = `Your domain (${domain}) has basic mail routing active, but incomplete authentication (Score: ${score}/100) puts your business emails at risk of landing in spam. Publishing your missing security records will improve delivery rates.`;
  } else {
    summary = `Immediate action recommended for ${domain} (Deliverability Score: ${score}/100). Essential authentication protocols (SPF or DMARC) are missing or conflicting, causing major mailbox providers to treat your messages as untrusted or spam.`;
  }

  return {
    summary,
    urgency,
    score,
    source: 'rule-based',
    details: {
      mx: mxAnalysis,
      spf: spfAnalysis,
      dmarc: dmarcAnalysis,
      dkim: dkimAnalysis,
    },
    steps,
  };
}

/**
 * Builds the structured prompt for external LLM generation.
 */
function buildAiPrompt(domain, results, score, baseline) {
  return `You are a friendly, expert email deliverability consultant helping non-technical small business owners understand why their business emails go to spam.

Analyze these DNS results for the domain "${domain}":
- Deliverability Score: ${score}/100
- MX Records: ${JSON.stringify(results.mx || {})}
- SPF Record: ${JSON.stringify(results.spf || {})}
- DMARC Policy: ${JSON.stringify(results.dmarc || {})}
- DKIM Status: ${JSON.stringify(results.dkim || {})}

Context: In 2024-2026, Google, Yahoo, and Microsoft enforce strict requirements (SPF, DKIM, and DMARC) for domain deliverability. Without these, business invoices, customer receipts, and outreach land in spam.

Instructions:
1. Tone: Warm, practical, encouraging, ZERO unnecessary technical jargon.
2. Return ONLY a valid JSON object with these EXACT keys:
{
  "summary": "2-3 clear sentences explaining their domain health and why emails might land in spam.",
  "urgency": "High" | "Medium" | "Low",
  "steps": [
    {
      "step": 1,
      "protocol": "SPF" | "DMARC" | "DKIM" | "MX",
      "title": "Clear action title",
      "explanation": "Plain English explanation of why this is needed",
      "recordType": "TXT" | "MX" | "CNAME",
      "host": "@" | "_dmarc" | "<selector>._domainkey",
      "value": "Exact record value to copy-paste",
      "location": "Where to add it (e.g. cPanel, Cloudflare, GoDaddy DNS Manager)"
    }
  ]
}

DO NOT include markdown fences, code blocks, or preamble. Return ONLY the raw JSON object.`;
}

/**
 * Calls Google Gemini API if GEMINI_API_KEY is configured.
 */
async function callGemini(prompt, apiKey, signal) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  return JSON.parse(text);
}

/**
 * Calls OpenAI API if OPENAI_API_KEY is configured.
 */
async function callOpenAI(prompt, apiKey, signal) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenAI API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');

  return JSON.parse(text);
}

/**
 * Calls Anthropic API if ANTHROPIC_API_KEY is configured.
 */
async function callAnthropic(prompt, apiKey, signal) {
  const url = 'https://api.anthropic.com/v1/messages';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Anthropic API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty Anthropic response');

  return JSON.parse(text);
}

/**
 * Generates plain-English deliverability explanations.
 * Attempts LLM synthesis with a strict 5-second timeout and seamlessly falls back
 * to the deterministic rule-based engine.
 *
 * @param {string} domain
 * @param {object} results
 * @param {number} score
 * @returns {Promise<object>} Complete explanation payload
 */
async function generateExplanation(domain, results = {}, score = 0) {
  // 1. Build deterministic baseline
  const baseline = buildRuleBasedExplanation(domain, results, score);

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // If no LLM provider key is available, return rule-based engine immediately
  if (!geminiKey && !openaiKey && !anthropicKey) {
    return baseline;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const prompt = buildAiPrompt(domain, results, score, baseline);
    let aiResponse = null;

    if (geminiKey) {
      aiResponse = await callGemini(prompt, geminiKey, controller.signal);
    } else if (openaiKey) {
      aiResponse = await callOpenAI(prompt, openaiKey, controller.signal);
    } else if (anthropicKey) {
      aiResponse = await callAnthropic(prompt, anthropicKey, controller.signal);
    }

    clearTimeout(timeoutId);

    if (aiResponse && aiResponse.summary && Array.isArray(aiResponse.steps)) {
      return {
        summary: aiResponse.summary,
        urgency: aiResponse.urgency || baseline.urgency,
        score,
        source: 'ai',
        details: baseline.details,
        steps: aiResponse.steps.length > 0 ? aiResponse.steps : baseline.steps,
      };
    }

    return baseline;
  } catch (err) {
    clearTimeout(timeoutId);
    // Graceful fallback on timeout or provider error
    console.warn(`AI explanation provider call skipped or failed (${err.message}). Using rule-based baseline.`);
    return baseline;
  }
}

module.exports = {
  generateExplanation,
  buildRuleBasedExplanation,
};
