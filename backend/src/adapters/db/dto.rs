use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use super::models::Recommendation;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct RecommendationDto {
    pub id: Uuid,
    pub tmdb_series_id: i64,
    pub created_at: DateTime<Utc>,
}

impl From<Recommendation> for RecommendationDto {
    fn from(r: Recommendation) -> Self {
        Self {
            id: r.id,
            tmdb_series_id: r.tmdb_series_id,
            created_at: r.created_at,
        }
    }
}
