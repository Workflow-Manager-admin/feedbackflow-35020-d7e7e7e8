from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List
import sqlite3
from contextlib import contextmanager


# --- DATABASE SETUP ---

DATABASE_FILE = "feedback.db"


@contextmanager
def get_db():
    """Yields a database connection with proper closing."""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """Ensures the feedback table exists with required schema."""
    with get_db() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        db.commit()


# Initialize DB at startup
init_db()


# --- SCHEMAS ---


class FeedbackBase(BaseModel):
    text: str = Field(..., description="Feedback text submitted by user.")

    # PUBLIC_INTERFACE
    @validator("text")
    def not_empty(cls, v):
        """Validate that text is non-empty and not whitespace."""
        if not v or not v.strip():
            raise ValueError("Feedback text must not be empty.")
        return v.strip()


class FeedbackCreate(FeedbackBase):
    """Schema for feedback submission request."""
    pass


class FeedbackOut(FeedbackBase):
    id: int = Field(..., description="Unique identifier for the feedback entry.")
    created_at: str = Field(..., description="Timestamp when feedback was submitted.")


# --- FASTAPI APP & CONFIG ---


app = FastAPI(
    title="Feedback Backend API",
    description="API for submitting and retrieving user feedback.",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "Feedback",
            "description": "Operations related to feedback submission and retrieval."
        }
    ]
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- ROUTES ---


# PUBLIC_INTERFACE
@app.get("/", tags=["Feedback"])
def health_check():
    """Health check endpoint that returns a simple message."""
    return {"message": "Healthy"}


# PUBLIC_INTERFACE
@app.post(
    "/feedback",
    response_model=FeedbackOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Feedback"],
    summary="Submit feedback",
    description="Submit user feedback. The feedback text must be non-empty.",
    responses={
        201: {"description": "Feedback submitted successfully."},
        422: {"description": "Validation error if feedback text is empty."}
    }
)
def submit_feedback(feedback: FeedbackCreate):
    """
    Receives user feedback, validates input, stores it in the database, and returns
    the created feedback object with its assigned ID and timestamp.
    """
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO feedback (text) VALUES (?)",
            (feedback.text,)
        )
        db.commit()
        feedback_id = cursor.lastrowid
        row = db.execute(
            "SELECT id, text, created_at FROM feedback WHERE id = ?",
            (feedback_id,)
        ).fetchone()
        return FeedbackOut(id=row["id"], text=row["text"], created_at=row["created_at"])


# PUBLIC_INTERFACE
@app.get(
    "/feedback",
    response_model=List[FeedbackOut],
    tags=["Feedback"],
    summary="Retrieve all feedback",
    description="Retrieve a list of all user feedback entries ordered by most recent.",
    responses={
        200: {"description": "List of feedback entries."}
    }
)
def get_feedback():
    """
    Returns a list of all submitted feedback entries, ordered by most recent first.
    """
    with get_db() as db:
        rows = db.execute(
            "SELECT id, text, created_at FROM feedback ORDER BY created_at DESC"
        ).fetchall()
    return [
        FeedbackOut(id=row["id"], text=row["text"], created_at=row["created_at"])
        for row in rows
    ]
