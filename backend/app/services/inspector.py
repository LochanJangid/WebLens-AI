import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException
from app.config import settings
from app.services.url_safety import validate_public_url


def _text(element):
    return element.get_text(" ", strip=True) if element else None


async def inspect_page(url: str) -> dict:
    current_url = validate_public_url(url)
    timeout = httpx.Timeout(settings.request_timeout_seconds)

    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=False,
            headers={"User-Agent": "WebLensBot/0.1 (+website quality audit)"},
        ) as client:
            # Redirects are followed manually so every target is validated.
            response = None
            for _ in range(6):
                current_url = validate_public_url(current_url)
                response = await client.get(current_url)
                if response.status_code not in {301, 302, 303, 307, 308}:
                    break
                location = response.headers.get("location")
                if not location:
                    break
                current_url = str(response.url.join(location))
            if response is None:
                raise HTTPException(502, "Could not fetch the page.")
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "text/html" not in content_type:
                raise HTTPException(415, "The supplied URL did not return an HTML page.")
            if len(response.content) > settings.max_html_bytes:
                raise HTTPException(413, "The HTML response is larger than the configured limit.")
            html = response.text
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(504, "The website took too long to respond.")
    except httpx.HTTPError as exc:
        raise HTTPException(502, f"Could not inspect the website: {type(exc).__name__}")

    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(" ", strip=True) if soup.title else None
    description_tag = soup.find("meta", attrs={"name": lambda value: value and value.lower() == "description"})
    canonical_tag = soup.find("link", rel=lambda value: value and "canonical" in value)
    headings = {
        f"h{i}": [el.get_text(" ", strip=True) for el in soup.find_all(f"h{i}")[:30]]
        for i in range(1, 7)
    }
    images = []
    for img in soup.find_all("img")[:100]:
        images.append({
            "src": img.get("src"),
            "alt": img.get("alt"),
            "has_alt_attribute": img.has_attr("alt"),
            "selector_hint": "img",
        })
    links = []
    for anchor in soup.find_all("a", href=True)[:200]:
        links.append({
            "text": anchor.get_text(" ", strip=True)[:200],
            "href": anchor.get("href"),
            "rel": anchor.get("rel"),
        })
    buttons = [
        {"text": button.get_text(" ", strip=True)[:200], "type": button.get("type")}
        for button in soup.find_all(["button", "input"])[:100]
    ]
    text_content = " ".join(soup.stripped_strings)[:12000]

    return {
        "url": str(response.url),
        "status_code": response.status_code,
        "content_type": content_type,
        "title": title,
        "meta_description": description_tag.get("content") if description_tag else None,
        "canonical": canonical_tag.get("href") if canonical_tag else None,
        "headings": headings,
        "images": images,
        "links": links,
        "buttons": buttons,
        "text_excerpt": text_content,
        "html_bytes": len(response.content),
    }
