# 🤖 AI-Powered Portfolio Chatbot

A personalized, conversational AI chatbot that acts as a digital twin, answering questions about my professional profile, skills, and projects. This project uses a Django backend to connect with large language models and a vanilla JavaScript frontend for the user interface.

## 🚀 Live Demo

**[🔗 Click here to chat with my digital twin! →](https://girish-saana.vercel.app)**

---

## ✨ Features

* **💬 Conversational AI:** Ask questions in natural language about my skills, education, projects, and more.
* **📊 Dynamic Knowledge Base:** The AI's context is built directly from my portfolio data, ensuring accurate and up-to-date responses.
* **🔄 API Fallback System:** Utilizes the OpenRouter API as the primary service, with an automatic fallback to the Google Gemini API to ensure high availability.
* **🎨 Interactive UI:** A clean, responsive chat interface with typewriter effects for AI responses.
* **📋 Structured Responses:** Displays specialized information like projects and skills in rich, formatted cards.

---

## 📸 Screenshots

<img width="3197" height="1822" alt="AI Portfolio Chatbot Home Page" src="https://github.com/user-attachments/assets/37548e69-b32b-4f10-b43d-c33b4ef7d25f" />

*Home Page - Interactive chat interface*

---

## 🛠️ Tech Stack

This project is a full-stack application built with the following technologies:

### Backend
* **🐍 Python** - Core programming language
* **🎯 Django** - Web framework for robust backend development

### Frontend  
* **🌐 HTML5** - Modern markup structure
* **🎨 CSS3** - Responsive styling and animations
* **⚡ Vanilla JavaScript** - Interactive client-side functionality

### AI & APIs
* **🧠 Google Gemini Flash 1.5** - Primary language model via OpenRouter API
* **🔧 OpenRouter API** - Primary AI service with fallback support
* **📡 Google Gemini API** - Backup AI service for high availability

### Deployment
* **☁️ Vercel** - Modern hosting platform for both frontend and backend

---

## 🚀 Local Setup and Installation

To run this project on your local machine, you will need to set up the backend and frontend separately.

### 📋 Prerequisites

* **Python 3.9+**
* **Git**
* **Code editor** (VS Code recommended)

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
   The backend will now be running at `http://127.0.0.1:8000` 🎉

### 🎨 Frontend Setup

1. **Update the API URL:**
   * Open the `script.js` file.
   * Find the `apiUrl` constant and make sure it points to your local backend server for development:
   ```javascript
   const apiUrl = 'http://127.0.0.1:8000/api/chat/';
   ```

2. **Run the frontend:**
   * There is no build step required for the vanilla JS frontend. Simply open the `index.html` file in your browser.
   * **💡 Tip:** Using a tool like the VS Code "Live Server" extension is recommended for auto-refresh functionality.

---

## 🌐 Deployment

This project is deployed on **Vercel**. The `main` branch of each repository (frontend and backend) is automatically deployed to production. Environment variables for production are configured in the Vercel project settings.

### 📝 Deployment Notes
* **Frontend:** Automatically deploys from `main` branch
* **Backend:** Automatically deploys from `main` branch  
* **Environment Variables:** Configure in Vercel dashboard for production

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

**Girish Saana** - girishsaana2513@gmail.com

**Project Link:** [https://github.com/girish2513/ai-portfolio-fullstack](https://github.com/girish2513/ai-portfolio-fullstack)

---

## 🙏 Acknowledgments

* Thanks to OpenRouter for providing access to multiple AI models
* Google Gemini for the powerful language model capabilities
* Vercel for seamless deployment experience