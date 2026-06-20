use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

use crate::{
    errors::AppError,
    models::{LoginRequest, PagedQuery, RateSeriesRequest, Series, SeriesRating},
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/series", get(get_series_page))
        .route("/series/search", get(search_series))
        .route("/series/rate", post(rate_series))
        .route("/series/rated/{user_id}", get(get_rated_series))
        .route("/login", post(login))
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
pub async fn health(State(_state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    Ok(StatusCode::OK)
}

#[utoipa::path(
    get,
    path = "/series",
    responses(
        (status = 200, description = "List of series", body = Vec<Series>)
    ),
    tag = "series"
)]
pub async fn get_series_page(
    State(state): State<AppState>,
    Query(q): Query<PagedQuery>,
) -> Result<impl IntoResponse, AppError> {
    let page = state.tmdb.get_popular_series(q.page()).await?;
    Ok((StatusCode::OK, Json(page)))
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
) -> Result<impl IntoResponse, AppError> {
    let results = vec![Series {
        id: Uuid::new_v4(),
        title: format!("Result for '{}'", params.q),
        description: "Placeholder result.".to_string(),
        genre: "Unknown".to_string(),
        year: 2020,
    }];
    Ok(Json(results))
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
) -> Result<impl IntoResponse, AppError> {
    if let Err(errors) = payload.validate() {
        return Err(AppError::ValidationError(errors.to_string()));
    }
    let rating = SeriesRating {
        series_id: payload.series_id,
        user_id: Uuid::new_v4(),
        rating: payload.rating,
    };
    Ok((StatusCode::CREATED, Json(serde_json::json!(rating))))
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
) -> Result<impl IntoResponse, AppError> {
    let ratings = vec![SeriesRating {
        series_id: Uuid::new_v4(),
        user_id,
        rating: 8,
    }];
    Ok(Json(ratings))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = state
        .db
        .login_or_create_user(&body.username, &body.passcode)
        .await?;

    Ok((StatusCode::OK, Json(user_id)))
}
