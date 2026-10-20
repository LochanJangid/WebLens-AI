import logging
from fastapi import APIRouter, HTTPException
from app.schemas import (
    ScreenshotImproveRequest,
    ScreenshotImproveResponse,
    CodeTransformRequest,
    CodeTransformResponse,
)
from app.services.screenshot_ai import (
    generate_screenshot_critique_and_prompts,
    transform_and_improve_code,
)

logger = logging.getLogger("weblens.visual_improve")
router = APIRouter(tags=["visual-improve"])


@router.post("/visual-improve/analyze", response_model=ScreenshotImproveResponse)
def analyze_screenshot(payload: ScreenshotImproveRequest):
    """
    Takes a website screenshot (base64 or data URI) and generates:
    1. A detailed visual design critique with aesthetic grade and hierarchy score.
    2. Recommended 60-30-10 color palette and typography scale.
    3. Conversion Rate Optimization (CRO) and accessibility fixes.
    4. State-of-the-art vision prompts formatted for Claude 3.7 Sonnet, GPT-4o Vision, Cursor, and v0.
    5. Production-ready React + Tailwind CSS replacement hero component.
    """
    try:
        result = generate_screenshot_critique_and_prompts(
            screenshot_base64=payload.screenshot_base64,
            website_url=payload.website_url or "https://example.com",
            brand_name=payload.brand_name,
            findings=payload.findings,
            strategy=payload.strategy,
        )
        return ScreenshotImproveResponse(**result)
    except Exception as exc:
        logger.error(f"Screenshot analysis failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Visual improvement analysis failed: {str(exc)}")


@router.post("/visual-improve/transform-code", response_model=CodeTransformResponse)
def transform_code_endpoint(payload: CodeTransformRequest):
    """
    Transforms user-pasted code (React, HTML, CSS, Tailwind) into an improved,
    production-grade version with the exact same content and copy, upgraded with
    WCAG AA compliance, responsive styling, and modern design tokens.
    """
    try:
        result = transform_and_improve_code(
            code=payload.code,
            code_type=payload.code_type,
            brand_name=payload.brand_name,
            issues=payload.issues,
        )
        return CodeTransformResponse(**result)
    except Exception as exc:
        logger.error(f"Code transformation failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Code transformation failed: {str(exc)}")

