import type {
  AuditResponse,
  Finding,
  PageSnapshot,
  PageSpeedData,
  ContentPlanResponse,
  AgentPromptResponse,
  ChatResponse,
  ExistingPageImprovement,
  ProposedNewPage,
} from '../types/api.ts';

/**
 * Safely normalizes an unknown value to an array.
 */
export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

/**
 * Safely normalizes a string or fallback to empty string.
 */
export function ensureString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

/**
 * Normalizes headings dictionary so that h1 through h6 are guaranteed arrays.
 */
export function normalizeHeadings(headings: unknown): Record<string, string[]> {
  const result: Record<string, string[]> = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  };

  if (headings && typeof headings === 'object') {
    const raw = headings as Record<string, unknown>;
    for (const key of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      result[key] = ensureArray<string>(raw[key]).map((item) => ensureString(item));
    }
  }

  return result;
}

/**
 * Normalizes a single Finding object to prevent runtime errors.
 */
export function normalizeFinding(raw: unknown, defaultUrl = ''): Finding {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `finding_${Math.random().toString(36).substring(2, 9)}`,
      category: 'best-practices',
      classification: 'potential_issue',
      severity: 'medium',
      title: 'Unclassified issue',
      page_url: defaultUrl,
      evidence: {},
      why_it_matters: 'Requires manual review.',
      suggested_change: 'Review affected element.',
      implementation_hint: 'Inspect page markup.',
      verification: 'Re-run audit.',
      source: 'html_rule',
    };
  }

  const obj = raw as Record<string, unknown>;
  const evidenceObj = (obj.evidence && typeof obj.evidence === 'object' ? obj.evidence : {}) as Record<string, unknown>;

  // Ensure examples array inside evidence is safe
  if ('examples' in evidenceObj) {
    evidenceObj.examples = ensureArray<Record<string, unknown>>(evidenceObj.examples);
  }

  return {
    id: ensureString(obj.id, `finding_${Math.random().toString(36).substring(2, 9)}`),
    category: (ensureString(obj.category, 'best-practices') as Finding['category']),
    classification: (ensureString(obj.classification, 'potential_issue') as Finding['classification']),
    severity: (ensureString(obj.severity, 'medium') as Finding['severity']),
    title: ensureString(obj.title, 'Issue detected'),
    page_url: ensureString(obj.page_url, defaultUrl),
    evidence: evidenceObj,
    why_it_matters: ensureString(obj.why_it_matters, 'No explanation provided.'),
    suggested_change: ensureString(obj.suggested_change, 'Review and update the affected element.'),
    implementation_hint: ensureString(obj.implementation_hint, 'Inspect page source or CMS.'),
    verification: ensureString(obj.verification, 'Re-run audit after making changes.'),
    source: (ensureString(obj.source, 'html_rule') as Finding['source']),
  };
}

/**
 * Normalizes PageSnapshot ensuring all collections and headings are guaranteed arrays.
 */
export function normalizePageSnapshot(raw: unknown, defaultUrl = ''): PageSnapshot {
  if (!raw || typeof raw !== 'object') {
    return {
      url: defaultUrl,
      status_code: 200,
      content_type: 'text/html',
      title: null,
      meta_description: null,
      canonical: null,
      headings: normalizeHeadings(null),
      images: [],
      links: [],
      buttons: [],
      text_excerpt: '',
      html_bytes: 0,
    };
  }

  const obj = raw as Record<string, unknown>;

  return {
    url: ensureString(obj.url, defaultUrl),
    status_code: typeof obj.status_code === 'number' ? obj.status_code : 200,
    content_type: ensureString(obj.content_type, 'text/html'),
    title: typeof obj.title === 'string' ? obj.title : null,
    meta_description: typeof obj.meta_description === 'string' ? obj.meta_description : null,
    canonical: typeof obj.canonical === 'string' ? obj.canonical : null,
    headings: normalizeHeadings(obj.headings),
    images: ensureArray<{
      src: string | null;
      alt: string | null;
      has_alt_attribute: boolean;
      selector_hint?: string;
    }>(obj.images).map((img) => ({
      src: img?.src ? String(img.src) : null,
      alt: img?.alt ? String(img.alt) : null,
      has_alt_attribute: Boolean(img?.has_alt_attribute),
      selector_hint: img?.selector_hint ? String(img.selector_hint) : undefined,
    })),
    links: ensureArray<{
      text: string;
      href: string;
      rel?: string | null;
    }>(obj.links).map((link) => ({
      text: ensureString(link?.text),
      href: ensureString(link?.href),
      rel: link?.rel ? String(link.rel) : null,
    })),
    buttons: ensureArray<{
      text: string;
      type?: string | null;
    }>(obj.buttons).map((btn) => ({
      text: ensureString(btn?.text),
      type: btn?.type ? String(btn.type) : null,
    })),
    text_excerpt: ensureString(obj.text_excerpt),
    html_bytes: typeof obj.html_bytes === 'number' ? obj.html_bytes : 0,
  };
}

