use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

const DEFAULT_PAGE: u8 = 0;

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub struct Series {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub genre: String,
    pub year: u32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Validate)]
pub struct RateSeriesRequest {
    pub series_id: Uuid,
    #[validate(range(min = 1, max = 10))]
    pub rating: u8,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct SeriesRating {
    pub series_id: Uuid,
    pub user_id: Uuid,
    // Stored from 0-10 since 5 starts with half-starts equals to 10
    pub rating: u8,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct LoginRequest {
    pub username: String,
    pub passcode: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PagedQuery {
    page: Option<u8>,
}

impl PagedQuery {
    pub fn page(&self) -> u8 {
        self.page.unwrap_or(DEFAULT_PAGE)
    }
}
