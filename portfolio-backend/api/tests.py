import json
from unittest.mock import patch, MagicMock
from django.test import TestCase, RequestFactory
from api.views import (
    chat_view, get_client_ip, is_rate_limited,
    _rate_limit_cache, RATE_LIMIT_MAX_REQUESTS,
    MAX_QUESTION_LENGTH,
)
from api import prompts
from api.knowledge_base import KNOWLEDGE_BASE


class KnowledgeBaseTest(TestCase):
    """Test that the knowledge base contains expected content."""

    def test_knowledge_base_not_empty(self):
        self.assertTrue(len(KNOWLEDGE_BASE.strip()) > 100)

    def test_knowledge_base_contains_name(self):
        self.assertIn("Girish Saana", KNOWLEDGE_BASE)

    def test_knowledge_base_contains_skills(self):
        self.assertIn("Technical Skills", KNOWLEDGE_BASE)
        self.assertIn("Python", KNOWLEDGE_BASE)
        self.assertIn("React", KNOWLEDGE_BASE)

    def test_knowledge_base_contains_experience(self):
        self.assertIn("WebAura", KNOWLEDGE_BASE)
        self.assertIn("SubmitTech", KNOWLEDGE_BASE)

    def test_knowledge_base_contains_contact(self):
        self.assertIn("girishsaana2513@gmail.com", KNOWLEDGE_BASE)


class PromptsTest(TestCase):
    """Test that prompts are valid and contain key instructions."""

    def test_prompts_config_is_string(self):
        self.assertIsInstance(prompts.PROMPTS_CONFIG, str)

    def test_prompts_config_not_empty(self):
        self.assertTrue(len(prompts.PROMPTS_CONFIG.strip()) > 50)

    def test_prompts_contains_persona(self):
        self.assertIn("Girish Saana", prompts.PROMPTS_CONFIG)

    def test_prompts_contains_formatting_instructions(self):
        self.assertIn("::", prompts.PROMPTS_CONFIG)


class GetClientIpTest(TestCase):
    """Test IP extraction from requests."""

    def setUp(self):
        self.factory = RequestFactory()

    def test_direct_ip(self):
        request = self.factory.get('/')
        request.META['REMOTE_ADDR'] = '1.2.3.4'
        self.assertEqual(get_client_ip(request), '1.2.3.4')

    def test_forwarded_ip(self):
        request = self.factory.get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.1, 10.0.0.2'
        self.assertEqual(get_client_ip(request), '10.0.0.1')

    def test_forwarded_ip_single(self):
        request = self.factory.get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '192.168.1.1'
        self.assertEqual(get_client_ip(request), '192.168.1.1')


class RateLimitTest(TestCase):
    """Test the in-memory rate limiter."""

    def setUp(self):
        _rate_limit_cache.clear()

    def test_allows_requests_under_limit(self):
        for _ in range(RATE_LIMIT_MAX_REQUESTS - 1):
            self.assertFalse(is_rate_limited('test-ip'))

    def test_blocks_at_limit(self):
        for _ in range(RATE_LIMIT_MAX_REQUESTS):
            is_rate_limited('rate-test-ip')
        self.assertTrue(is_rate_limited('rate-test-ip'))

    def test_different_ips_independent(self):
        for _ in range(RATE_LIMIT_MAX_REQUESTS):
            is_rate_limited('ip-a')
        self.assertTrue(is_rate_limited('ip-a'))
        self.assertFalse(is_rate_limited('ip-b'))


class ChatViewMethodTest(TestCase):
    """Test HTTP method handling."""

    def test_get_returns_405(self):
        response = self.client.get('/api/chat/')
        self.assertEqual(response.status_code, 405)
        data = json.loads(response.content)
        self.assertIn('error', data)

    def test_put_returns_405(self):
        response = self.client.put('/api/chat/')
        self.assertEqual(response.status_code, 405)


class ChatViewValidationTest(TestCase):
    """Test input validation on the chat endpoint."""

    def setUp(self):
        _rate_limit_cache.clear()

    def test_empty_body_returns_400(self):
        response = self.client.post(
            '/api/chat/',
            data='{}',
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_missing_question_returns_400(self):
        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'history': []}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_blank_question_returns_400(self):
        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'question': '   '}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_question_too_long_returns_400(self):
        long_question = 'a' * (MAX_QUESTION_LENGTH + 1)
        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'question': long_question}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertIn('too long', data['error'])

    def test_invalid_json_returns_400(self):
        response = self.client.post(
            '/api/chat/',
            data='not json at all',
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertIn('Invalid JSON', data['error'])

    def test_invalid_history_type_is_handled(self):
        """history that isn't a list should not crash."""
        with patch('api.views.call_groq', return_value='mocked reply'):
            response = self.client.post(
                '/api/chat/',
                data=json.dumps({'question': 'hello', 'history': 'not a list'}),
                content_type='application/json'
            )
        self.assertEqual(response.status_code, 200)


class ChatViewRateLimitTest(TestCase):
    """Test rate limiting on the chat endpoint."""

    def setUp(self):
        _rate_limit_cache.clear()

    def test_rate_limit_returns_429(self):
        # Fill up the rate limit
        for _ in range(RATE_LIMIT_MAX_REQUESTS):
            is_rate_limited('127.0.0.1')

        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'hello'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 429)
        data = json.loads(response.content)
        self.assertIn('Too many requests', data['error'])