/**
 * Normalizes PageSpeedData ensuring scores and metrics handle nulls gracefully.
 */
export function normalizePageSpeed(raw: unknown, defaultUrl = ''): PageSpeedData | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // Normalize scores: missing score must be null, never defaulted to 0
  const scoresObj: Record<string, { score: number | null; title?: string }> = {};
  if (obj.scores && typeof obj.scores === 'object') {
    const rawScores = obj.scores as Record<string, Record<string, unknown>>;
    for (const [key, val] of Object.entries(rawScores)) {
      const scoreVal = typeof val?.score === 'number' && !isNaN(val.score) ? val.score : null;
      scoresObj[key] = {
        score: scoreVal,
        title: val?.title ? String(val.title) : undefined,
      };
    }
  }

  // Normalize metrics
  const metricsObj: PageSpeedData['metrics'] = {};
  if (obj.metrics && typeof obj.metrics === 'object') {
    const rawMetrics = obj.metrics as Record<string, Record<string, unknown>>;
    for (const [key, val] of Object.entries(rawMetrics)) {
      metricsObj[key] = {
        audit_id: ensureString(val?.audit_id, key),
        value: typeof val?.value === 'number' ? val.value : null,
        unit: val?.unit ? String(val.unit) : null,
        display_value: val?.display_value ? String(val.display_value) : null,
        score: typeof val?.score === 'number' ? val.score : null,
        score_display_mode: val?.score_display_mode ? String(val.score_display_mode) : null,
      };
    }
  }

  return {
    requested_url: ensureString(obj.requested_url, defaultUrl),
    final_url: obj.final_url ? String(obj.final_url) : undefined,
    strategy: (ensureString(obj.strategy, 'mobile') as 'mobile' | 'desktop'),
    fetch_time: obj.fetch_time ? String(obj.fetch_time) : undefined,
    lighthouse_version: obj.lighthouse_version ? String(obj.lighthouse_version) : undefined,
    scores: scoresObj,
    metrics: metricsObj,
    audit_findings: ensureArray<PageSpeedData['audit_findings'][0]>(obj.audit_findings).map((item) => ({
      id: ensureString(item?.id),
      title: ensureString(item?.title, item?.id || 'Audit item'),
      description: item?.description ? String(item.description) : undefined,
      explanation: item?.explanation ? String(item.explanation) : undefined,
      score: typeof item?.score === 'number' ? item.score : null,
      score_display_mode: item?.score_display_mode ? String(item.score_display_mode) : undefined,
      display_value: item?.display_value ? String(item.display_value) : undefined,
      details: item?.details && typeof item.details === 'object' ? item.details : undefined,
      metric_savings: item?.metric_savings && typeof item.metric_savings === 'object' ? item.metric_savings : undefined,
    })),
    run_warnings: ensureArray<string>(obj.run_warnings).map((w) => ensureString(w)),
  };
}

/**
 * Normalizes full AuditResponse from API or local storage.
 */
export function normalizeAuditResponse(raw: unknown): AuditResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid audit data: response is empty or malformed.');
  }

  const obj = raw as Record<string, unknown>;
  const url = ensureString(obj.url, 'https://unknown-domain.com');
  const findings = ensureArray<unknown>(obj.findings).map((f) => normalizeFinding(f, url));
  const page_snapshot = normalizePageSnapshot(obj.page_snapshot, url);
  const pagespeed = normalizePageSpeed(obj.pagespeed, url);

  const summary = (obj.summary && typeof obj.summary === 'object' ? obj.summary : {}) as Record<string, unknown>;
  const by_category = (summary.by_category && typeof summary.by_category === 'object'
    ? summary.by_category
    : {}) as Record<string, number>;

  return {
    audit_id: ensureString(obj.audit_id, `audit_${Date.now()}`),
    url,
    strategy: (ensureString(obj.strategy, 'mobile') as 'mobile' | 'desktop'),
    page_snapshot,
    findings,
    pagespeed,
    summary: {
      finding_count: findings.length,
      by_category,
    },
  };
}

