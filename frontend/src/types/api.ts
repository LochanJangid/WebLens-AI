export type AuditCategory =
  | 'performance'
  | 'accessibility'
  | 'seo'
  | 'content'
  | 'ux'
  | 'best-practices';

export type FindingClassification =
  | 'verified_defect'
  | 'potential_issue'
  | 'recommendation'
  | 'needs_review';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingSource = 'html_rule' | 'lighthouse' | 'llm';

export interface ElementEvidence {
  selector?: string | null;
  text?: string | null;
  html_excerpt?: string | null;
  attribute?: string | null;
  value?: string | null;
  observed?: string | null;
  character_count?: number | null;
  count?: number | null;
  examples?: Array<Record<string, unknown>> | null;
  observed_headings?: string[] | null;
  [key: string]: unknown;
}

export interface Finding {
  id: string;
  category: AuditCategory;
  classification: FindingClassification;
  severity: FindingSeverity;
  title: string;
  page_url: string;
  evidence: ElementEvidence;
  why_it_matters: string;
  suggested_change: string;
  implementation_hint: string;
  verification: string;
  source: FindingSource;
}

export interface PageSnapshot {
  url: string;
  status_code: number;
  content_type: string;
  title: string | null;
  meta_description: string | null;
  canonical: string | null;
  headings: Record<string, string[]>;
  images: Array<{
    src: string | null;
    alt: string | null;
    has_alt_attribute: boolean;
    selector_hint?: string;
  }>;
  links: Array<{
    text: string;
    href: string;
    rel?: string | null;
  }>;
  buttons: Array<{
    text: string;
    type?: string | null;
  }>;
  text_excerpt: string;
  html_bytes: number;
}

export interface CategoryScore {
  score: number | null;
  title?: string;
}

export interface MetricItem {
  audit_id: string;
  value: number | null;
  unit?: string | null;
  display_value?: string | null;
  score?: number | null;
  score_display_mode?: string | null;
}

export interface LighthouseAuditItem {
  id: string;
  title: string;
  description?: string;
  explanation?: string;
  score?: number | null;
  score_display_mode?: string;
  display_value?: string;
  details?: Record<string, unknown>;
  metric_savings?: Record<string, unknown>;
}

export interface PageSpeedData {
  requested_url: string;
  final_url?: string;
  strategy: 'mobile' | 'desktop';
  fetch_time?: string;
  lighthouse_version?: string;
  scores: Record<string, CategoryScore>;
  metrics: Record<string, MetricItem>;
  audit_findings: LighthouseAuditItem[];
  field_data?: {
    page?: Record<string, unknown>;
    origin?: Record<string, unknown>;
  };
  run_warnings?: string[];
}

export interface AuditSummary {
  finding_count: number;
  by_category: Record<string, number>;
}

export interface AuditResponse {
  audit_id: string;
  url: string;
  strategy: 'mobile' | 'desktop';
  page_snapshot: PageSnapshot;
  findings: Finding[];
  pagespeed: PageSpeedData | null;
  summary: AuditSummary;
}

export interface AuditRequest {
  url: string;
  strategy: 'mobile' | 'desktop';
  include_pagespeed: boolean;
}

export interface ExplainedFinding {
  id?: string;
  title?: string;
  category?: string;
  classification?: string;
  severity?: string;
  page_url?: string;
  selector?: string;
  evidence?: string | Record<string, unknown>;
  explanation?: string;
  steps?: string[];
  example?: string;
  impact?: string;
  confidence?: 'high' | 'medium' | 'low' | string;
  verification?: string;
}

export interface ExplainResponse {
  findings: ExplainedFinding[];
}

export interface AgentPromptRequest {
  website_url: string;
  objective: string;
  framework?: string | null;
  findings: Record<string, unknown>[];
  page_snapshot: Record<string, unknown>;
}

export interface AgentPromptResponse {
  title: string;
  prompt: string;
  changes: string[];
  acceptance_criteria: string[];
  assumptions: string[];
}