class ChatViewProviderTest(TestCase):
    """Test the cascading provider fallback logic."""

    def setUp(self):
        _rate_limit_cache.clear()

    @patch('api.views.call_groq', return_value='Hello from Groq!')
    def test_successful_response(self, mock_groq):
        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'Who are you?'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['reply'], 'Hello from Groq!')
        self.assertEqual(data['provider'], 'Groq')

    @patch('api.views.call_groq', return_value='Hello from Groq!')
    def test_system_message_is_first(self, mock_groq):
        """Verify the system prompt is passed as the first message."""
        self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'hi'}),
            content_type='application/json'
        )
        messages = mock_groq.call_args[0][0]
        self.assertEqual(messages[0]['role'], 'system')
        self.assertIn('Girish Saana', messages[0]['content'])

    @patch('api.views.call_groq', return_value='Hello from Groq!')
    def test_user_question_is_last(self, mock_groq):
        """Verify the user's question is the last message."""
        self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'Tell me about your skills'}),
            content_type='application/json'
        )
        messages = mock_groq.call_args[0][0]
        self.assertEqual(messages[-1]['role'], 'user')
        self.assertEqual(messages[-1]['content'], 'Tell me about your skills')

    @patch('api.views.call_groq', return_value='Hello from Groq!')
    def test_context_field_ignored(self, mock_groq):
        """Verify that a client-sent context field is not used."""
        self.client.post(
            '/api/chat/',
            data=json.dumps({
                'question': 'hi',
                'context': 'INJECTED FAKE CONTEXT'
            }),
            content_type='application/json'
        )
        messages = mock_groq.call_args[0][0]
        system_content = messages[0]['content']
        self.assertNotIn('INJECTED FAKE CONTEXT', system_content)
        self.assertIn(KNOWLEDGE_BASE.strip()[:50], system_content)

    @patch('api.views.call_groq', return_value='Groq response')
    def test_conversation_history_normalized(self, mock_groq):
        """Verify both old (Gemini) and new history formats are handled."""
        history = [
            {"role": "user", "content": "first question"},
            {"role": "assistant", "content": "first answer"},
            {"role": "user", "parts": [{"text": "gemini format"}]},
            {"role": "model", "parts": [{"text": "gemini answer"}]},
        ]
        self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'follow up', 'history': history}),
            content_type='application/json'
        )
        messages = mock_groq.call_args[0][0]
        # system + 4 history + 1 user question = 6
        self.assertEqual(len(messages), 6)
        self.assertEqual(messages[1]['content'], 'first question')
        self.assertEqual(messages[2]['content'], 'first answer')
        self.assertEqual(messages[3]['content'], 'gemini format')
        self.assertEqual(messages[4]['role'], 'assistant')

    @patch('api.views.call_cohere', return_value='Cohere reply')
    @patch('api.views.call_huggingface', side_effect=Exception('HF down'))
    @patch('api.views.call_together', side_effect=Exception('Together down'))
    @patch('api.views.call_openrouter', side_effect=Exception('OR down'))
    @patch('api.views.call_groq', side_effect=ValueError('No key'))
    def test_fallback_to_cohere(self, *mocks):
        """Verify fallback cascades through all providers."""
        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'hello'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['provider'], 'Cohere')

    @patch('api.views.call_cohere', side_effect=Exception('Cohere down'))
    @patch('api.views.call_huggingface', side_effect=Exception('HF down'))
    @patch('api.views.call_together', side_effect=Exception('Together down'))
    @patch('api.views.call_openrouter', side_effect=Exception('OR down'))
    @patch('api.views.call_groq', side_effect=Exception('Groq down'))
    def test_all_providers_fail_returns_503(self, *mocks):
        response = self.client.post(
            '/api/chat/',
            data=json.dumps({'question': 'hello'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 503)
        data = json.loads(response.content)
        self.assertIn('unavailable', data['error'])
