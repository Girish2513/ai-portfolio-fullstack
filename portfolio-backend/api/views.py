import os
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
from . import prompts

load_dotenv()

@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_question = data.get('question')
            conversation_history = data.get('history', [])
            knowledge_base = data.get('context', '')

            if not user_question:
                return JsonResponse({'error': 'Question is required'}, status=400)

            # --- Get the secure OpenRouter API Key ---
            api_key = os.environ.get('OPENROUTER_API_KEY')
            if not api_key:
                return JsonResponse({'error': 'OPENROUTER_API_KEY not configured on server'}, status=500)

            # --- Build the full prompt (same as before) ---
            full_prompt_for_ai = f"""
            {prompts.PROMPTS_CONFIG}
            ## My Profile Data (Knowledge Base):
            {knowledge_base}
            ## User's New Question:
            "{user_question}"
            """
            
            # --- Call the OpenRouter API ---
            api_url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}"
            }
            
            # Convert history to the standard OpenAI/OpenRouter format
            messages = []
            for turn in conversation_history:
                 # Skip the very long initial system prompt if it exists in history
                if len(turn['parts'][0]['text']) > 1000:
                    continue
                
                if turn['role'] == 'user':
                    messages.append({"role": "user", "content": turn['parts'][0]['text']})
                elif turn['role'] == 'model':
                    # OpenRouter uses 'assistant' for the model's role
                    messages.append({"role": "assistant", "content": turn['parts'][0]['text']})
            
            # Add the new, fully-contextualized user prompt
            messages.append({"role": "user", "content": full_prompt_for_ai})
            
            payload = {
                # We can still use the Google Gemini model through OpenRouter
                "model": "google/gemini-flash-1.5", 
                "messages": messages
            }

            response = requests.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            openrouter_response = response.json()
            response_text = openrouter_response['choices'][0]['message']['content']

            return JsonResponse({'reply': response_text})

        except requests.exceptions.HTTPError as e:
            error_details = e.response.json()
            return JsonResponse({'error': f"API Error: {error_details}"}, status=e.response.status_code)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

