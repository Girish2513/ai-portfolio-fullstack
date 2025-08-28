// Import all data modules
import personalData from './data/personal.js';
import educationData from './data/education.js';
import skillsData from './data/skills.js';
import projectsData from './data/projects.js';
import achievementsData from './data/achievements.js';
import contactData from './data/contact.js';
import professionalData from './data/professional.js';

// Combine all data for the knowledge base
const combinedData = {
    personal: personalData,
    education: educationData,
    skills: skillsData,
    projects: projectsData,
    achievements: achievementsData,
    contact: contactData,
    professional: professionalData
};

// --- HELPER FUNCTIONS ---

// Convert data to a structured text format for the AI's context
function dataToText(data) {
    let text = `# Girish Saana - Professional Portfolio Information\n\n`;
    text += `## Personal Information:\n- Name: ${data.personal.full_name}\n- Details: Age ${data.personal.age}, located in ${data.personal.location}, speaks ${data.personal.languages.join(', ')}.\n- Personality: ${data.personal.personality.strengths.join(', ')}\n- Interests: ${data.personal.interests.hobbies.join(', ')}\n\n`;
    text += `## Education:\n- B.Tech: ${data.education.btech.degree} from ${data.education.btech.college} with ${data.education.btech.cgpa} CGPA.\n- Intermediate: ${data.education.intermediate.stream} with ${data.education.intermediate.percentage}.\n- School: ${data.education.school.cgpa} CGPA from ${data.education.school.name}.\n\n`;
    text += `## Technical Skills:\n`;
    Object.entries(data.skills).forEach(([category, skills]) => {
        const formattedCategory = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        text += `- ${formattedCategory}: ${skills.join(', ')}\n`;
    });
    text += `\n## Projects:\n`;
    data.projects.forEach(p => {
        text += `- ${p.name}: ${p.description} (Technologies: ${p.technologies.join(', ')}, GitHub: ${p.url})\n`;
    });
    text += `\n## Professional Goals:\n- Objective: ${data.professional.career_objective}\n- Preferred Roles: ${data.professional.preferred_roles.join(', ')}\n\n`;
    text += `## Contact:\n- Email: ${data.contact.email}, LinkedIn: ${data.contact.social_links.linkedin.url}, GitHub: ${data.contact.social_links.github.url}\n`;
    return text;
}

// Convert Markdown-style text to basic HTML for rendering
function markdownToHtml(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-sm font-semibold hover:underline">$1 &rarr;</a>');
    return text;
}

// --- GLOBAL STATE ---
let conversationCount = 0;
let typewriterTimeoutId;
let conversationHistory = [];
const knowledgeBase = dataToText(combinedData);

// --- DOM ELEMENT REFERENCES ---
let askButton, questionInput, responseCard, aiResponseContainer, loader, stopGenerationButton, introHeader, chatHeader, mainContainer, socialLinks;

// --- CORE APPLICATION LOGIC ---

