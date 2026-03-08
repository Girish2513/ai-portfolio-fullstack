// Import data modules (used for frontend rendering)
import projectsData from './data/projects.js';
import contactData from './data/contact.js';

// State
let conversationCount = 0;
let typewriterTimeoutId = null;
let conversationHistory = [];
let isLoading = false;

// DOM Elements
const askButton = document.getElementById('askButton');
const questionInput = document.getElementById('question');
const chatMessages = document.getElementById('chat-messages');
const quickActionButtons = document.querySelectorAll('.quick-action');
const stopGenerationButton = document.getElementById('stop-generation');
const introHeader = document.getElementById('intro-header');
const chatHeader = document.getElementById('chat-header');
const mainContainer = document.getElementById('main-content');
const socialLinks = document.getElementById('social-links');
const cvButton = document.getElementById('cv-button');

// Input constraints
questionInput.setAttribute('maxlength', '1000');

// === EVENT LISTENERS ===

askButton.addEventListener('click', () => handleQuery(questionInput.value));
questionInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleQuery(questionInput.value);
    }
});

quickActionButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (isLoading) return;
        const label = button.textContent.trim();
        const queries = {
            'Me': 'Tell me a bit about yourself.',
            'Experience': 'Tell me about your work experience.',
            'Projects': 'Tell me about your projects.',
            'Skills': 'Tell me about your skills.',
            'Fun Facts': 'Tell me a fun fact about your personality or interests.',
            'Contact': 'How can I contact you?'
        };
        const query = queries[label] || `Tell me about ${label}`;
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

// === VIEW TRANSITIONS ===

function switchToChatView() {
    // Smooth fade out intro
    introHeader.classList.add('hiding');
    socialLinks.style.transition = 'opacity 0.4s ease';
    socialLinks.style.opacity = '0';
    if (cvButton) {
        cvButton.style.transition = 'opacity 0.4s ease';
        cvButton.style.opacity = '0';
    }

    setTimeout(() => {
        introHeader.classList.add('hidden');
        socialLinks.classList.add('hidden');
        if (cvButton) cvButton.classList.add('hidden');
        chatHeader.classList.remove('hidden');
        chatHeader.classList.add('flex');
        mainContainer.classList.add('chat-active');
    }, 400);
}

// === LOADING STATE ===

function setLoading(loading) {
    isLoading = loading;
    askButton.disabled = loading;
    questionInput.disabled = loading;
}

// === CHAT BUBBLE HELPERS ===

function appendUserBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user-bubble';
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    scrollToBottom();
}

function createAiBubble(wide) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai-bubble' + (wide ? ' wide' : '');
    chatMessages.appendChild(bubble);
    scrollToBottom();
    return bubble;
}

