from uuid import uuid4
from fastapi import APIRouter
from app.schemas import (
    AuditRequest,
    AuditResponse,
    ExplainRequest,
    AgentPromptRequest,
    VisualAuditRequest,
    VisualAuditResponse,
)
from app.services.inspector import inspect_page
from app.services.rules import analyze_snapshot
from app.services.pagespeed import get_pagespeed
from app.services.llm import complete_json
from app.services.visual import capture_visual_audit

router = APIRouter(tags=["audit"])


@router.post("/audits", response_model=AuditResponse)
async def create_audit(payload: AuditRequest):
    url = str(payload.url)
    snapshot = await inspect_page(url)
    findings = analyze_snapshot(snapshot)
    psi = None
    if payload.include_pagespeed:
        psi = await get_pagespeed(snapshot["url"], payload.strategy)
        for item in psi.get("audit_findings", []):
            item_id = item.get("id", "finding")
            item_title = item.get("title") or item_id.replace("-", " ").capitalize()
            desc = item.get("description") or ""
            # Strip markdown links from Lighthouse descriptions if present
            import re
            cleaned_desc = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', desc).strip()
            
            is_perf = item_id in {
                "largest-contentful-paint", "first-contentful-paint",
                "speed-index", "total-blocking-time", "cumulative-layout-shift",
                "interactive", "max-potential-fid", "render-blocking-resources",
                "modern-image-formats", "uses-optimized-images", "unminified-javascript",
                "unminified-css", "unused-javascript", "unused-css-rules"
            }
            
            why_text = cleaned_desc if cleaned_desc else f"Resolving {item_title} improves site loading speed, responsive interactivity, and Google Core Web Vitals rankings."
            fix_text = f"Review and optimize assets and code associated with '{item_title}' to satisfy modern web performance thresholds."
            
            findings.append({
                "id": f"lh_{item_id}",
                "category": "performance" if is_perf else "best-practices",
                "classification": "potential_issue",
                "severity": "medium",
                "title": item_title,
                "page_url": snapshot["url"],
                "evidence": item,
                "why_it_matters": why_text,
                "suggested_change": fix_text,
                "implementation_hint": cleaned_desc or "Inspect network waterfall and bundle composition in browser DevTools.",
                "verification": "Rerun PageSpeed Insights or WebLens AI audit after deploying changes to verify metric improvement.",
                "source": "lighthouse",
            })

    counts = {}
    for finding in findings:
        category = finding.category if hasattr(finding, "category") else finding.get("category", "unknown")
        counts[category] = counts.get(category, 0) + 1

    return AuditResponse(
        audit_id=str(uuid4()),
        url=snapshot["url"],
        strategy=payload.strategy,
        page_snapshot=snapshot,
        findings=findings,
        pagespeed=psi,
        summary={"finding_count": len(findings), "by_category": counts},
    )


@router.post("/explanations")
def explain_findings(payload: ExplainRequest):
    return complete_json("Explain each finding to a beginner. Return {findings: [...]} with exact selectors/evidence, plain-language explanation, steps, example, impact, confidence and verification.", payload.model_dump(mode="json"))


@router.post("/agent-prompt")
def generate_agent_prompt(payload: AgentPromptRequest):
    return complete_json(
        "Generate a ready-to-paste coding-agent prompt to improve this website. Be exact about the affected URL, selector, text/section, intended change, constraints, tests, and acceptance criteria. Do not invent filenames or framework. Return {title, prompt, changes, acceptance_criteria, assumptions}.",
        payload.model_dump(mode="json"),
    )


@router.post("/content-plan")
def generate_content_plan(payload: ExplainRequest):
    return complete_json(
        "Suggest specific improvements to existing sections and propose new pages only when evidence indicates a real user need. Return {existing_page_improvements: [...], proposed_new_pages: [...], assumptions: [...], questions_for_owner: [...]}. Never invent business facts.",
        payload.model_dump(mode="json"),
    )


@router.post("/visual-audit", response_model=VisualAuditResponse)
async def run_visual_audit(payload: VisualAuditRequest):
    result = await capture_visual_audit(
        url=str(payload.url),
        strategy=payload.strategy,
        findings=payload.findings,
    )
    return VisualAuditResponse(**result)
