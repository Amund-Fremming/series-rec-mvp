use sqlx::{Pool, Postgres};
use thiserror::Error;
use uuid::Uuid;

use super::models::{Recommendation, Review};

#[derive(Debug, Error)]
pub enum DbError {
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),
}

pub struct DbAdapter {
    pool: Pool<Postgres>,
}

impl DbAdapter {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    pub async fn save_review(
        &self,
        series_id: Uuid,
        user_id: Uuid,
        rating: i16,
    ) -> Result<(), DbError> {
        sqlx::query!(
            r#"
            INSERT INTO reviews (series_id, user_id, rating)
            VALUES ($1, $2, $3)
            "#,
            series_id,
            user_id,
            rating,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_reviews(&self, series_id: Uuid) -> Result<Vec<Review>, DbError> {
        let reviews = sqlx::query_as!(
            Review,
            r#"
            SELECT id, series_id, user_id, rating, liked, disliked, was_recommended as "was_recommended!", created_at
            FROM reviews
            WHERE series_id = $1
            ORDER BY created_at DESC
            "#,
            series_id,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(reviews)
    }

    pub async fn save_recommendation(&self, tmdb_series_id: i64) -> Result<(), DbError> {
        sqlx::query!(
            r#"
            INSERT INTO recommendations (tmdb_series_id)
            VALUES ($1)
            "#,
            tmdb_series_id,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_recommendations(&self) -> Result<Vec<Recommendation>, DbError> {
        let recs = sqlx::query_as!(
            Recommendation,
            r#"
            SELECT id, tmdb_series_id, created_at
            FROM recommendations
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(recs)
    }

    pub async fn delete_review(&self, id: Uuid) -> Result<(), DbError> {
        sqlx::query!(
            r#"
            DELETE FROM reviews
            WHERE id = $1
            "#,
            id,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete_recommendation(&self, id: Uuid) -> Result<(), DbError> {
        sqlx::query!(
            r#"
            DELETE FROM recommendations
            WHERE id = $1
            "#,
            id,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
