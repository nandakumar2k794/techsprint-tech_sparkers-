// ==========================================
// Application Logic
// ==========================================

// Event Listener Initialization
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Auth Handling (Mock)
function handleLogin(e) {
    e.preventDefault();
    const loader = document.getElementById('loginLoader');
    if (loader) loader.style.display = 'inline-block';

    // Simulate network delay
    setTimeout(() => {
        window.location.href = 'main.html';
    }, 1000);
}

function handleLogout() {
    window.location.href = 'index.html';
}

// Job Search Logic
async function searchJobs() {
    const domain = document.getElementById('jobDomain').value;
    const location = document.getElementById('jobLocation').value;
    const loader = document.getElementById('searchLoader');
    const resultsContainer = document.getElementById('jobResults');

    if (!domain || !location) {
        alert('Please enter both domain and location');
        return;
    }

    loader.style.display = 'inline-block';
    resultsContainer.innerHTML = '';

    // Simulate API fetch with realistic mock data
    setTimeout(() => {
        const jobs = generateMockJobs(domain, location);
        renderJobs(jobs);
        loader.style.display = 'none';
    }, 1000);
}

function generateMockJobs(domain, location) {
    // Generate realistic looking job data based on input
    const companies = ['TechCorp', 'InnovateX', 'Global Systems', 'Future Net', 'Cloud Nine', 'StartUp Inc'];
    const types = ['Full-time', 'Remote', 'Contract'];
    const titles = [
        `Senior ${domain}`,
        `Junior ${domain}`,
        `${domain} Lead`,
        `${domain} Engineer`,
        `Head of ${domain}`
    ];

    return Array.from({ length: 9 }).map((_, i) => ({
        title: titles[Math.floor(Math.random() * titles.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        location: location,
        type: types[Math.floor(Math.random() * types.length)],
        description: `We are looking for a talented ${domain} to join our team. You will be responsible for developing high-quality solutions...`,
        salary: `$${Math.floor(Math.random() * 50 + 70)}k - $${Math.floor(Math.random() * 50 + 120)}k`
    }));
}

function renderJobs(jobs) {
    const container = document.getElementById('jobResults');

    if (jobs.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No jobs found. Try different keywords.</p>';
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <h3 class="job-title">${job.title}</h3>
            <div class="job-company">${job.company} • ${job.type}</div>
            <div class="job-details">
                📍 ${job.location}<br>
                💰 ${job.salary}
            </div>
            <p style="margin-bottom: 1rem; color: #cbd5e1; font-size: 0.9rem">${job.description}</p>
            <button class="btn" style="width: 100%; padding: 0.5rem;">Apply Now</button>
        `;
        container.appendChild(card);
    });
}

// Resume Generator Logic using Gemini
async function generateResume() {
    // Check if ENV is loaded
    if (typeof ENV === 'undefined' || !ENV.GEMINI_API_KEY) {
        alert('Configuration Error: ENV.GEMINI_API_KEY not found. Please ensure env.js is loaded.');
        return;
    }

    const key = ENV.GEMINI_API_KEY;

    if (!key) {
        alert('Please configure the GEMINI_API_KEY in env.js');
        return;
    }

    const fullName = document.getElementById('fullName').value;
    const currentRole = document.getElementById('currentRole').value;
    const skills = document.getElementById('skills').value;
    const experience = document.getElementById('experience').value;

    if (!fullName || !currentRole) {
        alert('Please fill in at least Name and Role');
        return;
    }

    const loader = document.getElementById('resumeLoader');
    const output = document.getElementById('resumeOutput');

    loader.style.display = 'inline-block';

    const prompt = `Create a professional ATS-friendly resume in Markdown format for:
    Name: ${fullName}
    Current Role: ${currentRole}
    Skills: ${skills}
    Experience Summary: ${experience}
    
    Please structure it with sections: Professional Summary, Work Experience, Skills, and Education (placeholder). Make it sound professional and sleek.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const rawText = data.candidates[0].content.parts[0].text;

        // Parse Markdown (using marked.js included in HTML)
        output.innerHTML = marked.parse(rawText);

    } catch (error) {
        console.error('Error:', error);

        // Handle Rate Limiting Specifically
        if (error.message.includes('Quota') || error.message.includes('429')) {
            output.innerHTML = `
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
                    <h3 style="color: #f59e0b; margin-bottom: 0.5rem;">⚠️ High Traffic (Rate Limit)</h3>
                    <p style="color: #cbd5e1; margin-bottom: 1rem;">
                        You have hit the free Usage Limit for the API. 
                        Google requires a cool-down period.
                    </p>
                    <p style="color: #fff; font-weight: bold;">Please wait approx 60 seconds and try again.</p>
                </div>
            `;
        } else {
            output.innerHTML = `<div style="color: #ef4444;">Error generating resume: ${error.message}. <br><br>Please check your API key/Internet and try again.</div>`;
        }
    } finally {
        loader.style.display = 'none';
    }
}
