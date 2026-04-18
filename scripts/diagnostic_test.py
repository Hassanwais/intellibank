import urllib.request
import json
import socket

def test_api():
    urls = [
        'http://localhost:5001/api/health',
        'http://localhost:5001/api/debug/routes'
    ]
    
    for url in urls:
        print(f"Testing {url}...")
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                status = response.getcode()
                data = response.read().decode('utf-8')
                print(f"Status: {status}")
                if url.endswith('routes'):
                    routes = json.loads(data)
                    print(f"Found {len(routes)} routes.")
                    # Check for security-settings
                    security_routes = [r for r in routes if 'security-settings' in r]
                    print(f"Security Settings Routes found: {security_routes}")
        except Exception as e:
            print(f"Failed to connect to {url}: {e}")

if __name__ == "__main__":
    test_api()