// Main function to handle user queries
async function handleQuery(question) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    questionInput.value = '';

    if (conversationCount === 0) {
        switchToChatView();
    }
    conversationCount++;

    responseCard.classList.remove('hidden');
    aiResponseContainer.innerHTML = '';
    loader.classList.remove('hidden');
    stopGenerationButton.classList.add('hidden');

    try {
        const apiUrl = 'https://ai-portfolio-fullstack.vercel.app/api/chat/';
        const payload = {
            question: trimmedQuestion,
            history: conversationHistory,
            context: knowledgeBase
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Always read the response body as text first to handle non-JSON errors
        const rawResponse = await response.text();
        let result;

        try {
            result = JSON.parse(rawResponse);
        } catch (e) {
            throw new Error(`API returned a non-JSON response (${response.status}): ${rawResponse.slice(0, 300)}`);
        }

        if (!response.ok) {
            const errorMsg = result.error || JSON.stringify(result);
            throw new Error(`API Error (${response.status}): ${errorMsg}`);
        }

        loader.classList.add('hidden');

        if (result.reply) {
            const responseText = result.reply;
            conversationHistory.push({ role: "user", parts: [{ text: trimmedQuestion }] });
            conversationHistory.push({ role: "model", parts: [{ text: responseText }] });

            // Route to the appropriate display function
            routeResponseToDisplay(trimmedQuestion, responseText);
            
            // Show a call-to-action after several interactions
            if (conversationCount === 6) {
                displayCallToAction();
            }
        } else {
            typewriterEffect(result.error || "I'm sorry, an unknown error occurred.");
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        loader.classList.add('hidden');
        typewriterEffect(`An error occurred: ${err.message}. Please ensure the backend server is running.`);
    }
}

// Determines which special UI to show based on the user's query
function routeResponseToDisplay(question, responseText) {
    const lowerCaseQuestion = question.toLowerCase();

    if (lowerCaseQuestion.includes('contact')) {
        displayContactInfo();
    } else if (lowerCaseQuestion.includes('project')) {
        displayProjects(responseText);
    } else if (lowerCaseQuestion.includes('skill') || lowerCaseQuestion.includes('tech')) {
        displaySkills(responseText);
    } else if (lowerCaseQuestion.includes('about yourself') || lowerCaseQuestion.includes('who are you') || lowerCaseQuestion.includes('tell me about yourself')) {
        displayAboutMe(responseText);
    } else {
        typewriterEffect(responseText);
    }
}

// --- UI DISPLAY FUNCTIONS ---

function switchToChatView() {
    introHeader.classList.add('hidden');
    chatHeader.classList.remove('hidden');
    chatHeader.classList.add('flex');
    mainContainer.classList.add('chat-active');
    socialLinks.classList.add('hidden');
}

function typewriterEffect(text, container = aiResponseContainer) {
    if (typewriterTimeoutId) clearTimeout(typewriterTimeoutId);

    let i = 0;
    let targetElement;

    if (container === aiResponseContainer) {
        container.innerHTML = '';
        targetElement = document.createElement('p');
        container.appendChild(targetElement);
    } else {
        targetElement = container;
    }
    
    const speed = 10;
    stopGenerationButton.classList.remove('hidden');

    const htmlText = markdownToHtml(text);

    function type() {
        if (i < text.length) { // Type based on original text length for smoother speed
            targetElement.innerHTML = markdownToHtml(text.slice(0, i + 1));
            i++;
            typewriterTimeoutId = setTimeout(type, speed);
        } else {
            targetElement.innerHTML = htmlText; // Ensure final render is perfect
            stopGenerationButton.classList.add('hidden');
            typewriterTimeoutId = null;
        }
    }
    type();
}

function displayAboutMe(text) {
    aiResponseContainer.innerHTML = `
        <div class="flex items-start gap-4">
            <img src="https://i.ibb.co/WvJ5C2Hn/Pass-Port-Size-Photo.png" alt="Girish Saana" class="w-20 h-20 rounded-full shadow-lg">
            <div class="flex-1" id="about-me-text"></div>
        </div>
    `;
    const textContainer = document.getElementById('about-me-text');
    typewriterEffect(text, textContainer);
}

function displayContactInfo() {
    aiResponseContainer.innerHTML = `
        <p class="mb-4">I'd love to connect! You can reach me through any of the platforms below. I'm actively looking for new opportunities and typically respond within 24 hours.</p>
        <div class="flex justify-center space-x-6 mt-4">
            <a href="${contactData.social_links.linkedin.url}" target="_blank" class="hover:text-blue-600 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="${contactData.social_links.github.url}" target="_blank" class="hover:text-gray-900 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
            <a href="mailto:${contactData.email}" class="hover:text-red-600 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
            </a>
        </div>
    `;
}

function displayProjects(introText) {
    aiResponseContainer.innerHTML = '';
    const introP = document.createElement('p');
    introP.className = 'mb-6';
    aiResponseContainer.appendChild(introP);
    typewriterEffect(introText.split('::')[0].trim(), introP);

    const projectsGrid = document.createElement('div');
    projectsGrid.className = 'projects-grid';

    projectsData.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card glassmorphism rounded-2xl h-80 p-6 flex flex-col justify-end text-white shadow-lg';
        projectCard.style.backgroundImage = `url(${project.image})`;
        projectCard.onclick = () => openProjectModal(project);
        projectCard.innerHTML = `
            <div class="project-card-content">
                <div class="text-sm font-medium mb-2 opacity-90">${project.category}</div>
                <h3 class="text-xl font-bold mb-3">${project.name}</h3>
            </div>
        `;
        projectsGrid.appendChild(projectCard);
    });
    aiResponseContainer.appendChild(projectsGrid);
}

