// Import all data modules
import personalData from './data/personal.js';
import educationData from './data/education.js';
import skillsData from './data/skills.js';
import projectsData from './data/projects.js';
import achievementsData from './data/achievements.js';
import contactData from './data/contact.js';
import professionalData from './data/professional.js';
const allKnownSkills = Object.values(skillsData).flat();


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

// Convert data to text format for AI processing
function dataToText(data) {
    let text = `# Girish Saana - Professional Portfolio Information\n\n`;
    text += `## Personal Information:\n`;
    text += `- Name: ${data.personal.full_name} (Age: ${data.personal.age})\n`;
    text += `- Location: ${data.personal.location}\n`;
    text += `- Languages: ${data.personal.languages.join(', ')}\n`;
    text += `- Family: Father - ${data.personal.family.father}, Mother - ${data.personal.family.mother}\n`;
    text += `- Personality: ${data.personal.personality.strengths.join(', ')}\n`;
    text += `- Interests: ${data.personal.interests.hobbies.join(', ')}\n\n`;
    text += `## Education:\n`;
    text += `- ${data.education.btech.degree} from ${data.education.btech.college} (${data.education.btech.years}) - CGPA: ${data.education.btech.cgpa}\n`;
    text += `- ${data.education.intermediate.stream} from ${data.education.intermediate.college} - ${data.education.intermediate.percentage}\n`;
    text += `- High School from ${data.education.school.name} - ${data.education.school.cgpa} CGPA\n\n`;
    text += `## Technical Skills:\n`;
    Object.entries(data.skills).forEach(([category, skills]) => {
        const formattedCategory = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        text += `- ${formattedCategory}: ${skills.join(', ')}\n`;
    });
    text += `\n`;
    text += `## Projects:\n`;
    data.projects.forEach((project, index) => {
        text += `${index + 1}. ${project.name}:\n`;
        text += `   - Description: ${project.description}\n`;
        text += `   - Technologies: ${project.technologies.join(', ')}\n`;
        text += `   - Impact: ${project.impact}\n`;
        text += `   - GitHub: ${project.url}\n\n`;
    });
    text += `## Professional Goals:\n`;
    text += `- Objective: ${data.professional.career_objective}\n`;
    text += `- Preferred Roles: ${data.professional.preferred_roles.join(', ')}\n`;
    text += `- Industry Interests: ${data.professional.industry_interests.join(', ')}\n\n`;
    text += `## Achievements:\n`;
    text += `- Academic: Strong academic record across all levels\n`;
    text += `- Technical: Solved 200+ LeetCode problems, Multiple certifications\n`;
    text += `- Leadership: Cricket Team Captain, Sports Club Head\n\n`;
    text += `## Contact Information:\n`;
    text += `- Email: ${data.contact.email}\n`;
    text += `- Phone: ${data.contact.phone}\n`;
    text += `- LinkedIn: ${data.contact.social_links.linkedin.url}\n`;
    text += `- GitHub: ${data.contact.social_links.github.url}\n`;
    text += `- LeetCode: ${data.contact.social_links.leetcode.url}\n`;
    text += `- Availability: ${data.contact.availability.status}\n`;
    return text;
}

// Generate knowledge base
const knowledgeBase = dataToText(combinedData);

// Global variables
let conversationCount = 0;
let typewriterTimeoutId;
let conversationHistory = [];

// DOM Element Selections
const askButton = document.getElementById('askButton');
const questionInput = document.getElementById('question');
const responseCard = document.getElementById('response-card');
const aiResponseContainer = document.getElementById('ai-response');
const loader = document.getElementById('loader');
const quickActionButtons = document.querySelectorAll('.quick-action');
const stopGenerationButton = document.getElementById('stop-generation');
const introHeader = document.getElementById('intro-header');
const chatHeader = document.getElementById('chat-header');
const mainContainer = document.getElementById('main-content');
const socialLinks = document.getElementById('social-links');

// Event listeners
askButton.addEventListener('click', () => handleQuery(questionInput.value));
questionInput.addEventListener('keyup', (event) => { 
    if (event.key === 'Enter') handleQuery(questionInput.value); 
});

