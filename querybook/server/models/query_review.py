import sqlalchemy as sql
from sqlalchemy.orm import relationship, backref

from app import db
from const.db import now, description_length
from lib.sqlalchemy import CRUDMixin
from lib.utils.serialize import with_formatted_date

Base = db.Base


class QueryReview(Base, CRUDMixin):
    __tablename__ = "query_review"
    __table_args__ = {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"}

    id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
    query_execution_id = sql.Column(
        sql.Integer,
        sql.ForeignKey("query_execution.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    review_request_reason = sql.Column(
        sql.String(length=description_length), nullable=False
    )
    rejection_reason = sql.Column(sql.String(length=description_length), nullable=False)
    created_at = sql.Column(sql.DateTime, default=now, nullable=False)
    updated_at = sql.Column(sql.DateTime, default=now, onupdate=now, nullable=False)

    # Relationships
    query_execution = relationship(
        "QueryExecution",
        backref=backref(
            "review", uselist=False, cascade="all, delete-orphan", passive_deletes=True
        ),
    )
    reviewers = relationship(
        "User",
        secondary="query_execution_reviewer",
        backref=backref("assigned_query_reviews", cascade="all", passive_deletes=True),
    )

    @with_formatted_date
    def to_dict(self):
        return {
            "id": self.id,
            "query_execution_id": self.query_execution_id,
            "query_author_id": (
                self.query_execution.uid if self.query_execution else None
            ),
            "status": self.query_execution.status if self.query_execution else None,
            "review_request_reason": self.review_request_reason,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "reviewer_ids": [reviewer.id for reviewer in self.reviewers],
        }


class QueryExecutionReviewer(Base, CRUDMixin):
    __tablename__ = "query_execution_reviewer"
    __table_args__ = (
        sql.UniqueConstraint(
            "query_review_id", "uid", name="unique_query_execution_reviewer"
        ),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
    query_review_id = sql.Column(
        sql.Integer,
        sql.ForeignKey("query_review.id", ondelete="CASCADE"),
        nullable=False,
    )
    uid = sql.Column(
        sql.Integer,
        sql.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = sql.Column(sql.DateTime, default=now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "query_review_id": self.query_review_id,
            "uid": self.uid,
            "created_at": self.created_at,
        }