function displaySkills(skillData) {
    aiResponseContainer.innerHTML = '';
    const [intro] = skillData.split('::');

    if (intro && intro.trim()) {
        const introP = document.createElement('p');
        introP.className = 'mb-4';
        aiResponseContainer.appendChild(introP);
        typewriterEffect(intro.trim(), introP);
    }
    
    const icons = {
        "Programming Languages": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>`,
        "Machine Learning": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v10.5A2.25 2.25 0 006.75 21z" /></svg>`,
        "Data Manipulation & Visualization": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>`,
        "Tools & Platforms": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m15.457 0l3.847 3.846a1.125 1.125 0 01-1.59 1.59l-3.848-3.846m-15.457 0l-3.847 3.846a1.125 1.125 0 001.59 1.59l3.848-3.846M15.457 17.25L12 21m3.457-3.75l-3.457 3.75m0 0l-3.457-3.75m3.457 3.75V3.75" /></svg>`,
        "Databases": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>`,
        "Soft Skills": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>`
    };

    // Use the reliable skillsData object directly
    Object.entries(skillsData).forEach(([categoryKey, skills]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'structured-category mb-4';
        
        const formattedName = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const title = document.createElement('h3');
        title.innerHTML = `${icons[formattedName] || icons["Tools & Platforms"]} ${formattedName}`;
        
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'structured-tags';
        tagsDiv.innerHTML = skills.map(skill => `<span class="structured-tag">${skill}</span>`).join('');

        categoryDiv.appendChild(title);
        categoryDiv.appendChild(tagsDiv);
        aiResponseContainer.appendChild(categoryDiv);
    });
}

function displayCallToAction() {
    setTimeout(() => {
        const ctaP = document.createElement('p');
        ctaP.className = "mt-4 pt-4 border-t border-gray-500/50";
        aiResponseContainer.appendChild(ctaP);
        const ctaText = `By the way, it seems you're interested in my profile! I'm currently looking for new opportunities. Feel free to reach out directly at <strong>${contactData.email}</strong> if you'd like to connect.`;
        typewriterEffect(ctaText, ctaP);
    }, 2000);
}

// --- PROJECT MODAL LOGIC ---

function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <img src="${project.image}" alt="${project.name}" class="w-full h-64 object-cover rounded-xl mb-6">
        <div class="flex items-center justify-between mb-4">
            <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">${project.category}</span>
            <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">${project.status}</span>
        </div>
        <h2 class="text-3xl font-bold mb-4">${project.name}</h2>
        <p class="text-lg opacity-80 mb-6">${project.fullDescription}</p>
        <h3 class="text-xl font-semibold mb-4">Technologies Used</h3>
        <div class="flex flex-wrap gap-2 mb-8">
            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="flex items-center justify-between">
            <div class="text-lg"><strong>Impact:</strong> ${project.impact}</div>
            <a href="${project.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center">
                View on GitHub <svg class="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// --- CLASSIC VIEW GENERATION ---

function generateClassicView() {
    const container = document.querySelector('#classic-view .classic-view-card');
    container.innerHTML = `
        <h2 class="text-3xl font-bold mb-4">Skills & Expertise</h2>
        <div class="mb-4">${generateSkillHTML(skillsData)}</div>
        <h2 class="text-3xl font-bold mb-4 mt-8">Projects</h2>
        <div class="mb-4">${generateProjectHTML(projectsData)}</div>
        <h2 class="text-3xl font-bold mb-4 mt-8">Education</h2>
        <div class="mb-4">${generateEducationHTML(educationData)}</div>
    `;
}

function generateSkillHTML(skills) {
    return `<div class="structured-tags">${Object.values(skills).flat().map(s => `<span class="structured-tag">${s}</span>`).join('')}</div>`;
}

function generateProjectHTML(projects) {
    return projects.map(p => `
        <div class="project-item">
            <strong>${p.name}</strong>
            <p>${p.description} (Impact: ${p.impact})</p>
            <a href="${p.url}" target="_blank" class="text-sm font-semibold hover:underline">View on GitHub &rarr;</a>
        </div>
    `).join('');
}

function generateEducationHTML(education) {
    return `
        <div class="project-item">
            <strong>${education.btech.degree}</strong>
            <p>${education.btech.college} (${education.btech.years}) - CGPA: ${education.btech.cgpa}</p>
        </div>
        <div class="project-item">
            <strong>Intermediate (${education.intermediate.stream})</strong>
            <p>${education.intermediate.college} - Percentage: ${education.intermediate.percentage}</p>
        </div>
    `;
}


