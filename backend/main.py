import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.routers import auth, rooms, pertemuan, submissions, ct_journey, gallery, ai, ct_scores, creative


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan.

    On startup, ensure the database schema exists; on shutdown, dispose of the
    engine. Schema *versioning* is handled by Alembic (see backend/alembic);
    create_all remains as a safety net so a brand-new database still boots.
    """
    from app.database import engine, Base
    import app.models  # ensure models are registered on Base.metadata

    print("Membuka koneksi database async...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database berhasil diinisialisasi & tabel-tabel berhasil dibuat!")

    yield

    await engine.dispose()


app = FastAPI(
    title="WebCraft API",
    description="Backend API platform untuk pembelajaran Computational Thinking dan Web Development SMP.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Configuration for React Frontend requests
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Subrouters
app.include_router(auth.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(pertemuan.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(ct_journey.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(ct_scores.router, prefix="/api")
app.include_router(creative.router, prefix="/api")


# Root route
@app.get("/")
def get_root():
    return {
        "status": "online",
        "service": "WebCraft API",
        "version": "2.0.0"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