quickActionButtons.forEach(button => {
    button.addEventListener('click', () => {
        let query = `Tell me about my ${button.textContent.replace('✨ ','')}`;
        if (button.textContent.includes('Fun Facts')) query = "Tell me a fun fact about my personality or interests.";
        if (button.textContent.includes('Me')) query = "Tell me a bit about yourself.";
        questionInput.value = query;
        handleQuery(query);
    });
});

stopGenerationButton.addEventListener('click', () => {
    if (typewriterTimeoutId) {
        clearTimeout(typewriterTimeoutId);
        typewriterTimeoutId = null;
    }
    stopGenerationButton.classList.add('hidden');
});

function switchToChatView() {
    introHeader.classList.add('hidden');
    chatHeader.classList.remove('hidden');
    chatHeader.classList.add('flex');
    mainContainer.classList.add('chat-active');
    socialLinks.classList.add('hidden');
}

function markdownToHtml(text) {
    // Convert bold **text** to <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert links [text](url) to <a href="url">text</a>
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-sm font-semibold hover:underline">$1 &rarr;</a>');
    return text;
}

function displayAboutMe(text) {
    aiResponseContainer.innerHTML = '';
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-start gap-4';
    const img = document.createElement('img');
    img.src = "https://i.ibb.co/WvJ5C2Hn/Pass-Port-Size-Photo.png";
    img.alt = "Girish Saana";
    img.className = "w-20 h-20 rounded-full shadow-lg";
    const textContainer = document.createElement('div');
    textContainer.className = "flex-1";
    flexContainer.appendChild(img);
    flexContainer.appendChild(textContainer);
    aiResponseContainer.appendChild(flexContainer);
    typewriterEffect(text, textContainer);
}

function displayContactInfo() {
    aiResponseContainer.innerHTML = ''; // Clear the response area

    // Create the HTML content with clickable links
    const contactHTML = `
        <p class="mb-4">I'd love to connect! You can reach me through any of the platforms below. I'm actively looking for new opportunities and typically respond within 24 hours.</p>
        <div class="flex justify-center space-x-6 mt-4">
            <a href="https://linkedin.com/in/girish-saana-443018306/" target="_blank" class="hover:text-blue-600 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd"/></svg>
            </a>
            <a href="https://github.com/girish2513" target="_blank" class="hover:text-gray-900 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/></svg>
            </a>
             <a href="mailto:girishsaana2513@gmail.com" class="hover:text-red-600 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
            </a>
        </div>
    `;
    
    // Set the HTML content of the response container
    aiResponseContainer.innerHTML = contactHTML;
}


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
        // const apiUrl = 'http://127.0.0.1:8000/api/chat/';
        // const apiUrl = 'https://portfolio-backend.vercel.app/api/chat/';
        const apiUrl = 'https://ai-portfolio-fullstack.vercel.app/api/chat/';
        const payload = {
            question: trimmedQuestion,
            history: conversationHistory,
            context: knowledgeBase
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        try {
    data = await response.json();
} catch {
    const text = await response.text();
    throw new Error(`API returned non-JSON (${response.status}): ${text.slice(0, 300)}`);
}

if (!response.ok) {
    const errorMsg = typeof data.error === "string"
        ? data.error
        : JSON.stringify(data.error, null, 2);
    throw new Error(`API Error (${response.status}): ${errorMsg}`);
}


        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Could not parse error response.' }));
            const errorMessage = errorBody.error || response.statusText;
            throw new Error(`API Error: ${errorMessage}`);
        }
        
        const result = await response.json();
        loader.classList.add('hidden');

        if (result.reply) {
            const responseText = result.reply;
            
            conversationHistory.push({ role: "user", parts: [{ text: trimmedQuestion }] });
            conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
            
            const lowerCaseQuestion = trimmedQuestion.toLowerCase();

            // --- THIS LOGIC BLOCK IS NOW FIXED ---
            if (lowerCaseQuestion.includes('contact')) {
        displayContactInfo();
            }else if (responseText.includes('::') && lowerCaseQuestion.includes('project')) {
                // Using the correct function for project cards
                displayProjects(responseText);
            } else if (responseText.includes('::') && (lowerCaseQuestion.includes('skill') || lowerCaseQuestion.includes('tech'))) {
                displaySkills(responseText);
            } else if (lowerCaseQuestion.includes('about yourself') || lowerCaseQuestion.includes('who are you')) {
                // This check is now more specific and won't trigger on other questions.
                displayAboutMe(responseText);
            } else {
                typewriterEffect(responseText);
            }
            
            if (conversationCount === 6) {
                setTimeout(() => {
                   const ctaText = `By the way, it seems like you're interested in my profile! I'm currently looking for new opportunities. Feel free to reach out to me directly at ${contactData.email} if you'd like to connect.`;
                   const ctaP = document.createElement('p');
                   ctaP.className = "mt-4 pt-4 border-t border-gray-500/50";
                   aiResponseContainer.appendChild(ctaP);
                   typewriterEffect(ctaText, ctaP);
                }, 2000);
            }
        } else {
            typewriterEffect(result.error || "I'm sorry, an unknown error occurred.");
        }
    } catch (err) {
        console.error("Error:", err);
        loader.classList.add('hidden');
        typewriterEffect(`An error occurred: ${err.message}. Make sure your Django server is running.`);
    }
}

