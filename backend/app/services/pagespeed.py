import httpx
from fastapi import HTTPException
from app.config import settings

PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
CATEGORIES = ["performance", "accessibility", "best-practices", "seo"]
METRIC_IDS = {
    "first-contentful-paint": "FCP",
    "largest-contentful-paint": "LCP",
    "cumulative-layout-shift": "CLS",
    "total-blocking-time": "TBT",
    "speed-index": "Speed Index",
    "interaction-to-next-paint": "INP",
}


async def get_pagespeed(url: str, strategy: str) -> dict:
    params = [("url", url), ("strategy", strategy), ("locale", "en")]
    params.extend(("category", category) for category in CATEGORIES)
    if settings.psi_api_key:
        params.append(("key", settings.psi_api_key))

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0)) as client:
            response = await client.get(PSI_ENDPOINT, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException:
        raise HTTPException(504, "PageSpeed Insights timed out.")
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        try:
            message = exc.response.json().get("error", {}).get("message", "PageSpeed API request failed.")
        except ValueError:
            message = "PageSpeed API request failed."
        raise HTTPException(502, {"upstream_status": status, "message": message})
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, "Could not retrieve a valid PageSpeed report.")

    lh = data.get("lighthouseResult", {})
    if lh.get("runtimeError"):
        raise HTTPException(502, {"message": "Lighthouse failed", "error": lh["runtimeError"]})

    categories_out = {}
    for key, value in lh.get("categories", {}).items():
        score = value.get("score")
        categories_out[key] = {
            "score": round(score * 100) if score is not None else None,
            "title": value.get("title"),
        }

    audits = lh.get("audits", {})
    metrics = {}
    for audit_id, name in METRIC_IDS.items():
        audit = audits.get(audit_id)
        if audit:
            metrics[name] = {
                "audit_id": audit_id,
                "value": audit.get("numericValue"),
                "unit": audit.get("numericUnit"),
                "display_value": audit.get("displayValue"),
                "score": audit.get("score"),
                "score_display_mode": audit.get("scoreDisplayMode"),
            }

    audit_items = []
    for audit_id, audit in audits.items():
        mode = audit.get("scoreDisplayMode")
        score = audit.get("score")
        if mode in {"manual", "notApplicable", "informative", "hidden"}:
            continue
        if score is not None and score < 1:
            audit_items.append({
                "id": audit_id,
                "title": audit.get("title"),
                "description": audit.get("description"),
                "explanation": audit.get("explanation"),
                "score": score,
                "score_display_mode": mode,
                "display_value": audit.get("displayValue"),
                "details": audit.get("details"),
                "metric_savings": audit.get("metricSavings"),
            })

    return {
        "requested_url": lh.get("requestedUrl", url),
        "final_url": lh.get("finalUrl"),
        "strategy": strategy,
        "fetch_time": lh.get("fetchTime"),
        "lighthouse_version": lh.get("lighthouseVersion"),
        "scores": categories_out,
        "metrics": metrics,
        "audit_findings": audit_items,
        "field_data": {
            "page": data.get("loadingExperience"),
            "origin": data.get("originLoadingExperience"),
        },
        "run_warnings": lh.get("runWarnings", []),
    }
