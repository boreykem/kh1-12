// Elements
const appDiv = document.getElementById('app');
const gradeSelect = document.getElementById('grade-select');
const parentToggleBtn = document.getElementById('parent-toggle-btn');
const studentView = document.getElementById('student-view');
const parentView = document.getElementById('parent-view');
const heroSubtext = document.getElementById('hero-subtext');
const mathTopic = document.getElementById('math-topic');
const scienceTopic = document.getElementById('science-topic');

// State
let isParentMode = false;
let currentCorrectAnswer = 0;
let userProfile = { xp: 0, streak: 0, grade: 4 };

// Fetch User Data from Server
async function loadUserData() {
    try {
        const res = await fetch('/api/user/mock');
        const data = await res.json();
        if (data && data.xp !== undefined) {
            userProfile = data;
            // Update UI
            document.querySelector('.pill:nth-child(1)').innerHTML = `<i class="fa-solid fa-star text-yellow"></i> ${data.xp} XP`;
            document.querySelector('.pill:nth-child(2)').innerHTML = `<i class="fa-solid fa-fire text-orange"></i> ${data.streak} Day Streak`;
            // Set grade dropdown
            gradeSelect.value = data.grade;
            updateTopicsForGrade(data.grade);
        }
    } catch (err) {
        console.error('Failed to load user data:', err);
    }
}

// Grade change handler (Theme switching & Content mapping)
gradeSelect.addEventListener('change', (e) => {
    const grade = parseInt(e.target.value);
    
    // Switch Theme
    if (grade >= 7) {
        appDiv.classList.remove('junior-theme');
        appDiv.classList.add('senior-theme');
        heroSubtext.innerText = `Preparing for success in Grade ${grade}. Stay focused!`;
    } else {
        appDiv.classList.remove('senior-theme');
        appDiv.classList.add('junior-theme');
        heroSubtext.innerText = "Ready for today's Math and Science challenges?";
    }

    // Update Topics based on Grade level (Simulated content changes)
    updateTopicsForGrade(grade);
});

function updateTopicsForGrade(grade) {
    if (grade <= 3) {
        mathTopic.innerText = "Addition & Subtraction (បូកនិងដក)";
        scienceTopic.innerText = "Animals & Habitats (សត្វនិងជម្រក)";
    } else if (grade <= 6) {
        mathTopic.innerText = "Fractions & Decimals (ប្រភាគ និងទសភាគ)";
        scienceTopic.innerText = "Plant Lifecycle (វដ្តជីវិតរបស់រុក្ខជាតិ)";
    } else if (grade <= 9) {
        mathTopic.innerText = "Algebra Fundamentals (ពីជគណិតមូលដ្ឋាន)";
        scienceTopic.innerText = "Basic Physics (រូបវិទ្យាមូលដ្ឋាន)";
    } else {
        mathTopic.innerText = "Calculus & Trigonometry (គណិតវិទ្យាវិភាគ)";
        scienceTopic.innerText = "Chemistry Reactions (ប្រតិកម្មគីមី)";
    }
}

// Parent Mode Toggle
parentToggleBtn.addEventListener('click', () => {
    isParentMode = !isParentMode;
    if (isParentMode) {
        studentView.classList.add('hidden');
        parentView.classList.remove('hidden');
        parentToggleBtn.innerHTML = '<i class="fa-solid fa-graduation-cap"></i> Student Mode';
        parentToggleBtn.classList.add('btn-primary');
        parentToggleBtn.classList.remove('btn-outline');
    } else {
        parentView.classList.add('hidden');
        studentView.classList.remove('hidden');
        parentToggleBtn.innerHTML = '<i class="fa-solid fa-users"></i> Parent Mode';
        parentToggleBtn.classList.remove('btn-primary');
        parentToggleBtn.classList.add('btn-outline');
    }
});

// Math Game Logic
function openMathGame() {
    document.getElementById('math-game-overlay').classList.remove('hidden');
    generateMathProblem();
}

function closeMathGame() {
    document.getElementById('math-game-overlay').classList.add('hidden');
    document.getElementById('feedback-msg').innerText = '';
}

function generateMathProblem() {
    // Generate simple addition problem based on current grade complexity
    const grade = parseInt(gradeSelect.value);
    const maxNum = grade >= 7 ? 50 : 10;
    
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;
    currentCorrectAnswer = num1 + num2;

    document.getElementById('num1').innerText = num1;
    document.getElementById('num2').innerText = num2;

    // Generate options
    const options = [currentCorrectAnswer];
    while(options.length < 4) {
        const offset = Math.floor(Math.random() * 5) + 1;
        const fakeAnswer = Math.random() > 0.5 ? currentCorrectAnswer + offset : currentCorrectAnswer - offset;
        if (!options.includes(fakeAnswer) && fakeAnswer > 0) {
            options.push(fakeAnswer);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Render options
    const buttons = document.querySelectorAll('.game-option');
    buttons.forEach((btn, index) => {
        btn.innerText = options[index];
        btn.setAttribute('onclick', `checkAnswer(${options[index]})`);
        // Reset colors
        btn.style.background = 'var(--primary-color)';
    });

    document.getElementById('feedback-msg').innerText = '';
}

function checkAnswer(selected) {
    const feedback = document.getElementById('feedback-msg');
    const buttons = document.querySelectorAll('.game-option');
    
    if (selected === currentCorrectAnswer) {
        feedback.innerText = 'Correct! 🎉 ល្អណាស់!';
        feedback.className = 'feedback correct';
        // Highlight correct button
        buttons.forEach(btn => {
            if (parseInt(btn.innerText) === currentCorrectAnswer) {
                btn.style.background = '#10b981'; // green
            }
        });
        
        // Save XP to server
        fetch('/api/progress/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xpEarned: 10 })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                document.querySelector('.pill:nth-child(1)').innerHTML = `<i class="fa-solid fa-star text-yellow"></i> ${data.newTotalXp} XP`;
            }
        });

        setTimeout(() => {
            generateMathProblem();
        }, 1500);
    } else {
        feedback.innerText = 'Try again! ព្យាយាមម្តងទៀត';
        feedback.className = 'feedback wrong';
        
        buttons.forEach(btn => {
            if (parseInt(btn.innerText) === selected) {
                btn.style.background = '#ef4444'; // red
            }
        });
    }
}

// Initial setup
loadUserData();
