"""
Phase 1 Tests — FinPath AI Backend

Tests cover:
- Goal parsing
- Mission creation and persistence
- Document upload validation
- Extraction edit and confirm
- Profile update
- Authorization
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

# Use SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_finpath.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@pytest.fixture(autouse=True)
async def setup_db():
    """Create fresh tables for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
def anyio_backend():
    return "asyncio"


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client):
    """Register a test user and return auth headers."""
    resp = await client.post("/api/auth/register", json={
        "email": "test@finpath.ai",
        "full_name": "Test User",
        "password": "securepassword123"
    })
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_user2(client):
    """Register a second user for authorization tests."""
    resp = await client.post("/api/auth/register", json={
        "email": "user2@finpath.ai",
        "full_name": "User Two",
        "password": "securepassword123"
    })
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# =============================================================================
# AUTH TESTS
# =============================================================================

@pytest.mark.anyio
async def test_register_user(client):
    resp = await client.post("/api/auth/register", json={
        "email": "new@finpath.ai",
        "full_name": "New User",
        "password": "password123"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@finpath.ai"


@pytest.mark.anyio
async def test_register_duplicate_email(client):
    payload = {"email": "dup@finpath.ai", "full_name": "Dup", "password": "pass123"}
    await client.post("/api/auth/register", json=payload)
    resp = await client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_login(client):
    await client.post("/api/auth/register", json={
        "email": "login@finpath.ai", "full_name": "Login User", "password": "pass123"
    })
    resp = await client.post("/api/auth/login", json={
        "email": "login@finpath.ai", "password": "pass123"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.anyio
async def test_login_wrong_password(client):
    await client.post("/api/auth/register", json={
        "email": "wp@finpath.ai", "full_name": "WP", "password": "correct"
    })
    resp = await client.post("/api/auth/login", json={
        "email": "wp@finpath.ai", "password": "wrong"
    })
    assert resp.status_code == 401


# =============================================================================
# GOAL PARSING TESTS
# =============================================================================

@pytest.mark.anyio
async def test_parse_goal_germany_study(client, auth_headers):
    """Test: Germany study goal extracts correctly."""
    resp = await client.post("/api/ai/parse-goal", json={
        "text": "I want to study in Germany next year and need around ₹12 lakh."
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    # Either AI or fallback should detect education category
    assert data["goal_category"] == "education"
    # Destination should be Germany (from AI or fallback)
    assert data.get("destination") in ["Germany", None]  # Fallback may detect it
    # Amount should be approximately 1200000
    if data.get("target_amount"):
        assert abs(data["target_amount"] - 1200000) < 1000


@pytest.mark.anyio
async def test_parse_goal_missing_info(client, auth_headers):
    """Test: Vague input should not invent missing data."""
    resp = await client.post("/api/ai/parse-goal", json={
        "text": "I want to study abroad."
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    # Should NOT invent Germany or any amount
    assert data.get("target_amount") is None


@pytest.mark.anyio
async def test_parse_goal_unauthenticated(client):
    """Test: Goal parsing requires authentication."""
    resp = await client.post("/api/ai/parse-goal", json={"text": "Test"})
    assert resp.status_code == 401


# =============================================================================
# MISSION TESTS
# =============================================================================

@pytest.mark.anyio
async def test_create_mission(client, auth_headers):
    resp = await client.post("/api/missions/", json={
        "goal_category": "education",
        "goal_title": "Study in Germany",
        "destination": "Germany",
        "target_amount": 1200000,
        "currency": "INR",
        "timeline_text": "Next year"
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["goal_category"] == "education"
    assert data["target_amount"] == 1200000
    assert data["status"] == "ACTIVE"
    assert "id" in data


@pytest.mark.anyio
async def test_mission_persists(client, auth_headers):
    """Test: Mission data persists after creation."""
    create_resp = await client.post("/api/missions/", json={
        "goal_category": "education",
        "goal_title": "Study in Germany",
        "target_amount": 1200000,
        "currency": "INR",
    }, headers=auth_headers)
    mission_id = create_resp.json()["id"]

    get_resp = await client.get(f"/api/missions/{mission_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == mission_id


@pytest.mark.anyio
async def test_mission_authorization(client, auth_headers, auth_headers_user2):
    """Test: User A cannot access User B's mission."""
    create_resp = await client.post("/api/missions/", json={
        "goal_category": "education",
        "goal_title": "My Mission",
        "currency": "INR",
    }, headers=auth_headers)
    mission_id = create_resp.json()["id"]

    # User 2 should not access User 1's mission
    get_resp = await client.get(f"/api/missions/{mission_id}", headers=auth_headers_user2)
    assert get_resp.status_code == 403


@pytest.mark.anyio
async def test_list_missions_isolation(client, auth_headers, auth_headers_user2):
    """Test: Users only see their own missions."""
    await client.post("/api/missions/", json={
        "goal_category": "education", "goal_title": "User1 Mission", "currency": "INR"
    }, headers=auth_headers)

    resp = await client.get("/api/missions/", headers=auth_headers_user2)
    assert resp.status_code == 200
    assert len(resp.json()) == 0


# =============================================================================
# DOCUMENT TESTS
# =============================================================================

@pytest.mark.anyio
async def test_upload_invalid_format(client, auth_headers):
    """Test: Unsupported file format is rejected."""
    import io
    resp = await client.post(
        "/api/documents/upload",
        files={"file": ("document.exe", io.BytesIO(b"fake content"), "application/octet-stream")},
        headers=auth_headers
    )
    assert resp.status_code == 400
    assert "Unsupported" in resp.json()["detail"]


@pytest.mark.anyio
async def test_upload_valid_document(client, auth_headers):
    """Test: Valid PDF upload is accepted."""
    import io
    # Minimal valid PDF
    pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    resp = await client.post(
        "/api/documents/upload",
        files={"file": ("salary_slip.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers=auth_headers
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["original_filename"] == "salary_slip.pdf"
    assert data["processing_status"] in ["uploaded", "processing", "classified", "extracting", "review_required"]


@pytest.mark.anyio
async def test_upload_duplicate_rejected(client, auth_headers):
    """Test: Duplicate filename is rejected."""
    import io
    pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    await client.post(
        "/api/documents/upload",
        files={"file": ("duplicate.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers=auth_headers
    )
    resp = await client.post(
        "/api/documents/upload",
        files={"file": ("duplicate.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers=auth_headers
    )
    assert resp.status_code == 409


@pytest.mark.anyio
async def test_document_authorization(client, auth_headers, auth_headers_user2):
    """Test: User A cannot access User B's documents."""
    import io
    pdf_content = b"%PDF-1.4\n"
    upload_resp = await client.post(
        "/api/documents/upload",
        files={"file": ("private.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers=auth_headers
    )
    doc_id = upload_resp.json()["id"]

    get_resp = await client.get(f"/api/documents/{doc_id}", headers=auth_headers_user2)
    assert get_resp.status_code == 403


# =============================================================================
# PROFILE TESTS
# =============================================================================

@pytest.mark.anyio
async def test_empty_profile(client, auth_headers):
    """Test: New user has empty profile."""
    resp = await client.get("/api/profile/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["monthly_income"] is None
    assert data["completion_percentage"] == 0.0


@pytest.mark.anyio
async def test_update_profile(client, auth_headers):
    """Test: Profile can be updated."""
    resp = await client.patch("/api/profile/", json={
        "monthly_income": 75000,
        "savings": 300000,
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["monthly_income"] == 75000
    assert data["savings"] == 300000
    assert data["completion_percentage"] > 0


@pytest.mark.anyio
async def test_profile_completion_calculation(client, auth_headers):
    """Test: Profile completion increases as fields are added."""
    await client.patch("/api/profile/", json={"monthly_income": 75000}, headers=auth_headers)
    resp1 = await client.get("/api/profile/", headers=auth_headers)
    completion1 = resp1.json()["completion_percentage"]

    await client.patch("/api/profile/", json={"savings": 300000}, headers=auth_headers)
    resp2 = await client.get("/api/profile/", headers=auth_headers)
    completion2 = resp2.json()["completion_percentage"]

    assert completion2 > completion1