function typewriterEffect(text, container = aiResponseContainer) {
    let i = 0;
    let p;
    if (container === aiResponseContainer) {
        container.innerHTML = '';
        p = document.createElement('p');
        container.appendChild(p);
    } else {
        p = container;
    }
    const speed = 2;
    stopGenerationButton.classList.remove('hidden');

    // First, convert the entire response from Markdown to HTML
    const htmlText = markdownToHtml(text);
    
    function type() {
        if (i < htmlText.length) {
            // Use innerHTML to render the formatted text
            p.innerHTML = htmlText.slice(0, i + 1);
            i++;
            typewriterTimeoutId = setTimeout(type, speed);
        } else {
            // Ensure the final HTML is perfectly rendered
            p.innerHTML = htmlText;
            stopGenerationButton.classList.add('hidden');
            typewriterTimeoutId = null;
        }
    }
    type();
}

function displaySkills(skillData) {
    aiResponseContainer.innerHTML = '';
    const [intro, data] = skillData.split('::');
    
    if (intro && intro.trim()) {
        const introP = document.createElement('p');
        introP.className = 'mb-4';
        aiResponseContainer.appendChild(introP);
        typewriterEffect(intro.trim(), introP);
    }
    
    const icons = {
        "Programming Languages": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>`,
        "Machine Learning": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v10.5A2.25 2.25 0 006.75 21z" /></svg>`,
        "Data Manipulation": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>`,
        "Data Visualization": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>`,
        "Data Structures Algorithms": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>`,
        "Tools Platforms": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m15.457 0l3.847 3.846a1.125 1.125 0 01-1.59 1.59l-3.848-3.846m-15.457 0l-3.847 3.846a1.125 1.125 0 001.59 1.59l3.848-3.846M15.457 17.25L12 21m3.457-3.75l-3.457 3.75m0 0l-3.457-3.75m3.457 3.75V3.75" /></svg>`,
        "Databases": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>`,
        "Soft Skills": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>`
    };
    
    if (data && data.trim()) {
        const categories = data.trim().split('|');
        let followUpParts = [];
        let followUpStarted = false;

        categories.forEach(catString => {
            if (followUpStarted) {
                return; // Skip everything after Communication
            }

            const nameIndex = catString.indexOf(':');
            if (nameIndex === -1) {
                return; // Skip malformed categories
            }
            
            const categoryName = catString.substring(0, nameIndex);
            const skillsString = catString.substring(nameIndex + 1);

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'structured-category mb-4';
            const title = document.createElement('h3');
            const formattedName = categoryName.trim().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            title.innerHTML = `${icons[formattedName] || icons["Tools Platforms"]} ${formattedName}`;
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'structured-tags';

            if (skillsString) {
                const skillCandidates = skillsString.split(',');
                
                for (const candidate of skillCandidates) {
                    const trimmedCandidate = candidate.trim();
                    if (!trimmedCandidate) continue;

                    if (followUpStarted) {
                        break; // Stop processing this category if we hit Communication
                    }

                    const tag = document.createElement('span');
                    tag.className = 'structured-tag';
                    tag.textContent = trimmedCandidate;
                    tagsDiv.appendChild(tag);
                    
                    // Once we hit "Communication", stop processing everything
                    if (trimmedCandidate === 'Communication') {
                        followUpStarted = true;
                        break;
                    }
                }
            }

            categoryDiv.appendChild(title);
            if (tagsDiv.hasChildNodes()) {
                categoryDiv.appendChild(tagsDiv);
                aiResponseContainer.appendChild(categoryDiv);
            }
        });
    }
}



