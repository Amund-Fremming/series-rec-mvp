use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct Series {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub genre: String,
    pub year: u32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct RateSeriesRequest {
    pub series_id: Uuid,
    /// Must be between 1 and 10
    pub rating: u8,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct SeriesRating {
    pub series_id: Uuid,
    pub user_id: Uuid,
    pub rating: u8,
}
