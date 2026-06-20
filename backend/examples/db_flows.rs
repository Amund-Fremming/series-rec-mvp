use backend::adapters::db::adapter::DbAdapter;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let db = DbAdapter::new(pool);

    let series_id = Uuid::new_v4();
    let user_id = Uuid::new_v4();

    // --- Reviews ---
    match db.save_review(series_id, user_id, 8).await {
        Ok(_) => println!("✅ Saved review (series={series_id}, user={user_id}, rating=8)"),
        Err(e) => println!("❌ Failed to save review: {e}"),
    }

    match db.get_reviews(series_id).await {
        Ok(reviews) => {
            println!("✅ Fetched {} review(s)", reviews.len());
            for r in &reviews {
                match db.delete_review(r.id).await {
                    Ok(_) => println!("✅ Deleted review {}", r.id),
                    Err(e) => println!("❌ Failed to delete review {}: {e}", r.id),
                }
            }
        }
        Err(e) => println!("❌ Failed to fetch reviews: {e}"),
    }

    match db.get_reviews(series_id).await {
        Ok(reviews) => println!("✅ Reviews after delete: {}", reviews.len()),
        Err(e) => println!("❌ Failed to fetch reviews after delete: {e}"),
    }

    // --- Recommendations ---
    match db.save_recommendation(12345).await {
        Ok(_) => println!("\n✅ Saved recommendation (tmdb_series_id=12345)"),
        Err(e) => println!("\n❌ Failed to save recommendation: {e}"),
    }

    match db.get_recommendations().await {
        Ok(recs) => {
            println!("✅ Fetched {} recommendation(s)", recs.len());
            for r in &recs {
                match db.delete_recommendation(r.id).await {
                    Ok(_) => println!("✅ Deleted recommendation {}", r.id),
                    Err(e) => println!("❌ Failed to delete recommendation {}: {e}", r.id),
                }
            }
        }
        Err(e) => println!("❌ Failed to fetch recommendations: {e}"),
    }

    match db.get_recommendations().await {
        Ok(recs) => println!("✅ Recommendations after delete: {}", recs.len()),
        Err(e) => println!("❌ Failed to fetch recommendations after delete: {e}"),
    }
}