export interface ExistingPageImprovement {
  page: string;
  issue: string;
  evidence: string;
  explanation: string;
  action_steps?: Array<{ step: number; description: string } | string>;
  suggested_content?: {
    title?: string;
    meta_description?: string;
    h1?: string;
    paragraph?: string;
    [key: string]: unknown;
  };
  verification?: string;
}

export interface ProposedNewPage {
  page_name?: string;
  title?: string;
  target_audience?: string;
  user_need?: string;
  reason?: string;
  suggested_sections?: string[];
  suggested_internal_links?: string[];
  evidence_and_assumptions?: string[];
  confidence?: string;
}

export interface ContentPlanResponse {
  existing_page_improvements: ExistingPageImprovement[];
  proposed_new_pages: ProposedNewPage[];
  assumptions?: string[];
  questions_for_owner?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidence_used?: string[];
  recommended_actions?: string[];
  follow_up_needed?: string;
}

export interface ChatRequest {
  question: string;
  website_url: string;
  audit_context: Record<string, unknown>;
  conversation_history: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  answer: string;
  evidence_used?: string[];
  recommended_actions?: string[];
  follow_up_needed?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisualAnnotation {
  id: string;
  number: number;
  finding_id?: string | null;
  title: string;
  category: AuditCategory | string;
  severity: FindingSeverity;
  box: BoundingBox;
  selector?: string | null;
  element_text?: string | null;
  why_it_matters: string;
  suggested_change: string;
  agent_prompt?: string | null;
  suggested_mockup?: string | null;
}

export interface VisualAuditResponse {
  url: string;
  strategy: 'mobile' | 'desktop';
  viewport: {
    width: number;
    height: number;
    device_scale_factor: number;
  };
  full_page_dimensions: {
    width: number;
    height: number;
  };
  viewport_screenshot: string | null;
  full_page_screenshot: string | null;
  annotations: VisualAnnotation[];
  failed: boolean;
  error?: string | null;
}

export interface VisualAuditRequest {
  url: string;
  strategy: 'mobile' | 'desktop';
  findings?: Record<string, unknown>[];
}

export interface PaletteItem {
  role: string;
  hex: string;
  name: string;
}

export interface ColorPaletteCritique {
  detected_theme: string;
  dominant_colors: string[];
  recommended_palette: PaletteItem[];
}

export interface TypographyCritique {
  headline_recommendation: string;
  body_recommendation: string;
  hierarchy_advice: string;
}

export interface DesignCritique {
  overall_impression: string;
  visual_hierarchy_score: number;
  aesthetic_grade: string;
  color_palette: ColorPaletteCritique;
  typography: TypographyCritique;
  conversion_rate_optimization: string[];
  accessibility_notes: string[];
}

export interface TailoredVisionPrompts {
  claude_vision: string;
  gpt4o_vision: string;
  cursor_composer: string;
  v0_generative: string;
}

export interface ScreenshotImproveRequest {
  screenshot_base64?: string;
  website_url?: string;
  url?: string;
  brand_name?: string;
  strategy?: 'mobile' | 'desktop';
  findings?: Record<string, unknown>[];
  issues_summary?: string[];
}

export interface ScreenshotImproveResponse {
  brand_name: string;
  strategy: string;
  design_critique: DesignCritique;
  tailored_prompts: TailoredVisionPrompts;
  suggested_react_tailwind_code: string;
}

export interface CodeTransformRequest {
  code: string;
  code_type?: 'react' | 'html' | 'css' | 'tailwind' | 'auto';
  website_url?: string;
  brand_name?: string;
  strategy?: 'mobile' | 'desktop';
  brand_context?: {
    brand_name?: string;
    strategy?: 'mobile' | 'desktop';
    target_framework?: string;
  };
  issues?: Record<string, unknown>[];
}

export interface CodeTransformResponse {
  original_code: string;
  improved_code: string;
  code_type: string;
  key_improvements: string[];
  preserved_content: string[];
  preserved_text_elements?: string[];
}


