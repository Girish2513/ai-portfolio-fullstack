import os
import json
import logging
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from . import prompts

logger = logging.getLogger(__name__)

# --- Helper function for calling OpenRouter API ---
def call_openrouter(messages):
    """
    Tries to get a chat completion from the OpenRouter API.
    Raises an exception on failure.
    """
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        logger.error("OPENROUTER_API_KEY not found in env")
        raise ValueError("OpenRouter API key is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "google/gemini-flash-2.5",
        "messages": messages
    }

    logger.info("Attempting to call OpenRouter API...")
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30,
    )
    
    resp.raise_for_status() # Will raise an HTTPError for 4xx/5xx responses
    data = resp.json()
    return data["choices"][0]["message"]["content"]

# --- Helper function for calling Google Gemini API ---
def call_gemini(messages):
    """
    Tries to get a chat completion from the Google Gemini API as a fallback.
    Raises an exception on failure.
    """
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        logger.error("GEMINI_API_KEY not found in env")
        raise ValueError("Gemini API key is not configured for fallback.")

    # Convert OpenAI message format to Gemini format
    # Note: This is a simplified conversion. For more complex scenarios,
    # you might need to handle roles and parts more carefully.
    gemini_contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        gemini_contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    headers = {"Content-Type": "application/json"}
    api_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {"contents": gemini_contents}

    logger.info("Fallback: Attempting to call Google Gemini API...")
    resp = requests.post(api_url, headers=headers, json=payload, timeout=30)
    
    resp.raise_for_status()
    data = resp.json()
    return data['candidates'][0]['content']['parts'][0]['text']


@csrf_exempt
def chat_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        body = json.loads(request.body or "{}")
        user_question = body.get('question')
        conversation_history = body.get('history', [])
        knowledge_base = body.get('context', '')

        if not user_question:
            return JsonResponse({'error': 'Question is required'}, status=400)

        # Build the full prompt for the AI
        full_prompt_for_ai = f"""
{prompts.PROMPTS_CONFIG}
## My Profile Data (Knowledge Base):
{knowledge_base}
## User's New Question:
"{user_question}"
""".strip()

        # Convert conversation history to the standard message format
        messages = []
        for turn in conversation_history:
            try:
                role = turn.get('role')
                part_text = turn.get('parts', [{}])[0].get('text', '')
                if role and part_text:
                    # Standardize role for different models
                    assistant_role = "assistant" if role in ('model', 'assistant') else "user"
                    messages.append({"role": assistant_role, "content": part_text})
            except (IndexError, KeyError, AttributeError):
                continue # Skip malformed history entries

        messages.append({"role": "user", "content": full_prompt_for_ai})

        # --- Main Logic: Try OpenRouter first, then fallback to Gemini ---
        answer = None
        try:
            answer = call_openrouter(messages)
            logger.info("Successfully received response from OpenRouter.")
        except Exception as e:
            logger.warning(f"OpenRouter API failed: {e}. Attempting fallback to Gemini.")
            try:
                answer = call_gemini(messages)
                logger.info("Successfully received response from Gemini fallback.")
            except Exception as e_gemini:
                logger.error(f"Gemini fallback also failed: {e_gemini}")
                return JsonResponse({'error': f"Primary API failed. Fallback API also failed: {e_gemini}"}, status=500)

        return JsonResponse({'reply': answer})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        logger.exception("An unexpected error occurred in chat_view")
        return JsonResponse({'error': str(e)}, status=500)
