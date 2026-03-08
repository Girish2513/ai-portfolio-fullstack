const projectsData = [
    {
        name: "Conversational AI Digital Twin",
        category: "AI Chatbot",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
        description: "Full-stack AI portfolio with a Django REST API backend and JavaScript frontend. Real-time professional Q&A with multi-provider AI fallback.",
        fullDescription: "An innovative approach to professional networking, this AI chatbot serves as a digital representation of professional identity. The system uses natural language processing to understand visitor queries and provides contextually appropriate responses about skills, experience, and project details. Built with a Django REST API backend and vanilla JavaScript frontend, featuring multi-provider AI fallback across Groq, OpenRouter, Together AI, Hugging Face, and Cohere for maximum reliability.",
        technologies: ["Django", "JavaScript", "REST APIs", "AI Integration", "Multi-Provider Fallback"],
        impact: "Enhanced user engagement with 90% of visitors interacting with the AI assistant",
        url: "https://github.com/girish2513/ai-portfolio-fullstack",
        status: "Live",
        highlights: [
            "Django REST API backend with cascading AI provider fallback",
            "Interactive chat interface with typewriter effect",
            "Server-side knowledge base for security",
            "Rate limiting and input validation",
            "Modern glassmorphism UI with animated canvas backgrounds"
        ],
        metrics: {
            engagement: "90%",
            responseTime: "<2s",
            providers: "5",
            uptime: "99.9%"
        }
    },
    {
        name: "Navodaya High School Portal",
        category: "Full-Stack Web App",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
        description: "Official school portal serving 2,800+ users, built with React.js and Vite. Achieved 95+ Lighthouse performance score.",
        fullDescription: "Architected and delivered the official web portal for Navodaya High School as a freelance project for WebAura. Led the full product lifecycle from client requirements gathering to live deployment. The portal digitizes admissions, alumni management, and school information, serving over 2,800 active users with a 95+ Lighthouse performance score.",
        technologies: ["React.js", "Vite", "JavaScript (ES6+)", "CSS3", "REST APIs"],
        impact: "Serving 2,800+ users with 95+ Lighthouse performance score",
        url: "https://navodayahighschool.online",
        status: "Live",
        highlights: [
            "Architected for 2,800+ active users",
            "95+ Lighthouse performance score",
            "Full product lifecycle from requirements to deployment",
            "Digitized admissions and alumni management",
            "Responsive design for all devices"
        ],
        metrics: {
            users: "2,800+",
            performance: "95+",
            lifecycle: "Full",
            platform: "Web"
        }
    },
    {
        name: "Digit LMS Android App",
        category: "Mobile App",
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
        description: "Learning Management System Android app built with React Native for course management, assignments, and progress tracking.",
        fullDescription: "Built during an internship at SubmitTech Solutions, the Digit LMS is a full-featured Android application for managing courses, assignments, and student progress. Developed using React Native with reusable frontend components and integrated REST APIs for authentication and course data. Built in an agile team environment.",
        technologies: ["React Native", "JavaScript", "REST APIs", "Mobile Development"],
        impact: "Streamlined course management with reusable component architecture",
        url: "https://github.com/girish2513",
        status: "Completed",
        highlights: [
            "React Native mobile application",
            "Reusable component architecture",
            "REST API integration for auth and course data",
            "Course, assignment, and progress tracking",
            "Built in agile team environment"
        ],
        metrics: {
            platform: "Android",
            framework: "React Native",
            methodology: "Agile",
            apis: "REST"
        }
    },
    {
        name: "Hybrid Movie Recommendation System",
        category: "Machine Learning",
        image: "https://i.ibb.co/x8RS4nhG/Screenshot-2025-07-25-000015.png",
        description: "Hybrid recommendation engine combining Local K-Means Clustering and Global Nearest Neighbor algorithms on the MovieLens dataset.",
        fullDescription: "Engineered a sophisticated hybrid recommendation engine that combines Local K-Means Clustering and Global Nearest Neighbor algorithms. Optimized prediction accuracy by calculating Hit Rate (HR) and ARHR metrics on the MovieLens dataset. The hybrid approach leverages both clustering and nearest-neighbor strategies to overcome the limitations of individual recommendation methods.",
        technologies: ["Python", "Scikit-learn", "Pandas", "NumPy", "K-Means Clustering", "Nearest Neighbor"],
        impact: "Optimized prediction accuracy with HR and ARHR metrics on MovieLens dataset",
        url: "https://github.com/girish2513",
        status: "Completed",
        highlights: [
            "Hybrid engine combining K-Means Clustering and Nearest Neighbor",
            "Hit Rate (HR) and ARHR metric optimization",
            "MovieLens dataset processing and analysis",
            "Local and global algorithm combination",
            "Scalable recommendation architecture"
        ],
        metrics: {
            algorithms: "2",
            dataset: "MovieLens",
            metrics: "HR & ARHR",
            approach: "Hybrid"
        }
    },
    {
        name: "Smart Nutri - AI Nutrition Planner",
        category: "Health Tech",
        image: "https://i.ibb.co/MyszL3Zk/Screenshot-2025-07-24-235502.png",
        description: "Web application for personalized diet recommendations using Nutritionix API integration and EER-based calorie calculation.",
        fullDescription: "Smart Nutri is an intelligent nutrition planning platform that provides personalized meal recommendations. The application uses Nutritionix API integration and EER-based calorie calculation formulas to analyze user requirements and deliver customized diet plans. Features database optimization achieving 30% faster query response times.",
        technologies: ["Python", "Flask", "SQLAlchemy", "API Integration", "Database Optimization"],
        impact: "Served 100+ users with 30% improved database response time",
        url: "https://github.com/Girish2513/SmartNutri",
        status: "Completed",
        highlights: [
            "Personalized nutrition recommendations",
            "EER-based calorie calculation formulas",
            "Nutritionix API integration",
            "Database optimization with 30% faster queries",
            "User-friendly responsive web interface"
        ],
        metrics: {
            users: "100+",
            performance: "30% faster",
            accuracy: "95%",
            uptime: "99.9%"
        }
    }
];

export default projectsData;