function showThinking(bubble) {
    bubble.innerHTML = `
        <div class="thinking-indicator">
            <div class="bouncing-balls">
                <div class="bouncing-balls__ball"></div>
                <div class="bouncing-balls__ball"></div>
                <div class="bouncing-balls__ball"></div>
            </div>
            <span>Thinking...</span>
        </div>
    `;
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// === MARKDOWN CONVERSION ===

function markdownToHtml(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-sm font-semibold hover:underline">$1 &rarr;</a>');
    return text;
}

// === TYPEWRITER EFFECT (HTML-safe) ===

function typewriterEffect(text, container) {
    let i = 0;
    const speed = 2;
    stopGenerationButton.classList.remove('hidden');

    function type() {
        if (i < text.length) {
            i++;
            // Apply markdown to the typed portion — incomplete **tags won't match regex, so no broken HTML
            container.innerHTML = markdownToHtml(text.slice(0, i));
            scrollToBottom();
            typewriterTimeoutId = setTimeout(type, speed);
        } else {
            container.innerHTML = markdownToHtml(text);
            stopGenerationButton.classList.add('hidden');
            typewriterTimeoutId = null;
        }
    }
    type();
}

// === DISPLAY FUNCTIONS ===

function displayAboutMe(text, bubble) {
    bubble.innerHTML = '';
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-start gap-3';

    const img = document.createElement('img');
    img.src = 'https://i.ibb.co/WvJ5C2Hn/Pass-Port-Size-Photo.png';
    img.alt = 'Girish Saana';
    img.className = 'w-16 h-16 rounded-full shadow-lg flex-shrink-0';

    const textContainer = document.createElement('div');
    textContainer.className = 'flex-1 min-w-0';

    flexContainer.appendChild(img);
    flexContainer.appendChild(textContainer);
    bubble.appendChild(flexContainer);
    typewriterEffect(text, textContainer);
}

function displayContactInfo(bubble) {
    bubble.innerHTML = `
        <p class="mb-3">I'd love to connect! You can reach me through any of the platforms below. I'm actively looking for new opportunities and typically respond within 24 hours.</p>
        <div class="flex justify-center space-x-6 mt-3">
            <a href="https://linkedin.com/in/girish-saana-443018306/" target="_blank" class="hover:text-blue-600 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd"/></svg>
            </a>
            <a href="https://github.com/girish2513" target="_blank" class="hover:text-gray-900 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/></svg>
            </a>
            <a href="mailto:girishsaana2513@gmail.com" class="hover:text-red-600 dark:hover:text-white transition transform hover:scale-125">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
            </a>
        </div>
    `;
    scrollToBottom();
}

function displaySkills(skillData, bubble) {
    bubble.innerHTML = '';
    const [intro, data] = skillData.split('::');

    if (intro && intro.trim()) {
        const introP = document.createElement('p');
        introP.className = 'mb-3';
        bubble.appendChild(introP);
        typewriterEffect(intro.trim(), introP);
    }

    const icons = {
        "Programming Languages": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>`,
        "Machine Learning": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v10.5A2.25 2.25 0 006.75 21z" /></svg>`,
        "Databases": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>`,
        "Tools": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.384 5.384a2.025 2.025 0 01-2.862-2.862l5.384-5.384m2.862 2.862L21 7.5m-9.58 7.67L21 7.5" /></svg>`,
        "Soft Skills": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>`
    };
    const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>`;

    if (data && data.trim()) {
        const categories = data.trim().split('|');
        categories.forEach(catString => {
            const nameIndex = catString.indexOf(':');
            if (nameIndex === -1) return;

            const categoryName = catString.substring(0, nameIndex).trim();
            const skillsString = catString.substring(nameIndex + 1);
            const formattedName = categoryName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'structured-category mb-3';

            const title = document.createElement('h3');
            title.innerHTML = `${icons[formattedName] || defaultIcon} ${formattedName}`;

            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'structured-tags';

            if (skillsString) {
                skillsString.split(',').forEach(candidate => {
                    const trimmed = candidate.trim();
                    if (!trimmed) return;
                    const tag = document.createElement('span');
                    tag.className = 'structured-tag';
                    tag.textContent = trimmed;
                    tagsDiv.appendChild(tag);
                });
            }

            categoryDiv.appendChild(title);
            if (tagsDiv.hasChildNodes()) {
                categoryDiv.appendChild(tagsDiv);
                bubble.appendChild(categoryDiv);
            }
        });
    }
    scrollToBottom();
}

function displayProjects(projectData, bubble) {
    bubble.innerHTML = '';
    const [intro] = projectData.split('::');

    if (intro && intro.trim()) {
        const introP = document.createElement('p');
        introP.className = 'mb-4';
        bubble.appendChild(introP);
        typewriterEffect(intro.trim(), introP);
    }

    const projectsGrid = document.createElement('div');
    projectsGrid.className = 'projects-grid';

    projectsData.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card glassmorphism rounded-2xl h-64 p-5 flex flex-col justify-end text-white shadow-lg';
        projectCard.style.backgroundImage = `url(${project.image})`;
        projectCard.onclick = () => openProjectModal(project);
        projectCard.innerHTML = `
            <div class="project-card-content">
                <div class="text-xs font-medium mb-1 opacity-90">${project.category}</div>
                <h3 class="text-lg font-bold">${project.name}</h3>
            </div>
        `;
        projectsGrid.appendChild(projectCard);
    });
    bubble.appendChild(projectsGrid);
    scrollToBottom();
}

// === MAIN QUERY HANDLER ===

