import os
import json
import logging
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from . import prompts

logger = logging.getLogger(__name__)


# === GROQ API (Primary) ===
def call_groq(messages):
    """Primary: Groq API - Fast and free"""
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048
    }

    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


# === OpenRouter API (Fallback 1) ===
def call_openrouter(messages):
    """Fallback 1: OpenRouter with free models"""
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    # Try free models in order
    free_models = [
        "meta-llama/llama-3.1-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "google/gemma-2-9b-it:free",
    ]
    
    for model in free_models:
        try:
            payload = {
                "model": model,
                "messages": messages
            }
            
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"OpenRouter model {model} failed: {e}")
            continue
    
    raise Exception("All OpenRouter free models failed")


# === Together AI (Fallback 2) ===
def call_together(messages):
    """Fallback 2: Together AI"""
    api_key = os.environ.get('TOGETHER_API_KEY')
    if not api_key:
        raise ValueError("TOGETHER_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        "messages": messages,
        "max_tokens": 2048,
        "temperature": 0.7
    }

    resp = requests.post(
        "https://api.together.xyz/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


# === Hugging Face (Fallback 3) ===
def call_huggingface(messages):
    """Fallback 3: Hugging Face Inference API"""
    api_key = os.environ.get('HUGGINGFACE_API_KEY')
    if not api_key:
        raise ValueError("HUGGINGFACE_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    # Format messages into a single prompt
    prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 1024,
            "temperature": 0.7,
            "return_full_text": False
        }
    }

    resp = requests.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        headers=headers,
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    data = resp.json()
    
    if isinstance(data, list) and len(data) > 0:
        return data[0].get("generated_text", "")
    return str(data)


# === Cohere (Fallback 4) ===
def call_cohere(messages):
    """Fallback 4: Cohere API"""
    api_key = os.environ.get('COHERE_API_KEY')
    if not api_key:
        raise ValueError("COHERE_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    # Convert messages to Cohere format
    chat_history = []
    message = ""
    
    for msg in messages[:-1]:
        role = "USER" if msg["role"] == "user" else "CHATBOT"
        chat_history.append({"role": role, "message": msg["content"]})
    
    if messages:
        message = messages[-1]["content"]
    
    payload = {
        "message": message,
        "chat_history": chat_history,
        "model": "command-r-plus",
        "temperature": 0.7
    }

    resp = requests.post(
        "https://api.cohere.ai/v1/chat",
        headers=headers,
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()["text"]


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

        logger.info(f"Question received: {user_question[:50]}...")

        # Build the full prompt
        full_prompt_for_ai = f"""
{prompts.PROMPTS_CONFIG}
## My Profile Data (Knowledge Base):
{knowledge_base}
## User's New Question:
"{user_question}"
""".strip()

        # Convert conversation history
        messages = []
        for turn in conversation_history:
            try:
                role = turn.get('role', '')
                
                if 'content' in turn:
                    content = turn.get('content', '')
                elif 'parts' in turn and isinstance(turn['parts'], list) and len(turn['parts']) > 0:
                    content = turn['parts'][0].get('text', '')
                else:
                    continue
                
                if not content or not role:
                    continue
                
                normalized_role = "assistant" if role in ('model', 'assistant') else "user"
                messages.append({"role": normalized_role, "content": content})
                
            except Exception as e:
                logger.warning(f"Error processing history: {e}")
                continue

        messages.append({"role": "user", "content": full_prompt_for_ai})
        
        logger.info(f"Prepared {len(messages)} messages")

        # === Cascading Fallback Strategy ===
        providers = [
            ("Groq", call_groq),
            ("OpenRouter", call_openrouter),
            ("Together AI", call_together),
            ("Hugging Face", call_huggingface),
            ("Cohere", call_cohere),
        ]
        
        last_error = None
        
        for provider_name, provider_func in providers:
            try:
                logger.info(f"Trying {provider_name}...")
                answer = provider_func(messages)
                logger.info(f"✓ {provider_name} succeeded")
                return JsonResponse({'reply': answer, 'provider': provider_name})
                
            except ValueError as e:
                # API key not configured, skip silently
                logger.debug(f"{provider_name}: {e}")
                continue
                
            except requests.exceptions.HTTPError as e:
                status_code = e.response.status_code if hasattr(e, 'response') else 'unknown'
                logger.warning(f"✗ {provider_name} failed (HTTP {status_code}): {e}")
                last_error = str(e)
                continue
                
            except Exception as e:
                logger.warning(f"✗ {provider_name} failed: {e}")
                last_error = str(e)
                continue
        
        # All providers failed
        error_msg = "All AI providers are currently unavailable. Please try again in a moment."
        if last_error:
            error_msg += f" Last error: {last_error}"
        
        logger.error("All API providers failed")
        return JsonResponse({'error': error_msg}, status=503)

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON: {e}")
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        logger.exception("Unexpected error in chat_view")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
