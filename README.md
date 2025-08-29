# 🤖 AI-Powered Portfolio Chatbot

A personalized, conversational AI chatbot that acts as a digital twin, answering questions about my professional profile, skills, and projects. This project uses a Django backend to connect with large language models and a vanilla JavaScript frontend for the user interface.

## 🌐 Live Demo

**[👋 Click here to chat with my digital twin! →](https://girish-saana.vercel.app)**

---

## ✨ Features

* **💬 Conversational AI:** Ask questions in natural language about my skills, education, projects, and more.
* **📚 Dynamic Knowledge Base:** The AI's context is built directly from my portfolio data, ensuring accurate and up-to-date responses.
* **🔄 API Fallback System:** Utilizes the OpenRouter API as the primary service, with an automatic fallback to the Google Gemini API to ensure high availability.
* **🎨 Interactive UI:** A clean, responsive chat interface with typewriter effects for AI responses.
* **📋 Structured Responses:** Displays specialized information like projects and skills in rich, formatted cards.

---

## 📸 Screenshots



---

## 🛠️ Tech Stack

This project is a full-stack application built with the following technologies:

* **🐍 Backend:** Python, Django
* **🌐 Frontend:** HTML5, CSS3, Vanilla JavaScript
* **🧠 AI / LLMs:** Google Gemini Flash 1.5 via OpenRouter API (with a direct Gemini API fallback)
* **🚀 Deployment:** Vercel for both frontend and backend hosting

---

## ⚙️ Local Setup and Installation

To run this project on your local machine, you will need to set up the backend and frontend separately.

### 📋 Prerequisites

* Python 3.9+
* Git

### 📥 Cloning

1. **Clone the repository:**
   ```bash
   git clone https://github.com/girish2513/ai-portfolio-fullstack.git
   cd ai-portfolio-fullstack
   ```

### 🔧 Backend Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Mac/Linux, use `source venv/bin/activate`
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   * Create a file named `.env` in the root of the backend project folder.
   * Add your secret API keys to this file. This file is ignored by Git and should not be committed.
   ```env
   # .env file
   OPENROUTER_API_KEY="your_openrouter_api_key_here"
   GEMINI_API_KEY="your_google_gemini_api_key_here"
   DJANGO_SECRET_KEY="your_django_secret_key_here"
   ```

4. **Run the development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will now be running at `http://127.0.0.1:8000`.

### 🎨 Frontend Setup

1. **Update the API URL:**
   * Open the `script.js` file.
   * Find the `apiUrl` constant and make sure it points to your local backend server for development:
   ```javascript
   const apiUrl = 'http://127.0.0.1:8000/api/chat/';
   ```

2. **Run the frontend:**
   * There is no build step required for the vanilla JS frontend. Simply open the `index.html` file in your browser. Using a tool like the VS Code "Live Server" extension is recommended.

---

## 🚀 Deployment

This project is deployed on **Vercel**. The `main` branch of each repository (frontend and backend) is automatically deployed to production. Environment variables for production are configured in the Vercel project settings.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

If you have any questions or suggestions, feel free to reach out!

---

⭐ **If you found this project helpful, please give it a star!** ⭐