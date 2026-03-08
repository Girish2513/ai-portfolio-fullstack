# AI-Powered Portfolio Chatbot

A personalized, conversational AI chatbot that acts as a digital twin, answering questions about my professional profile, skills, and projects. This project uses a Django backend to connect with large language models and a vanilla JavaScript frontend for the user interface.

## Live Demo

**[Click here to chat with my digital twin!](https://girish-saana.vercel.app)**

---

## Features

* **Conversational AI:** Ask questions in natural language about my skills, education, projects, and more.
* **Dynamic Knowledge Base:** The AI's context is built directly from my portfolio data, ensuring accurate and up-to-date responses.
* **5-Tier API Fallback System:** Cascading fallback across Groq, OpenRouter, Together AI, Hugging Face, and Cohere for high availability.
* **Interactive UI:** A clean, responsive chat interface with typewriter effects, animated canvas backgrounds, and glassmorphism design.
* **Structured Responses:** Displays specialized information like projects and skills in rich, formatted cards.

---

## Tech Stack

### Backend
* **Python** - Core programming language
* **Django** - Web framework for robust backend development

### Frontend
* **HTML5** - Modern markup structure
* **CSS3** - Responsive styling and animations
* **Tailwind CSS** - Utility-first CSS framework
* **Vanilla JavaScript** - Interactive client-side functionality (ES Modules)

### AI & APIs (Cascading Fallback)
1. **Groq** (Llama 3.3 70B) - Primary, fastest
2. **OpenRouter** (Llama 3.1 / Mistral / Gemma free models) - Fallback 1
3. **Together AI** (Llama 3.1 8B) - Fallback 2
4. **Hugging Face** (Mistral 7B) - Fallback 3
5. **Cohere** (Command R+) - Fallback 4

### Deployment
* **Vercel** - Hosting for both frontend and backend

---

## Local Setup and Installation

### Prerequisites

* **Python 3.9+**
* **Git**

### Cloning

```bash
git clone https://github.com/girish2513/ai-portfolio-fullstack.git
cd ai-portfolio-fullstack
```

### Backend Setup

1. **Create a virtual environment:**
   ```bash
   cd portfolio-backend
   python -m venv venv
   source venv/Scripts/activate  # On Mac/Linux: source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `portfolio-backend/` directory:
   ```env
   DJANGO_SECRET_KEY="your_django_secret_key_here"
   GROQ_API_KEY="your_groq_api_key_here"
   OPENROUTER_API_KEY="your_openrouter_api_key_here"
   TOGETHER_API_KEY="your_together_api_key_here"
   HUGGINGFACE_API_KEY="your_huggingface_api_key_here"
   COHERE_API_KEY="your_cohere_api_key_here"
   ```
   You only need at least one AI API key configured. The system will skip unconfigured providers.

4. **Run the development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1. **Update the API URL:**
   Open `portfolio-frontend/script.js` and update `apiUrl` to point to your local backend:
   ```javascript
   const apiUrl = 'http://127.0.0.1:8000/api/chat/';
   ```

2. **Run the frontend:**
   Open `portfolio-frontend/index.html` in your browser. Using VS Code "Live Server" extension is recommended.

---

## Deployment

Deployed on **Vercel**. The `main` branch is automatically deployed to production. Environment variables are configured in the Vercel project settings.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Contact

**Girish Saana** - girishsaana2513@gmail.com

**Project Link:** [https://github.com/girish2513/ai-portfolio-fullstack](https://github.com/girish2513/ai-portfolio-fullstack)
