import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    workers = int(os.getenv("WEB_CONCURRENCY", 1))
    reload = os.getenv("RELOAD", "false").lower() == "true"

    print(f"Starting Adhyaya AI Backend on {host}:{port} with {workers} worker(s)...")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        workers=workers,
        reload=reload,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