// Enhanced displayProjects function
function displayProjects(projectData) {
    aiResponseContainer.innerHTML = '';
    const [intro, data] = projectData.split('::');
    
    if (intro && intro.trim()) {
        const introP = document.createElement('p');
        introP.className = 'mb-6';
        aiResponseContainer.appendChild(introP);
        typewriterEffect(intro.trim(), introP);
    }
    
    // Create projects grid
    const projectsGrid = document.createElement('div');
    projectsGrid.className = 'projects-grid';
    
    // Use the enhanced project data instead of parsing from string
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

// Project modal functions - ADD THESE NEW FUNCTIONS
function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="mb-6">
            <img src="${project.image}" alt="${project.name}" class="w-full h-64 object-cover rounded-xl mb-4">
            <div class="flex items-center justify-between mb-4">
                <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">${project.category}</span>
                <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">${project.status}</span>
            </div>
            <h2 class="text-3xl font-bold mb-4">${project.name}</h2>
            <p class="text-lg opacity-80 mb-6">${project.fullDescription}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            ${Object.entries(project.metrics).map(([key, value]) => `
                <div class="text-center p-4 glassmorphism rounded-lg">
                    <div class="text-2xl font-bold text-blue-400">${value}</div>
                    <div class="text-sm opacity-70 capitalize">${key}</div>
                </div>
            `).join('')}
        </div>

        <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4">Key Highlights</h3>
            <ul class="space-y-2">
                ${project.highlights.map(highlight => `
                    <li class="flex items-start">
                        <svg class="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        ${highlight}
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4">Technologies Used</h3>
            <div class="flex flex-wrap gap-2">
                ${project.technologies.map(tech => `
                    <span class="tech-tag">${tech}</span>
                `).join('')}
            </div>
        </div>

        <div class="flex items-center justify-between">
            <div class="text-lg">
                <strong>Impact:</strong> ${project.impact}
            </div>
            <a href="${project.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center">
                View on GitHub
                <svg class="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
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

// ADD EVENT LISTENERS TO YOUR EXISTING DOMContentLoaded FUNCTION
// Add this inside your existing document.addEventListener('DOMContentLoaded', () => {}) function

// Modal event listeners
const closeModalBtn = document.getElementById('close-modal');
const projectModal = document.getElementById('project-modal');

if (closeModalBtn) {
    closeModalBtn.onclick = closeModal;
}

if (projectModal) {
    projectModal.onclick = (e) => {
        if (e.target === projectModal) {
            closeModal();
        }
    };
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

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
    const allSkills = Object.values(skills).flat();
    return `<div class="structured-tags">${allSkills.map(s => `<span class="structured-tag">${s}</span>`).join('')}</div>`;
}

function generateProjectHTML(projects) {
    return projects.map(p => `
        <div class="project-item">
            <strong>${p.name}</strong>
            <p>${p.description} (Impact: ${p.impact})</p>
            <a href="${p.url}" target="_blank" class="text-sm font-semibold">View on GitHub &rarr;</a>
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
            <p>${education.intermediate.college} (${education.intermediate.years}) - Percentage: ${education.intermediate.percentage}</p>
        </div>
    `;
}

// Background animation and other initialization code (keeping your existing code)
document.addEventListener('DOMContentLoaded', () => {
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
        if (theme.mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        root.style.setProperty('--accent-color', theme.accent);
    }
    
    function clearAnimation() {
        if (currentAnimation.stop) {
            currentAnimation.stop();
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startRandomAnimation() {
        clearAnimation();
        const randomIndex = Math.floor(Math.random() * animations.length);
        currentAnimation = animations[randomIndex];
        applyTheme(currentAnimation.theme);
        currentAnimation.stop = currentAnimation.init(ctx, canvas);
    }

    // Animation implementations (keeping all your existing animation functions)
    function initDigitalRain(ctx, canvas) {
        const alphabet = 'アアカサタナハマヤャラワガザダバパイィキシチニヒミリィギジヂビピウゥクスツヌフムユュルョグズブズプエェケセテネヘメレェゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 16;
        let columns = canvas.width / fontSize;
        const rainDrops = [];
        for (let x = 0; x < columns; x++) rainDrops[x] = 1;

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
                rainDrops[i]++;
            }
        }
        const intervalId = setInterval(draw, 33);
        return () => clearInterval(intervalId);
    }

    function initPlexus(ctx, canvas) {
        let particlesArray = [];
        class Particle {
            constructor(x, y, dirX, dirY, size) { this.x = x; this.y = y; this.directionX = dirX; this.directionY = dirY; this.size = size; }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'; ctx.fill(); }
            update() { if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX; if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY; this.x += this.directionX; this.y += this.directionY; this.draw(); }
        }
        let numParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * (canvas.width - size * 2) + size * 2);
            let y = (Math.random() * (canvas.height - size * 2) + size * 2);
            let dirX = (Math.random() * .4) - .2;
            let dirY = (Math.random() * .4) - .2;
            particlesArray.push(new Particle(x, y, dirX, dirY, size));
        }
        function connect() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dist = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    if (dist < (canvas.width / 7) * (canvas.height / 7)) {
                        let opacity = 1 - (dist / 20000);
                        ctx.strokeStyle = 'rgba(200, 200, 200,' + opacity + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
            connect();
        }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }
    
    function initWaves(ctx, canvas) {
        let time = 0;
        function drawWave(freq, amp, speed, color1, color2) {
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let x = 0; x < canvas.width; x++) {
                const y = Math.sin(x * freq + time * speed) * amp + canvas.height / 2;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, 0.3)`);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.02;
            drawWave(0.002, 100, 0.5, {r:231,g:60,b:126}, {r:35,g:166,b:213});
            drawWave(0.003, 120, 0.3, {r:35,g:166,b:213}, {r:231,g:60,b:126});
        }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }

    function initShapes(ctx, canvas) {
        let shapes = [];
        for(let i = 0; i < 10; i++) {
            shapes.push({
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 100,
                width: Math.random() * 100 + 20,
                height: Math.random() * 100 + 20,
                speed: Math.random() * 2 + 0.5,
                rotation: Math.random() * 360,
                color: `rgba(${Math.random() > 0.5 ? '59, 130, 246' : '139, 92, 246'}, 0.15)`
            });
        }
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            shapes.forEach(shape => {
                shape.y -= shape.speed;
                shape.rotation += shape.speed / 20;
                if (shape.y < -shape.height) {
                    shape.y = canvas.height + shape.height;
                    shape.x = Math.random() * canvas.width;
                }
                ctx.save();
                ctx.translate(shape.x, shape.y);
                ctx.rotate(shape.rotation);
                ctx.fillStyle = shape.color;
                ctx.fillRect(-shape.width/2, -shape.height/2, shape.width, shape.height);
                ctx.restore();
            });
        }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }
    
    function initStarfield(ctx, canvas) {
        let stars = [];
        for(let i=0; i<500; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                vx: (Math.random() - 0.5) / 2,
                vy: (Math.random() - 0.5) / 2
            });
        }
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2);
                ctx.fill();
                star.x += star.vx;
                star.y += star.vy;
                if(star.x < 0 || star.x > canvas.width) star.x = Math.random() * canvas.width;
                if(star.y < 0 || star.y > canvas.height) star.y = Math.random() * canvas.height;
            });
        }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }

    // Main execution
    setupCanvas();
    startRandomAnimation();

    window.addEventListener('resize', () => {
        setupCanvas();
        startRandomAnimation();
    });

    // View Counter
    const viewCountEl = document.getElementById('view-count-text');
    const randomViews = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    viewCountEl.textContent = `${randomViews} Views`;
    

    // View Toggler
    const viewToggleButton = document.getElementById('view-toggle');
    const aiView = document.getElementById('ai-view');
    const classicView = document.getElementById('classic-view');
    const viewToggleText = document.getElementById('view-toggle-text');
    
    generateClassicView();

    viewToggleButton.addEventListener('click', () => {
        if(aiView.classList.contains('hidden')) {
            aiView.classList.remove('hidden');
            classicView.classList.add('hidden');
            viewToggleText.textContent = "Classic View";
        } else {
            aiView.classList.add('hidden');
            classicView.classList.remove('hidden');
            viewToggleText.textContent = "AI View";
        }
    });
});
