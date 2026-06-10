use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::models::{RateSeriesRequest, Series, SeriesRating};
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/series", get(get_series_page))
        .route("/series/search", get(search_series))
        .route("/series/rate", post(rate_series))
        .route("/series/rated/{user_id}", get(get_rated_series))
}

#[derive(Deserialize, ToSchema)]
pub struct SearchParams {
    pub q: String,
}

/// Check API health
#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "API is healthy")
    ),
    tag = "health"
)]
pub async fn health(State(_state): State<AppState>) -> impl IntoResponse {
    StatusCode::OK
}

/// Get a page of series
#[utoipa::path(
    get,
    path = "/series",
    responses(
        (status = 200, description = "List of series", body = Vec<Series>)
    ),
    tag = "series"
)]
pub async fn get_series_page(State(_state): State<AppState>) -> impl IntoResponse {
    let series = vec![
        Series {
            id: Uuid::new_v4(),
            title: "Breaking Bad".to_string(),
            description: "A chemistry teacher turns drug lord.".to_string(),
            genre: "Drama".to_string(),
            year: 2008,
        },
        Series {
            id: Uuid::new_v4(),
            title: "The Wire".to_string(),
            description: "Crime drama set in Baltimore.".to_string(),
            genre: "Crime".to_string(),
            year: 2002,
        },
    ];
    Json(series)
}

/// Search series by title
#[utoipa::path(
    get,
    path = "/series/search",
    params(
        ("q" = String, Query, description = "Search query string")
    ),
    responses(
        (status = 200, description = "Matching series", body = Vec<Series>)
    ),
    tag = "series"
)]
pub async fn search_series(
    State(_state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> impl IntoResponse {
    let results = vec![Series {
        id: Uuid::new_v4(),
        title: format!("Result for '{}'", params.q),
        description: "Placeholder result.".to_string(),
        genre: "Unknown".to_string(),
        year: 2020,
    }];
    Json(results)
}

/// Rate a series
#[utoipa::path(
    post,
    path = "/series/rate",
    request_body = RateSeriesRequest,
    responses(
        (status = 201, description = "Rating saved", body = SeriesRating),
        (status = 422, description = "Invalid rating value")
    ),
    tag = "series"
)]
pub async fn rate_series(
    State(_state): State<AppState>,
    Json(payload): Json<RateSeriesRequest>,
) -> impl IntoResponse {
    if payload.rating == 0 || payload.rating > 10 {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(serde_json::json!({ "error": "rating must be between 1 and 10" })),
        );
    }
    let rating = SeriesRating {
        series_id: payload.series_id,
        user_id: Uuid::new_v4(),
        rating: payload.rating,
    };
    (StatusCode::CREATED, Json(serde_json::json!(rating)))
}

/// Get all series rated by a user
#[utoipa::path(
    get,
    path = "/series/rated/{user_id}",
    params(
        ("user_id" = Uuid, Path, description = "User UUID")
    ),
    responses(
        (status = 200, description = "Rated series for user", body = Vec<SeriesRating>)
    ),
    tag = "series"
)]
pub async fn get_rated_series(
    State(_state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> impl IntoResponse {
    let ratings = vec![SeriesRating {
        series_id: Uuid::new_v4(),
        user_id,
        rating: 8,
    }];
    Json(ratings)
}
