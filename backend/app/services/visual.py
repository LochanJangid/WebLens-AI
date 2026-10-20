import asyncio
import base64
import logging
from typing import Any
from playwright.async_api import async_playwright
from app.services.url_safety import validate_public_url, is_safe_public_url

logger = logging.getLogger("weblens.visual")

DESKTOP_VIEWPORT = {"width": 1280, "height": 800}
MOBILE_VIEWPORT = {"width": 390, "height": 844}


async def capture_visual_audit(
    url: str,
    strategy: str = "desktop",
    findings: list[dict[str, Any]] | None = None,
    timeout_ms: int = 15000,
    html_content: str | None = None,
) -> dict[str, Any]:
    """
    Captures viewport and full-page screenshots using Playwright Chromium,
    measures visible bounding boxes of audited elements, and returns structured annotations.
    Secured against SSRF and private-network access.
    """
    findings = findings or []
    is_mobile = strategy == "mobile"
    viewport = MOBILE_VIEWPORT if is_mobile else DESKTOP_VIEWPORT

    if html_content:
        safe_url = str(url)
    else:
        try:
            safe_url = validate_public_url(url)
        except Exception as url_err:
            detail = getattr(url_err, "detail", str(url_err))
            return {
                "url": str(url),
                "strategy": strategy,
                "viewport": {**viewport, "device_scale_factor": 1},
                "full_page_dimensions": viewport,
                "viewport_screenshot": None,
                "full_page_screenshot": None,
                "annotations": [],
                "failed": True,
                "error": f"Invalid or unreachable URL: {detail}",
            }

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                ],
            )
            context = await browser.new_context(
                viewport={"width": viewport["width"], "height": viewport["height"]},
                device_scale_factor=1,
                is_mobile=is_mobile,
                has_touch=is_mobile,
                user_agent=(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 "
                    "(KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1 WebLensBot/2.0"
                    if is_mobile
                    else "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36 WebLensBot/2.0"
                ),
            )
            page = await context.new_page()

            # SSRF route interception: block navigation or requests to private/reserved targets
            async def handle_route(route):
                req = route.request
                target_url = req.url
                if req.is_navigation_request():
                    if not is_safe_public_url(target_url):
                        logger.warning(f"Aborting navigation to unsafe URL: {target_url}")
                        await route.abort()
                        return
                await route.continue_()

            await page.route("**/*", handle_route)

            nav_succeeded = False
            if html_content:
                try:
                    await page.set_content(html_content, wait_until="domcontentloaded", timeout=timeout_ms)
                    await page.wait_for_timeout(500)
                    nav_succeeded = True
                except Exception as content_err:
                    logger.debug(f"Failed to set HTML content: {content_err}")

            if not nav_succeeded:
                try:
                    await page.goto(safe_url, wait_until="domcontentloaded", timeout=timeout_ms)
                    # Allow layout/fonts a moment to settle
                    await page.wait_for_timeout(1000)
                    nav_succeeded = True
                except Exception as nav_err:
                    logger.warning(f"Navigation error for {safe_url}: {nav_err}")
                    if html_content:
                        try:
                            await page.set_content(html_content, wait_until="domcontentloaded")
                            nav_succeeded = True
                        except Exception:
                            pass

            if not nav_succeeded:
                await browser.close()
                return {
                    "url": safe_url,
                    "strategy": strategy,
                    "viewport": {**viewport, "device_scale_factor": 1},
                    "full_page_dimensions": viewport,
                    "viewport_screenshot": None,
                    "full_page_screenshot": None,
                    "annotations": [],
                    "failed": True,
                    "error": "Failed to load page in browser (network timeout or bot challenge).",
                }

            # Measure full page scroll dimensions
            dimensions = await page.evaluate(
                """() => ({
                    width: Math.max(document.documentElement.scrollWidth || 0, document.body.scrollWidth || 0, window.innerWidth),
                    height: Math.max(document.documentElement.scrollHeight || 0, document.body.scrollHeight || 0, window.innerHeight)
                })"""
            )

            # Capture screenshots
            viewport_bytes = await page.screenshot(full_page=False, type="png")
            viewport_b64 = f"data:image/png;base64,{base64.b64encode(viewport_bytes).decode('ascii')}"

            # Capture full page screenshot
            try:
                full_page_bytes = await page.screenshot(full_page=True, type="png")
                full_page_b64 = f"data:image/png;base64,{base64.b64encode(full_page_bytes).decode('ascii')}"
            except Exception:
                # If full page exceeds browser canvas buffer, fall back to viewport
                full_page_b64 = viewport_b64

            # Map findings to real visible element bounding boxes
            annotations = []
            anno_index = 1
            used_boxes = set()

            # 1. Match findings with explicit selectors
            for finding in findings:
                evidence = finding.get("evidence", {})
                selector = evidence.get("selector") if isinstance(evidence, dict) else None
                if not selector or not isinstance(selector, str):
                    continue

                try:
                    locator = page.locator(selector).first
                    if await locator.count() > 0 and await locator.is_visible():
                        box = await locator.bounding_box()
                        if box and box["width"] > 4 and box["height"] > 4:
                            # Avoid overlapping duplicates
                            box_key = (round(box["x"], -1), round(box["y"], -1))
                            if box_key in used_boxes:
                                continue
                            used_boxes.add(box_key)

                            text_excerpt = (await locator.text_content() or "").strip()[:140]
                            annotations.append({
                                "id": f"anno_{anno_index}",
                                "number": anno_index,
                                "finding_id": finding.get("id"),
                                "title": finding.get("title", "Element issue"),
                                "category": finding.get("category", "ux"),
                                "severity": finding.get("severity", "medium"),
                                "box": {
                                    "x": round(box["x"], 1),
                                    "y": round(box["y"], 1),
                                    "width": round(box["width"], 1),
                                    "height": round(box["height"], 1),
                                },
                                "selector": selector,
                                "element_text": text_excerpt or None,
                                "why_it_matters": finding.get("why_it_matters", "Impairs user experience or search ranking."),
                                "suggested_change": finding.get("suggested_change", "Update the element according to best practices."),
                                "agent_prompt": (
                                    f"Target: `{selector}` on {safe_url}\n"
                                    f"Observed: {finding.get('title')}\n"
                                    f"Fix: {finding.get('suggested_change')}\n"
                                    f"Acceptance Criteria: Ensure `{selector}` complies with web standards and renders correctly on {strategy}."
                                ),
                                "suggested_mockup": f"Proposed fix for `{selector}`: {finding.get('suggested_change')}",
                            })
                            anno_index += 1
                except Exception as loc_err:
                    logger.debug(f"Locator check failed for selector {selector}: {loc_err}")

            # 2. If fewer than 6 annotations were matched from selectors, inspect common DOM targets
            if len(annotations) < 6:
                # Check images missing alt
                try:
                    bad_imgs = page.locator("img:not([alt]), img[alt='']")
                    count = await bad_imgs.count()
                    for i in range(min(count, 3)):
                        img = bad_imgs.nth(i)
                        if await img.is_visible():
                            box = await img.bounding_box()
                            if box and box["width"] > 16 and box["height"] > 16:
                                box_key = (round(box["x"], -1), round(box["y"], -1))
                                if box_key not in used_boxes:
                                    used_boxes.add(box_key)
                                    src = (await img.get_attribute("src") or "")[:80]
                                    annotations.append({
                                        "id": f"anno_{anno_index}",
                                        "number": anno_index,
                                        "finding_id": f"visual_img_alt_{anno_index}",
                                        "title": "Image missing descriptive alt attribute",
                                        "category": "accessibility",
                                        "severity": "medium",
                                        "box": {
                                            "x": round(box["x"], 1),
                                            "y": round(box["y"], 1),
                                            "width": round(box["width"], 1),
                                            "height": round(box["height"], 1),
                                        },
                                        "selector": f"img[src*='{src[:30]}']" if src else "img",
                                        "element_text": f"src={src}",
                                        "why_it_matters": "Screen readers cannot describe this image to visually impaired users, and search engines cannot index its visual context.",
                                        "suggested_change": "Add an alt attribute describing the image's content or role, or alt=\"\" if purely decorative.",
                                        "agent_prompt": (
                                            f"Target: `img[src*='{src[:30]}']`\n"
                                            "Observed: Missing descriptive alt attribute\n"
                                            "Fix: Add descriptive alt=\"...\" reflecting the image content\n"
                                            "Acceptance Criteria: <img> has valid alt text; passes accessibility audit."
                                        ),
                                        "suggested_mockup": "Image rendered with accessible text replacement and semantic alt description.",
                                    })
                                    anno_index += 1
                except Exception:
                    pass

                # Check ambiguous links ("click here", "read more", "more", "here")
                try:
                    for text_pattern in ["click here", "read more", "learn more", "more"]:
                        ambiguous_links = page.locator(f"a:has-text('{text_pattern}')")
                        count = await ambiguous_links.count()
                        for i in range(min(count, 2)):
                            lnk = ambiguous_links.nth(i)
                            if await lnk.is_visible():
                                box = await lnk.bounding_box()
                                if box and box["width"] > 8 and box["height"] > 8:
                                    box_key = (round(box["x"], -1), round(box["y"], -1))
                                    if box_key not in used_boxes:
                                        used_boxes.add(box_key)
                                        txt = (await lnk.text_content() or "").strip()
                                        href = (await lnk.get_attribute("href") or "")[:60]
                                        annotations.append({
                                            "id": f"anno_{anno_index}",
                                            "number": anno_index,
                                            "finding_id": f"visual_link_{anno_index}",
                                            "title": f"Ambiguous link label '{txt}'",
                                            "category": "ux",
                                            "severity": "low",
                                            "box": {
                                                "x": round(box["x"], 1),
                                                "y": round(box["y"], 1),
                                                "width": round(box["width"], 1),
                                                "height": round(box["height"], 1),
                                            },
                                            "selector": f"a[href='{href}']" if href else "a",
                                            "element_text": txt,
                                            "why_it_matters": "Vague link labels fail WCAG 2.4.4 and hurt SEO because users and screen readers cannot discern destination from context.",
                                            "suggested_change": f"Replace generic label '{txt}' with a specific destination or action name.",
                                            "agent_prompt": (
                                                f"Target: `a[href='{href}']`\n"
                                                f"Observed: Ambiguous link label '{txt}'\n"
                                                "Fix: Update link text to specify the destination or action clearly.\n"
                                                "Acceptance Criteria: Link text is descriptive without needing surrounding paragraph context."
                                            ),
                                            "suggested_mockup": f"Link text updated from '{txt}' to descriptive destination label.",
                                        })
                                        anno_index += 1
                except Exception:
                    pass

                # Check top header / H1 positioning
                try:
                    h1_locator = page.locator("h1").first
                    if await h1_locator.count() > 0 and await h1_locator.is_visible():
                        box = await h1_locator.bounding_box()
                        if box and box["width"] > 10 and box["height"] > 10:
                            box_key = (round(box["x"], -1), round(box["y"], -1))
                            if box_key not in used_boxes:
                                used_boxes.add(box_key)
                                txt = (await h1_locator.text_content() or "").strip()[:80]
                                annotations.append({
                                    "id": f"anno_{anno_index}",
                                    "number": anno_index,
                                    "finding_id": f"visual_h1_{anno_index}",
                                    "title": "Primary heading (H1) visual hierarchy",
                                    "category": "content",
                                    "severity": "info",
                                    "box": {
                                        "x": round(box["x"], 1),
                                        "y": round(box["y"], 1),
                                        "width": round(box["width"], 1),
                                        "height": round(box["height"], 1),
                                    },
                                    "selector": "h1",
                                    "element_text": txt,
                                    "why_it_matters": "The primary heading establishes the central topic of the page for users and search engine indexing bots.",
                                    "suggested_change": "Ensure the H1 clearly communicates the value proposition and includes relevant keywords.",
                                    "agent_prompt": (
                                        "Target: `h1`\n"
                                        f"Current: \"{txt}\"\n"
                                        "Task: Ensure H1 has strong visual hierarchy, tight tracking, and clear value proposition.\n"
                                        "Acceptance Criteria: Semantic <h1> element remains first heading; high visual clarity."
                                    ),
                                    "suggested_mockup": f"Optimized H1 with enhanced typography hierarchy: \"{txt}\"",
                                })
                                anno_index += 1
                except Exception:
                    pass

            await browser.close()

            return {
                "url": safe_url,
                "strategy": strategy,
                "viewport": {**viewport, "device_scale_factor": 1},
                "full_page_dimensions": {
                    "width": dimensions.get("width", viewport["width"]),
                    "height": dimensions.get("height", viewport["height"]),
                },
                "viewport_screenshot": viewport_b64,
                "full_page_screenshot": full_page_b64,
                "annotations": annotations,
                "failed": False,
                "error": None,
            }
    except Exception as exc:
        logger.error(f"Visual audit unexpected error: {exc}", exc_info=True)
        return {
            "url": safe_url,
            "strategy": strategy,
            "viewport": {**viewport, "device_scale_factor": 1},
            "full_page_dimensions": viewport,
            "viewport_screenshot": None,
            "full_page_screenshot": None,
            "annotations": [],
            "failed": True,
            "error": f"Visual capture unavailable: {type(exc).__name__}",
        }
