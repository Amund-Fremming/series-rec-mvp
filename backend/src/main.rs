mod handlers;
mod llm_adapter;
mod models;
mod state;

use crate::llm_adapter::{Recommendation, SeriesRecommendations};
use crate::models::{RateSeriesRequest, Series, SeriesRating};
use crate::state::AppState;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::health,
        handlers::get_series_page,
        handlers::search_series,
        handlers::rate_series,
        handlers::get_rated_series,
    ),
    components(schemas(Series, RateSeriesRequest, SeriesRating, SeriesRecommendations, Recommendation)),
    tags(
        (name = "health", description = "Health check"),
        (name = "series", description = "Series endpoints"),
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let state = AppState::from_pool(&database_url)
        .await
        .expect("failed to connect to database");

    let app = handlers::router()
        .with_state(state)
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
