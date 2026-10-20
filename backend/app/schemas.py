from typing import Literal
from pydantic import BaseModel, Field, HttpUrl


class AuditRequest(BaseModel):
    url: HttpUrl
    strategy: Literal["mobile", "desktop"] = "mobile"
    include_pagespeed: bool = True


class ElementEvidence(BaseModel):
    selector: str | None = None
    text: str | None = None
    html_excerpt: str | None = None
    attribute: str | None = None
    value: str | None = None


class Finding(BaseModel):
    id: str
    category: Literal["performance", "accessibility", "seo", "content", "ux", "best-practices"]
    classification: Literal["verified_defect", "potential_issue", "recommendation", "needs_review"]
    severity: Literal["critical", "high", "medium", "low", "info"]
    title: str
    page_url: str
    evidence: ElementEvidence | dict
    why_it_matters: str
    suggested_change: str
    implementation_hint: str
    verification: str
    source: Literal["html_rule", "lighthouse", "llm"]


class AuditResponse(BaseModel):
    audit_id: str
    url: str
    strategy: str
    page_snapshot: dict
    findings: list[Finding]
    pagespeed: dict | None = None
    summary: dict
    visual: dict | None = None


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class VisualAnnotation(BaseModel):
    id: str
    number: int
    finding_id: str | None = None
    title: str
    category: str
    severity: Literal["critical", "high", "medium", "low", "info"]
    box: BoundingBox
    selector: str | None = None
    element_text: str | None = None
    why_it_matters: str
    suggested_change: str
    agent_prompt: str | None = None
    suggested_mockup: str | None = None


class VisualAuditRequest(BaseModel):
    url: HttpUrl
    strategy: Literal["mobile", "desktop"] = "desktop"
    findings: list[dict] = Field(default_factory=list)


class VisualAuditResponse(BaseModel):
    url: str
    strategy: str
    viewport: dict = Field(default_factory=dict)
    full_page_dimensions: dict = Field(default_factory=dict)
    viewport_screenshot: str | None = None
    full_page_screenshot: str | None = None
    annotations: list[VisualAnnotation] = Field(default_factory=list)
    failed: bool = False
    error: str | None = None


class ExplainRequest(BaseModel):
    audit_id: str | None = None
    url: HttpUrl
    findings: list[dict] = Field(default_factory=list)
    page_snapshot: dict = Field(default_factory=dict)


class AgentPromptRequest(BaseModel):
    website_url: HttpUrl
    objective: str = "Improve the website's usability, accessibility, SEO, and performance"
    framework: str | None = None
    findings: list[dict] = Field(default_factory=list)
    page_snapshot: dict = Field(default_factory=dict)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    website_url: str = Field(default="https://weblensai.com")
    audit_context: dict = Field(default_factory=dict)
    conversation_history: list[dict] = Field(default_factory=list, max_length=20)


class ScreenshotImproveRequest(BaseModel):
    screenshot_base64: str = Field(description="Base64 encoded data URI or raw image string")
    website_url: str | None = Field(default="https://example.com", description="Target website URL or localhost label")
    brand_name: str | None = None
    strategy: Literal["mobile", "desktop"] = "desktop"
    findings: list[dict] = Field(default_factory=list)


class PaletteItem(BaseModel):
    role: str
    hex: str
    name: str


class ColorPaletteCritique(BaseModel):
    detected_theme: str
    dominant_colors: list[str] = Field(default_factory=list)
    recommended_palette: list[PaletteItem] = Field(default_factory=list)


class TypographyCritique(BaseModel):
    headline_recommendation: str
    body_recommendation: str
    hierarchy_advice: str


class DesignCritique(BaseModel):
    overall_impression: str
    visual_hierarchy_score: int
    aesthetic_grade: str
    color_palette: ColorPaletteCritique
    typography: TypographyCritique
    conversion_rate_optimization: list[str] = Field(default_factory=list)
    accessibility_notes: list[str] = Field(default_factory=list)


class TailoredVisionPrompts(BaseModel):
    claude_vision: str
    gpt4o_vision: str
    cursor_composer: str
    v0_generative: str


class ScreenshotImproveResponse(BaseModel):
    brand_name: str
    strategy: str
    design_critique: DesignCritique
    tailored_prompts: TailoredVisionPrompts
    suggested_react_tailwind_code: str


class CodeTransformRequest(BaseModel):
    code: str = Field(min_length=1, description="Raw code pasted by user (React, HTML, CSS, Tailwind)")
    code_type: Literal["react", "html", "css", "tailwind", "auto"] = "auto"
    website_url: str | None = None
    brand_name: str | None = None
    issues: list[dict] = Field(default_factory=list)


class CodeTransformResponse(BaseModel):
    original_code: str
    improved_code: str
    code_type: str
    key_improvements: list[str] = Field(default_factory=list)
    preserved_content: list[str] = Field(default_factory=list)


