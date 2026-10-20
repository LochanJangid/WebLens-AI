import re
from app.schemas import Finding


def _finding(
    fid, category, severity, title, url, evidence, why, change, hint, verify,
    classification="verified_defect"
):
    return Finding(
        id=fid, category=category, classification=classification,
        severity=severity, title=title, page_url=url, evidence=evidence,
        why_it_matters=why, suggested_change=change,
        implementation_hint=hint, verification=verify, source="html_rule"
    )


def analyze_snapshot(page: dict) -> list[Finding]:
    url = page["url"]
    findings = []

    title = page.get("title")
    if not title:
        findings.append(_finding(
            "seo_missing_title", "seo", "high", "This page has no title", url,
            {"selector": "head > title", "observed": "No title element was found"},
            "The title helps people and search engines understand what this page is about.",
            "Add a unique, descriptive title that matches this page's main purpose.",
            "In the page HTML, add a <title>...</title> element inside <head>. In a CMS, edit the page's SEO title field.",
            "Reload the page and confirm that the browser tab shows the new title."
        ))
    elif len(title) > 60:
        findings.append(_finding(
            "seo_long_title", "seo", "low", "The page title is quite long", url,
            {"selector": "head > title", "text": title, "character_count": len(title)},
            "Long titles may be shortened when shown in search results; 60 characters is only a rough guide, not a strict limit.",
            "Make the title concise while keeping the page topic clear.",
            "Keep the most important words near the beginning; do not remove useful context just to hit an exact character count.",
            "Check that the new title is accurate, unique, and readable."
        ))

    description = page.get("meta_description")
    if not description:
        findings.append(_finding(
            "seo_missing_meta_description", "seo", "medium", "Search engines have no page description to use as a hint", url,
            {"selector": 'head meta[name="description"]', "observed": "No meta description found"},
            "Search engines may create their own snippet from page text. A useful description can help explain the page in search results.",
            "Write a distinct, accurate summary of this page and add it as a meta description.",
            'Add <meta name="description" content="A clear summary of this page"> inside <head>, or use the CMS SEO description field.',
            "Inspect the page HTML and confirm the description matches the actual page."
        ))

    h1s = page.get("headings", {}).get("h1", [])
    if not h1s:
        findings.append(_finding(
            "content_missing_h1", "content", "medium", "The main page heading was not found", url,
            {"selector": "h1", "observed": "No h1 element found"},
            "A clear main heading helps visitors quickly understand what this page offers.",
            "Add one visible, descriptive main heading that matches the page's purpose.",
            "Place an <h1> around the page's main heading. Do not choose heading levels just to change their appearance; use CSS for styling.",
            "Inspect the rendered page and confirm the main heading is visible and descriptive."
        ))
    elif len(h1s) > 1:
        findings.append(_finding(
            "content_multiple_h1", "content", "low", "This page has multiple main headings", url,
            {"selector": "h1", "observed_headings": h1s},
            "Multiple h1 elements are allowed in modern HTML, but they can make the page outline less clear if several compete as the main topic.",
            "Check whether one heading clearly represents the page's main topic; make subordinate sections h2 headings where appropriate.",
            "Review the page structure before changing tags. Do not treat multiple h1 elements as an automatic SEO penalty.",
            "Confirm the heading hierarchy communicates the page structure."
        , classification="needs_review"))

    missing_alt = [img for img in page.get("images", []) if not img.get("has_alt_attribute") and img.get("src")]
    if missing_alt:
        findings.append(_finding(
            "accessibility_missing_alt", "accessibility", "medium", "Some images do not have alternative text", url,
            {"selector": "img:not([alt])", "count": len(missing_alt), "examples": missing_alt[:5]},
            "People using screen readers may miss the information conveyed by meaningful images.",
            "Add concise alt text to informative images. Use an empty alt attribute for purely decorative images.",
            'Example: <img src="team.jpg" alt="The clinic team standing outside the building">. Describe what matters in context, not every visual detail.',
            "Check representative images with a screen reader or inspect their alt attributes."
        ))

    empty_links = [link for link in page.get("links", []) if not (link.get("text") or "").strip() and not link.get("href", "").strip().startswith("#")]
    if empty_links:
        findings.append(_finding(
            "ux_ambiguous_links", "ux", "low", "Some links have no readable link text", url,
            {"selector": "a[href]", "count": len(empty_links), "examples": empty_links[:5]},
            "Visitors using assistive technology may not know where these links lead.",
            "Give each meaningful link a descriptive accessible name, or ensure an icon-only link has an accessible label.",
            "Use visible text where practical, or an appropriate aria-label when a link's purpose is otherwise clear.",
            "Test keyboard navigation and inspect the accessible name of each affected link."
        ))

    return findings