async function handleQuery(question) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    questionInput.value = '';

    if (conversationCount === 0) {
        switchToChatView();
        // Small delay to let transition finish before showing messages
        await new Promise(r => setTimeout(r, 450));
    }
    conversationCount++;

    chatMessages.classList.remove('hidden');
    setLoading(true);

    // Show user bubble
    appendUserBubble(trimmedQuestion);

    // Create AI bubble with thinking indicator
    const lowerCaseQuestion = trimmedQuestion.toLowerCase();
    const needsWide = lowerCaseQuestion.includes('project') || lowerCaseQuestion.includes('skill') || lowerCaseQuestion.includes('tech');
    const aiBubble = createAiBubble(needsWide);
    showThinking(aiBubble);

    try {
        const apiUrl = 'https://ai-portfolio-fullstack.vercel.app/api/chat/';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: trimmedQuestion,
                history: conversationHistory
            })
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Could not parse error response.' }));
            throw new Error(errorBody.error || response.statusText);
        }

        const result = await response.json();
        aiBubble.innerHTML = '';

        if (result.reply) {
            const responseText = result.reply;

            conversationHistory.push({ role: 'user', content: trimmedQuestion });
            conversationHistory.push({ role: 'assistant', content: responseText });

            if (lowerCaseQuestion.includes('contact')) {
                displayContactInfo(aiBubble);
            } else if (responseText.includes('::') && lowerCaseQuestion.includes('project')) {
                aiBubble.classList.add('wide');
                displayProjects(responseText, aiBubble);
            } else if (responseText.includes('::') && (lowerCaseQuestion.includes('skill') || lowerCaseQuestion.includes('tech'))) {
                aiBubble.classList.add('wide');
                displaySkills(responseText, aiBubble);
            } else if (lowerCaseQuestion.includes('about yourself') || lowerCaseQuestion.includes('who are you')) {
                displayAboutMe(responseText, aiBubble);
            } else {
                typewriterEffect(responseText, aiBubble);
            }

            // CTA after 6th message
            if (conversationCount === 6) {
                setTimeout(() => {
                    const ctaBubble = createAiBubble(false);
                    typewriterEffect(
                        `By the way, it seems like you're interested in my profile! I'm currently looking for new opportunities. Feel free to reach out to me directly at ${contactData.email} if you'd like to connect.`,
                        ctaBubble
                    );
                }, 3000);
            }
        } else {
            aiBubble.textContent = result.error || "I'm sorry, an unknown error occurred.";
        }
    } catch (err) {
        console.error('Error:', err);
        aiBubble.innerHTML = '';
        aiBubble.textContent = 'An error occurred. Please try again in a moment.';
    } finally {
        setLoading(false);
        questionInput.focus();
    }
}

