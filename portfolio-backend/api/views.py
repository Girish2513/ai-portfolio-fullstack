import os
import json
import logging
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from . import prompts

logger = logging.getLogger(__name__)

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

        api_key = os.environ.get('OPENROUTER_API_KEY')
        if not api_key:
            logger.error("OPENROUTER_API_KEY not found in env")
            return JsonResponse({'error': 'OPENROUTER_API_KEY not configured on server'}, status=500)

        # Build prompt
        full_prompt_for_ai = f"""
{prompts.PROMPTS_CONFIG}
## My Profile Data (Knowledge Base):
{knowledge_base}
## User's New Question:
"{user_question}"
""".strip()

        # Convert history to OpenAI/OpenRouter format safely
        messages = []
        for turn in conversation_history:
            try:
                part_text = turn.get('parts', [{}])[0].get('text', '')
                if len(part_text) > 1000:
                    continue
                role = turn.get('role')
                if role == 'user':
                    messages.append({"role": "user", "content": part_text})
                elif role in ('model', 'assistant'):
                    messages.append({"role": "assistant", "content": part_text})
            except Exception:
                continue

        messages.append({"role": "user", "content": full_prompt_for_ai})

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {"model": "google/gemini-flash-1.5", "messages": messages}

        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )
        try:
            resp.raise_for_status()
        except requests.exceptions.HTTPError as e:
            # Never assume JSON from upstream
            try:
                err_json = resp.json()
            except ValueError:
                err_json = {"status": resp.status_code, "body": resp.text[:500]}
            logger.error(f"OpenRouter HTTPError: {err_json}")
            return JsonResponse({"error": err_json}, status=resp.status_code)

        # Success path
        data = resp.json()
        answer = data["choices"][0]["message"]["content"]
        return JsonResponse({'reply': answer})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)
    except Exception as e:
        logger.exception("Unexpected error in chat_view")
        return JsonResponse({'error': str(e)}, status=500)
