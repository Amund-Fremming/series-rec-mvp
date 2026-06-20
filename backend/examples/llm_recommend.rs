use backend::adapters::llm::adapter::LlmAdapter;
use backend::models::{Series, SeriesRating};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let api_key = std::env::var("OPENAI_API_KEY").expect("OPENAI_API_KEY must be set in .env");

    let adapter = LlmAdapter::new(api_key);

    let series_id = uuid::Uuid::new_v4();
    let user_id = uuid::Uuid::new_v4();

    let reviews = vec![SeriesRating {
        series_id,
        user_id,
        rating: 9,
    }];
    let reviewed_series = vec![Series {
        id: series_id,
        title: "Breaking Bad".into(),
        description: "A chemistry teacher turned drug lord.".into(),
        genre: "Crime Drama".into(),
        year: 2008,
    }];

    println!("Requesting recommendations based on Breaking Bad (rated 9/10)...\n");

    match adapter.recommend(&reviews, &reviewed_series).await {
        Ok(recs) => {
            println!("Taste profile: {}\n", recs.taste_summary);
            println!("=== Recommendations ===");
            for (i, r) in recs.recommendations.iter().enumerate() {
                println!(
                    "{}. {} [{}] — confidence: {}%",
                    i + 1,
                    r.title,
                    r.genre,
                    r.confidence
                );
            }
        }
        Err(e) => eprintln!("Error: {e}"),
    }
}
