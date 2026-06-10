use std::env;

use reqwest::Client;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use utoipa::ToSchema;

use crate::models::{Series, SeriesRating};

const MODEL: &str = "o4-mini";
const MAX_RETRIES: u8 = 3;

const SYSTEM_PROMPT: &str = "\
You are a TV series recommendation engine. Given a user's past ratings and any \
previously recommended series they have since rated, suggest new series they would enjoy.

You MUST respond with ONLY a valid JSON object — no markdown fences, no explanation, \
no text outside the JSON. The object must match this schema exactly:

{
  \"recommendations\": [
    {
      \"title\": \"string\",
      \"genre\": \"string\",
      \"reason\": \"string — why this series fits the user's taste\",
      \"confidence\": <number between 0.0 and 1.0>
    }
  ],
  \"taste_summary\": \"string — one sentence describing the user's taste profile\"
}";

#[derive(Debug, Error)]
pub enum LlmError {
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),
    #[error("API returned an error: {0}")]
    Api(String),
    #[error("Failed to parse LLM response after {attempts} attempt(s): {last_error}")]
    ParseFailed { attempts: u8, last_error: String },
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct SeriesRecommendations {
    pub recommendations: Vec<Recommendation>,
    pub taste_summary: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Recommendation {
    pub title: String,
    pub genre: String,
    pub reason: String,
    pub confidence: f32,
}

// --- Internal OpenAI API shapes ---

#[derive(Serialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct OpenAiRequest<'a> {
    model: &'a str,
    messages: Vec<OpenAiMessage>,
}

#[derive(Deserialize)]
struct OpenAiResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: MessageContent,
}

#[derive(Deserialize)]
struct MessageContent {
    content: String,
}

// --- Public service ---

pub struct LlmAdapter {
    client: Client,
    api_key: String,
}

impl LlmAdapter {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            api_key: env::var("OPENAI_API_KEY")
                .expect("OPENAI_API_KEY environment variable must be set"),
        }
    }

    /// Recommend series for a user given their ratings and any previously
    /// recommended series they have since rated.
    pub async fn recommend(
        &self,
        reviews: &[SeriesRating],
        reviewed_recs: &[Series],
    ) -> Result<SeriesRecommendations, LlmError> {
        let prompt = build_prompt(reviews, reviewed_recs);
        self.resilient_complete(prompt).await
    }

    /// Sends the prompt to the LLM and retries up to MAX_RETRIES times when the
    /// response cannot be deserialized. Each retry feeds the bad response back so
    /// the model can self-correct.
    async fn resilient_complete(
        &self,
        initial_prompt: String,
    ) -> Result<SeriesRecommendations, LlmError> {
        let mut messages = vec![OpenAiMessage {
            role: "user".into(),
            content: initial_prompt,
        }];
        let mut last_error = String::new();

        for attempt in 1..=MAX_RETRIES {
            let raw = self.call_api(&messages).await?;

            match serde_json::from_str::<SeriesRecommendations>(&raw) {
                Ok(parsed) => return Ok(parsed),
                Err(err) => {
                    last_error = err.to_string();
                    tracing::warn!(
                        attempt,
                        max = MAX_RETRIES,
                        error = %err,
                        "LLM response failed to deserialize; retrying"
                    );
                    // Feed the bad response back so the model can self-correct.
                    messages.push(OpenAiMessage {
                        role: "assistant".into(),
                        content: raw,
                    });
                    messages.push(OpenAiMessage {
                        role: "user".into(),
                        content: format!(
                            "Your previous response failed to parse. Error: {err}. \
                             Respond with ONLY the JSON object, no extra text."
                        ),
                    });
                }
            }
        }

        Err(LlmError::ParseFailed {
            attempts: MAX_RETRIES,
            last_error,
        })
    }

    async fn call_api(&self, messages: &[OpenAiMessage]) -> Result<String, LlmError> {
        let mut all_messages = vec![OpenAiMessage {
            role: "system".into(),
            content: SYSTEM_PROMPT.into(),
        }];
        all_messages.extend(messages.iter().map(|m| OpenAiMessage {
            role: m.role.clone(),
            content: m.content.clone(),
        }));

        let body = OpenAiRequest {
            model: MODEL,
            messages: all_messages,
        };

        let response = self
            .client
            .post("https://api.openai.com/v1/chat/completions")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await?
            .error_for_status()
            .map_err(|e| LlmError::Api(e.to_string()))?;

        let parsed: OpenAiResponse = response.json().await?;

        parsed
            .choices
            .into_iter()
            .next()
            .map(|c| c.message.content)
            .ok_or_else(|| LlmError::Api("response contained no choices".into()))
    }
}

fn build_prompt(reviews: &[SeriesRating], reviewed_recs: &[Series]) -> String {
    let reviews_json = serde_json::to_string_pretty(reviews).unwrap_or_default();
    let reviewed_recs_json = serde_json::to_string_pretty(reviewed_recs).unwrap_or_default();

    format!(
        "## User ratings\n{reviews_json}\n\n\
         ## Previously recommended series the user has since rated\n{reviewed_recs_json}\n\n\
         Recommend 5 series the user would enjoy. Respond with ONLY the JSON object."
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_llm_adapter_reachable() {
        let Ok(api_key) = std::env::var("OPENAI_API_KEY") else {
            println!("Skipping: OPENAI_API_KEY not set");
            return;
        };
        let adapter = LlmAdapter {
            client: reqwest::Client::new(),
            api_key,
        };
        let messages = vec![OpenAiMessage {
            role: "user".into(),
            content: "hey".into(),
        }];
        let result = adapter.call_api(&messages).await;
        assert!(
            result.is_ok(),
            "LLM adapter call failed: {:?}",
            result.err()
        );
        println!("Response: {}", result.unwrap());
    }
}