// === PROJECT MODAL ===

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
                ${project.highlights.map(h => `
                    <li class="flex items-start">
                        <svg class="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        ${h}
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4">Technologies Used</h3>
            <div class="flex flex-wrap gap-2">
                ${project.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
        </div>
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="text-lg"><strong>Impact:</strong> ${project.impact}</div>
            <a href="${project.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center">
                View Project
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
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

// === INIT ON DOM READY ===

document.addEventListener('DOMContentLoaded', () => {
    // Home button
    const homeAvatarButton = document.getElementById('home-avatar-button');
    if (homeAvatarButton) {
        homeAvatarButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // Modal listeners
    const closeModalBtn = document.getElementById('close-modal');
    const projectModal = document.getElementById('project-modal');
    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (projectModal) {
        projectModal.onclick = (e) => {
            if (e.target === projectModal) closeModal();
        };
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // === CANVAS BACKGROUND ANIMATIONS ===
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
        if (theme.mode === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        root.style.setProperty('--accent-color', theme.accent);
    }
    function clearAnimation() {
        if (currentAnimation.stop) currentAnimation.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function startRandomAnimation() {
        clearAnimation();
        const idx = Math.floor(Math.random() * animations.length);
        currentAnimation = animations[idx];
        applyTheme(currentAnimation.theme);
        currentAnimation.stop = currentAnimation.init(ctx, canvas);
    }

    function initDigitalRain(ctx, canvas) {
        const alphabet = 'アカサタナハマヤラワガザダバパイキシチニヒミリギジヂビピウクスツヌフムユルグズプエケセテネヘメレゲゼデベペオコソトノホモヨロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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
        let particles = [];
        class Particle {
            constructor(x, y, dx, dy, s) { this.x=x; this.y=y; this.dx=dx; this.dy=dy; this.s=s; }
            draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.s,0,Math.PI*2); ctx.fillStyle='rgba(200,200,200,0.2)'; ctx.fill(); }
            update() { if(this.x>canvas.width||this.x<0)this.dx=-this.dx; if(this.y>canvas.height||this.y<0)this.dy=-this.dy; this.x+=this.dx; this.y+=this.dy; this.draw(); }
        }
        let num = (canvas.height*canvas.width)/9000;
        for(let i=0;i<num;i++) { let s=(Math.random()*2)+1; particles.push(new Particle(Math.random()*(canvas.width-s*2)+s*2, Math.random()*(canvas.height-s*2)+s*2, (Math.random()*.4)-.2, (Math.random()*.4)-.2, s)); }
        function connect() { for(let a=0;a<particles.length;a++) for(let b=a;b<particles.length;b++) { let d=((particles[a].x-particles[b].x)**2)+((particles[a].y-particles[b].y)**2); if(d<(canvas.width/7)*(canvas.height/7)){ctx.strokeStyle='rgba(200,200,200,'+(1-d/20000)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(particles[a].x,particles[a].y);ctx.lineTo(particles[b].x,particles[b].y);ctx.stroke();}}}
        function animate() { animationFrameId=requestAnimationFrame(animate); ctx.clearRect(0,0,canvas.width,canvas.height); for(let i=0;i<particles.length;i++)particles[i].update(); connect(); }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }

    function initWaves(ctx, canvas) {
        let time = 0;
        function drawWave(freq,amp,speed,c1,c2) { ctx.beginPath(); ctx.moveTo(0,canvas.height); for(let x=0;x<canvas.width;x++){ctx.lineTo(x,Math.sin(x*freq+time*speed)*amp+canvas.height/2);} ctx.lineTo(canvas.width,canvas.height); ctx.closePath(); const g=ctx.createLinearGradient(0,0,canvas.width,0); g.addColorStop(0,`rgba(${c1.r},${c1.g},${c1.b},0.3)`); g.addColorStop(1,`rgba(${c2.r},${c2.g},${c2.b},0.3)`); ctx.fillStyle=g; ctx.fill(); }
        function animate() { animationFrameId=requestAnimationFrame(animate); ctx.clearRect(0,0,canvas.width,canvas.height); time+=0.02; drawWave(0.002,100,0.5,{r:231,g:60,b:126},{r:35,g:166,b:213}); drawWave(0.003,120,0.3,{r:35,g:166,b:213},{r:231,g:60,b:126}); }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }

    function initShapes(ctx, canvas) {
        let shapes = [];
        for(let i=0;i<10;i++) shapes.push({x:Math.random()*canvas.width,y:canvas.height+Math.random()*100,w:Math.random()*100+20,h:Math.random()*100+20,speed:Math.random()*2+0.5,rot:Math.random()*360,color:`rgba(${Math.random()>0.5?'59,130,246':'139,92,246'},0.15)`});
        function animate() { animationFrameId=requestAnimationFrame(animate); ctx.clearRect(0,0,canvas.width,canvas.height); shapes.forEach(s=>{s.y-=s.speed;s.rot+=s.speed/20;if(s.y<-s.h){s.y=canvas.height+s.h;s.x=Math.random()*canvas.width;} ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.fillStyle=s.color;ctx.fillRect(-s.w/2,-s.h/2,s.w,s.h);ctx.restore();}); }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }

    function initStarfield(ctx, canvas) {
        let stars = [];
        for(let i=0;i<500;i++) stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.5,vx:(Math.random()-0.5)/2,vy:(Math.random()-0.5)/2});
        function animate() { animationFrameId=requestAnimationFrame(animate); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='rgba(255,255,255,0.5)'; stars.forEach(s=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();s.x+=s.vx;s.y+=s.vy;if(s.x<0||s.x>canvas.width)s.x=Math.random()*canvas.width;if(s.y<0||s.y>canvas.height)s.y=Math.random()*canvas.height;}); }
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }

    setupCanvas();
    startRandomAnimation();
    window.addEventListener('resize', () => { setupCanvas(); startRandomAnimation(); });
});
