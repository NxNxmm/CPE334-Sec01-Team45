"""Read-only HTTP checks for the deployed EquipFlow service."""
import json
import sys
import time
import urllib.error
import urllib.request


def request(base, path, data=None, token=None):
    headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(
        base + path,
        headers=headers,
        data=json.dumps(data).encode("utf-8") if data is not None else None,
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def retry_check(base, path, predicate):
    for attempt in range(5):
        try:
            if not predicate(request(base, path)):
                raise ValueError("Unexpected response")
            print("PASS " + path)
            return
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
            if attempt == 4:
                raise RuntimeError("Smoke check failed: " + path) from None
            time.sleep(3)


def check(base):
    retry_check(base, "/api/health", lambda body: json.loads(body).get("status") == "ok")
    retry_check(base, "/api/ready", lambda body: json.loads(body).get("db") == "connected")
    retry_check(base, "/", lambda body: b"<html" in body.lower())

if __name__ == "__main__":
    if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
        sys.exit("Usage: python3 deploy/smoke_test.py https://SERVICE_URL")
    check(sys.argv[1].rstrip("/"))
