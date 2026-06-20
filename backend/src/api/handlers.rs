use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
};
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

use crate::{
    adapters::db::dto::RecommendationDto,
    errors::AppError,
    models::{CreateUserRequest, LoginRequest, PagedQuery, ReviewDto, ReviewRequest, Series},
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/login", post(login))
        .route("/series", get(get_series_page))
        .route("/series/search", get(search_series))
        .route("/series/review", get(get_user_review).post(save_review))
        .route("/series/review/{review_id}", delete(delete_review))
        .route(
            "/series/recommendations/{user_id}",
            get(get_recommendations),
        )
        .route("/users", post(create_user))
}

#[derive(Deserialize, ToSchema)]
pub struct SearchParams {
    pub q: String,
}

#[utoipa::path(get, path = "/health", responses((status = 200, description = "API is healthy")), tag = "health")]
pub async fn health(State(_state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    Ok(StatusCode::OK)
}

#[utoipa::path(post, path = "/login", request_body = LoginRequest, responses((status = 200, description = "User ID")), tag = "auth")]
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

#[utoipa::path(get, path = "/series", responses((status = 200, description = "List of series", body = Vec<Series>)), tag = "series")]
pub async fn get_series_page(
    State(state): State<AppState>,
    Query(q): Query<PagedQuery>,
) -> Result<impl IntoResponse, AppError> {
    let page = state.tmdb.get_popular_series(q.page()).await?;

    Ok((StatusCode::OK, Json(page)))
}

#[utoipa::path(get, path = "/series/search", params(("q" = String, Query, description = "Search query")), responses((status = 200, description = "Matching series", body = Vec<Series>)), tag = "series")]
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

    Ok((StatusCode::OK, Json(results)))
}

#[utoipa::path(post, path = "/series/review", request_body = ReviewRequest, responses((status = 201, description = "Review saved", body = ReviewDto)), tag = "series")]
pub async fn save_review(
    State(state): State<AppState>,
    Json(payload): Json<ReviewRequest>,
) -> Result<impl IntoResponse, AppError> {
    if let Err(errors) = payload.validate() {
        return Err(AppError::ValidationError(errors.to_string()));
    }

    let was_recommended = state
        .db
        .is_series_recommended(payload.tmdb_series_id)
        .await?;

    let review = state
        .db
        .save_review(
            payload.series_id,
            payload.user_id,
            payload.tmdb_series_id,
            payload.rating,
            payload.liked,
            payload.disliked,
            was_recommended,
        )
        .await?;

    Ok((StatusCode::CREATED, Json(ReviewDto::from(review))))
}

#[derive(Deserialize, ToSchema)]
pub struct UserReviewParams {
    pub user_id: Uuid,
    pub tmdb_series_id: i64,
}

#[utoipa::path(get, path = "/series/review", params(("user_id" = Uuid, Query, description = "User UUID"), ("tmdb_series_id" = i64, Query, description = "TMDB series ID")), responses((status = 200, description = "User review or null", body = Option<ReviewDto>)), tag = "series")]
pub async fn get_user_review(
    State(state): State<AppState>,
    Query(params): Query<UserReviewParams>,
) -> Result<impl IntoResponse, AppError> {
    let review = state
        .db
        .get_user_review(params.user_id, params.tmdb_series_id)
        .await?;

    Ok((StatusCode::OK, Json(review.map(ReviewDto::from))))
}

#[utoipa::path(delete, path = "/series/review/{review_id}", params(("review_id" = Uuid, Path, description = "Review UUID")), responses((status = 204, description = "Review deleted")), tag = "series")]
pub async fn delete_review(
    State(state): State<AppState>,
    Path(review_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    state.db.delete_review(review_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

#[utoipa::path(get, path = "/series/recommendations/{user_id}", params(("user_id" = Uuid, Path, description = "User UUID")), responses((status = 200, description = "Recommendations", body = Vec<RecommendationDto>)), tag = "series")]
pub async fn get_recommendations(
    State(state): State<AppState>,
    Path(_user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let recs = state.db.get_recommendations().await?;
    let dtos: Vec<RecommendationDto> = recs.into_iter().map(RecommendationDto::from).collect();

    Ok(Json(dtos))
}

#[utoipa::path(post, path = "/users", request_body = CreateUserRequest, responses((status = 201, description = "User created"), (status = 409, description = "Username already exists")), tag = "users")]
pub async fn create_user(
    State(state): State<AppState>,
    Json(body): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, AppError> {
    let id = state.db.create_user(&body.username, &body.passcode).await?;
    Ok((StatusCode::CREATED, Json(id)))
}