/**
 * Normalizes ContentPlanResponse ensuring arrays are never undefined.
 */
export function normalizeContentPlan(raw: unknown): ContentPlanResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      existing_page_improvements: [],
      proposed_new_pages: [],
      assumptions: [],
      questions_for_owner: [],
    };
  }

  const obj = raw as Record<string, unknown>;

  const existingImprovements = ensureArray<ExistingPageImprovement>(obj.existing_page_improvements).map((item) => ({
    page: ensureString(item?.page),
    issue: ensureString(item?.issue, 'Content structure issue'),
    evidence: ensureString(item?.evidence),
    explanation: ensureString(item?.explanation, 'Review and refine this section for clarity.'),
    action_steps: ensureArray<{ step: number; description: string } | string>(item?.action_steps),
    suggested_content: item?.suggested_content && typeof item.suggested_content === 'object' ? item.suggested_content : undefined,
    verification: item?.verification ? String(item.verification) : undefined,
  }));

  const proposedNewPages = ensureArray<ProposedNewPage>(obj.proposed_new_pages).map((page) => ({
    page_name: page?.page_name ? String(page.page_name) : undefined,
    title: page?.title ? String(page.title) : undefined,
    target_audience: page?.target_audience ? String(page.target_audience) : undefined,
    user_need: page?.user_need ? String(page.user_need) : undefined,
    reason: page?.reason ? String(page.reason) : undefined,
    suggested_sections: ensureArray<string>(page?.suggested_sections).map((s) => ensureString(s)),
    suggested_internal_links: ensureArray<string>(page?.suggested_internal_links).map((l) => ensureString(l)),
    evidence_and_assumptions: ensureArray<string>(page?.evidence_and_assumptions).map((a) => ensureString(a)),
    confidence: page?.confidence ? String(page.confidence) : undefined,
  }));

  return {
    existing_page_improvements: existingImprovements,
    proposed_new_pages: proposedNewPages,
    assumptions: ensureArray<string>(obj.assumptions).map((a) => ensureString(a)),
    questions_for_owner: ensureArray<string>(obj.questions_for_owner).map((q) => ensureString(q)),
  };
}

/**
 * Normalizes AgentPromptResponse ensuring changes, acceptance criteria, and assumptions are arrays.
 */
export function normalizeAgentPrompt(raw: unknown): AgentPromptResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      title: 'Implementation Prompt',
      prompt: '',
      changes: [],
      acceptance_criteria: [],
      assumptions: [],
    };
  }

  const obj = raw as Record<string, unknown>;

  return {
    title: ensureString(obj.title, 'AI Coding Prompt'),
    prompt: ensureString(obj.prompt),
    changes: ensureArray<string>(obj.changes).map((c) => ensureString(c)),
    acceptance_criteria: ensureArray<string>(obj.acceptance_criteria).map((ac) => ensureString(ac)),
    assumptions: ensureArray<string>(obj.assumptions).map((asmp) => ensureString(asmp)),
  };
}

/**
 * Normalizes ChatResponse ensuring action lists and evidence lists are arrays.
 */
export function normalizeChatResponse(raw: unknown): ChatResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      answer: 'No answer was returned by the assistant.',
      evidence_used: [],
      recommended_actions: [],
      follow_up_needed: undefined,
    };
  }

  const obj = raw as Record<string, unknown>;

  return {
    answer: ensureString(obj.answer, 'No answer provided.'),
    evidence_used: ensureArray<string>(obj.evidence_used).map((e) => ensureString(e)),
    recommended_actions: ensureArray<string>(obj.recommended_actions).map((a) => ensureString(a)),
    follow_up_needed: obj.follow_up_needed ? String(obj.follow_up_needed) : undefined,
  };
}