// --- INITIALIZATION & EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements
    askButton = document.getElementById('askButton');
    questionInput = document.getElementById('question');
    responseCard = document.getElementById('response-card');
    aiResponseContainer = document.getElementById('ai-response');
    loader = document.getElementById('loader');
    stopGenerationButton = document.getElementById('stop-generation');
    introHeader = document.getElementById('intro-header');
    chatHeader = document.getElementById('chat-header');
    mainContainer = document.getElementById('main-content');
    socialLinks = document.getElementById('social-links');
    
    // Setup event listeners
    askButton.addEventListener('click', () => handleQuery(questionInput.value));
    questionInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') handleQuery(questionInput.value);
    });

    document.querySelectorAll('.quick-action').forEach(button => {
        button.addEventListener('click', () => {
            const actionText = button.textContent.trim().replace('✨ ', '');
            let query = `Tell me about my ${actionText}`;
            if (actionText === 'Fun Facts') query = "Tell me a fun fact about my personality or interests.";
            if (actionText === 'Me') query = "Tell me about yourself.";
            questionInput.value = query;
            handleQuery(query);
        });
    });

    stopGenerationButton.addEventListener('click', () => {
        if (typewriterTimeoutId) {
            clearTimeout(typewriterTimeoutId);
            typewriterTimeoutId = null;
            // You might want to finalize the text here instead of leaving it partial
        }
        stopGenerationButton.classList.add('hidden');
    });

    // Modal event listeners
    const closeModalBtn = document.getElementById('close-modal');
    const projectModal = document.getElementById('project-modal');
    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (projectModal) projectModal.onclick = (e) => {
        if (e.target === projectModal) closeModal();
    };
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // View Toggler
    const viewToggleButton = document.getElementById('view-toggle');
    const aiView = document.getElementById('ai-view');
    const classicView = document.getElementById('classic-view');
    const viewToggleText = document.getElementById('view-toggle-text');
    
    generateClassicView();

    viewToggleButton.addEventListener('click', () => {
        const isAiViewHidden = aiView.classList.toggle('hidden');
        classicView.classList.toggle('hidden', !isAiViewHidden);
        viewToggleText.textContent = isAiViewHidden ? "AI View" : "Classic View";
    });

    // View Counter
    document.getElementById('view-count-text').textContent = `${Math.floor(Math.random() * 401) + 100} Views`;

    // --- BACKGROUND ANIMATION LOGIC --- (Keep your existing, well-functioning animation code here)
    // For brevity, the animation functions (initDigitalRain, etc.) are omitted, but should be included.
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const animations = [
        { name: 'Digital Rain', theme: { mode: 'dark', accent: '#00ff00' }, init: initDigitalRain },
        { name: 'Plexus Network', theme: { mode: 'dark', accent: '#ffffff' }, init: initPlexus },
        { name: 'Abstract Waves', theme: { mode: 'dark', accent: '#e73c7e' }, init: initWaves },
        { name: 'Floating Shapes', theme: { mode: 'light', accent: '#3b82f6' }, init: initShapes },
        { name: 'Starfield', theme: { mode: 'dark', accent: '#ffffff' }, init: initStarfield }
    ];
    let currentAnimation = {};

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        root.classList.toggle('dark', theme.mode === 'dark');
        root.style.setProperty('--accent-color', theme.accent);
    }

    function clearAnimation() {
        if (currentAnimation.stop) currentAnimation.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startRandomAnimation() {
        clearAnimation();
        const randomIndex = Math.floor(Math.random() * animations.length);
        currentAnimation = animations[randomIndex];
        applyTheme(currentAnimation.theme);
        currentAnimation.stop = currentAnimation.init(ctx, canvas);
    }

    // Include your animation functions (initDigitalRain, initPlexus, etc.) here...
    
    // Example for one animation function (you should include all of them)
    function initDigitalRain(ctx, canvas) {
        const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリィギジヂビピウゥクスツヌフムユュルョグズブズプエェケセテネヘメレェゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 16;
        let columns = canvas.width / fontSize;
        const rainDrops = Array.from({ length: columns }).fill(1);
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        }
        const intervalId = setInterval(draw, 33);
        return () => clearInterval(intervalId);
    }
    // ... include other animation init functions ...
    function initPlexus(ctx, canvas) { /* Your existing code */ }
    function initWaves(ctx, canvas) { /* Your existing code */ }
    function initShapes(ctx, canvas) { /* Your existing code */ }
    function initStarfield(ctx, canvas) { /* Your existing code */ }


    // Initial setup
    setupCanvas();
    startRandomAnimation();
    window.addEventListener('resize', () => {
        setupCanvas();
        startRandomAnimation(); // Restart on resize to adjust density/layout
    });
});
