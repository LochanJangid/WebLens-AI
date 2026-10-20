import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException


def validate_public_url(url: str) -> str:
    """Basic SSRF guard for public website URLs. Revalidate redirects too."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(422, "Provide a valid public HTTP or HTTPS URL.")
    if parsed.username or parsed.password:
        raise HTTPException(422, "URLs containing credentials are not allowed.")

    host = parsed.hostname.rstrip(".").lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise HTTPException(422, "Local network URLs are not allowed.")

    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(host, None)}
    except socket.gaierror:
        raise HTTPException(422, "The website hostname could not be resolved.")

    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise HTTPException(422, "Private, loopback, and reserved IP addresses are not allowed.")
    return url


def is_safe_public_url(url: str) -> bool:
    """Non-throwing SSRF guard for route interception and link checking."""
    try:
        validate_public_url(url)
        return True
    except Exception:
        return False
