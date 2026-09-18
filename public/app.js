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

// --- Learning Map Logic ---
function openLearningMap(subject) {
    document.getElementById('learning-map-overlay').classList.remove('hidden');
    renderLearningMap(subject);
}

function closeLearningMap() {
    document.getElementById('learning-map-overlay').classList.add('hidden');
}

let currentCurriculumDB = null;
let currentActiveSubject = 'math';
let currentActiveGradeKey = 'grade_1';
let currentActiveLessonIndex = 0;
let currentLessonTitle = '';

let quizState = {
    currentQuestion: 1,
    totalQuestions: 5,
    timer: 30,
    timerInterval: null
};

async function renderLearningMap(subject) {
    currentActiveSubject = subject || 'math';
    const container = document.getElementById('map-nodes-container');
    container.innerHTML = '<div class="path-line"></div>';

    const grade = parseInt(document.getElementById('grade-select').value) || 1;
    currentActiveGradeKey = `grade_${grade}`;
    
    // Default fallback nodes
    let nodes = [
        { title: 'ហ្គេមគណិតវិទ្យា', icon: 'fa-calculator', color: '#3b82f6', locked: false, gameId: 'math_basic' }
    ];

    try {
        if (!currentCurriculumDB) {
            const res = await fetch('/curriculum.json?v=' + Date.now());
            currentCurriculumDB = await res.json();
        }
        
        if (currentCurriculumDB[currentActiveGradeKey] && currentCurriculumDB[currentActiveGradeKey][subject]) {
            nodes = currentCurriculumDB[currentActiveGradeKey][subject];
        }
    } catch (err) {
        console.error('Failed to load curriculum DB', err);
    }

    nodes.forEach((node, index) => {
        // Offset nodes left/right to create a winding path
        const offset = index % 2 === 0 ? '-30px' : '30px';
        const lockedClass = node.locked ? 'node-locked' : '';
        const lockIcon = node.locked ? '<div style="position:absolute; top:-5px; right:-5px; background:white; color:black; border-radius:50%; width:20px; height:20px; display:flex; justify-content:center; align-items:center; font-size:10px;"><i class="fa-solid fa-lock"></i></div>' : '';

        // Determine click action
        let action = '';
        if (node.locked) {
            action = `alert('🔒 វគ្គនេះជាប់សោរ (Locked)! សូមបញ្ចប់មេរៀនមុនៗជាមុនសិន។')`;
        } else if (node.gameId === 'algebra_balance') {
            action = `openAlgebraGame()`;
        } else {
            action = `openMathGame('${node.id}', '${node.title.replace(/'/g, "\\'")}', ${index})`;
        }

        const nodeHTML = `
            <div class="map-node ${lockedClass}" style="transform: translateX(${offset})" onclick="${action}">
                <div class="node-circle" style="background: ${node.color};">
                    <i class="fa-solid ${node.icon}"></i>
                    ${lockIcon}
                </div>
                <div class="node-label khmer-text">${node.title}</div>
            </div>
        `;
        container.innerHTML += nodeHTML;
    });
}

// --- Math Game (Multiple Choice) Logic ---
function openMathGame(lessonId, lessonTitle, lessonIndex) {
    currentActiveLessonIndex = lessonIndex !== undefined ? lessonIndex : 0;
    currentLessonTitle = lessonTitle || 'លំហាត់អនុវត្តន៍';
    
    quizState.currentQuestion = 1;
    quizState.totalQuestions = 5;

    // Switch views: show active quiz, hide victory screen
    document.getElementById('quiz-active-view').classList.remove('hidden');
    document.getElementById('quiz-victory-view').classList.add('hidden');
    document.getElementById('math-game-overlay').classList.remove('hidden');

    const titleElem = document.getElementById('quiz-lesson-title');
    if (titleElem) titleElem.innerText = currentLessonTitle;

    startQuizTimer();
    updateQuizProgress();
    generateMathProblem();
}

function closeMathGame() {
    clearInterval(quizState.timerInterval);
    document.getElementById('math-game-overlay').classList.add('hidden');
    document.getElementById('feedback-msg').innerText = '';
}

function startQuizTimer() {
    clearInterval(quizState.timerInterval);
    quizState.timer = 30;
    const timerElem = document.getElementById('quiz-timer');
    if (timerElem) timerElem.innerText = '00:30';

    quizState.timerInterval = setInterval(() => {
        quizState.timer--;
        const formatted = quizState.timer < 10 ? `00:0${quizState.timer}` : `00:${quizState.timer}`;
        if (timerElem) timerElem.innerText = formatted;

        if (quizState.timer <= 0) {
            clearInterval(quizState.timerInterval);
            const feedback = document.getElementById('feedback-msg');
            if (feedback) {
                feedback.innerText = '⏰ អស់ពេលហើយ! សាកល្បងសំណួរថ្មី';
                feedback.className = 'feedback wrong';
            }
            setTimeout(() => {
                startQuizTimer();
                generateMathProblem();
            }, 1500);
        }
    }, 1000);
}

function updateQuizProgress() {
    const progressFill = document.getElementById('quiz-progress-fill');
    const counterElem = document.getElementById('quiz-counter');
    
    const pct = Math.round((quizState.currentQuestion / quizState.totalQuestions) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (counterElem) counterElem.innerHTML = `<i class="fa-solid fa-list-check"></i> សំណួរទី <b>${quizState.currentQuestion}/${quizState.totalQuestions}</b>`;
}

function generateMathProblem() {
    const grade = parseInt(document.getElementById('grade-select').value) || 1;
    
    // Adapt numbers based on Grade
    let num1, num2, operation = '+';
    if (grade === 1) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        currentCorrectAnswer = num1 + num2;
    } else if (grade <= 3) {
        const ops = ['+', '-', '×'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        if (operation === '+') {
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * 50) + 10;
            currentCorrectAnswer = num1 + num2;
        } else if (operation === '-') {
            num1 = Math.floor(Math.random() * 50) + 20;
            num2 = Math.floor(Math.random() * 20) + 1;
            currentCorrectAnswer = num1 - num2;
        } else {
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            currentCorrectAnswer = num1 * num2;
        }
    } else if (grade <= 6) {
        const ops = ['+', '-', '×', '÷'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        if (operation === '÷') {
            num2 = Math.floor(Math.random() * 9) + 2;
            currentCorrectAnswer = Math.floor(Math.random() * 12) + 2;
            num1 = num2 * currentCorrectAnswer;
        } else if (operation === '×') {
            num1 = Math.floor(Math.random() * 15) + 3;
            num2 = Math.floor(Math.random() * 12) + 2;
            currentCorrectAnswer = num1 * num2;
        } else {
            num1 = Math.floor(Math.random() * 200) + 50;
            num2 = Math.floor(Math.random() * 100) + 10;
            currentCorrectAnswer = operation === '+' ? num1 + num2 : num1 - num2;
        }
    } else {
        // High School Algebra/Math
        const ops = ['+', '-', '×'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 30) + 5;
        currentCorrectAnswer = operation === '+' ? num1 + num2 : (operation === '-' ? num1 - num2 : num1 * num2);
    }

    const eqElem = document.getElementById('game-equation');
    if (eqElem) {
        eqElem.innerHTML = `<span>${num1}</span> ${operation} <span>${num2}</span> = ?`;
    }

    // Generate options
    const options = [currentCorrectAnswer];
    while (options.length < 4) {
        const offset = Math.floor(Math.random() * 6) + 1;
        const fakeAnswer = Math.random() > 0.5 ? currentCorrectAnswer + offset : currentCorrectAnswer - offset;
        if (!options.includes(fakeAnswer)) {
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
        btn.style.background = 'var(--primary-color)';
    });

    document.getElementById('feedback-msg').innerText = '';
}

function checkAnswer(selected) {
    const feedback = document.getElementById('feedback-msg');
    const buttons = document.querySelectorAll('.game-option');
    
    if (selected === currentCorrectAnswer) {
        feedback.innerText = 'Correct! 🎉 ត្រឹមត្រូវល្អណាស់!';
        feedback.className = 'feedback correct';
        
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
                const xpPill = document.querySelector('.pill:nth-child(1)');
                if (xpPill) xpPill.innerHTML = `<i class="fa-solid fa-star text-yellow"></i> ${data.newTotalXp} XP`;
            }
        });

        setTimeout(() => {
            if (quizState.currentQuestion < quizState.totalQuestions) {
                quizState.currentQuestion++;
                updateQuizProgress();
                startQuizTimer();
                generateMathProblem();
            } else {
                // Completed all questions in the lesson!
                showLessonVictory();
            }
        }, 1200);
    } else {
        feedback.innerText = 'Try again! មិនទាន់ត្រឹមត្រូវទេ ព្យាយាមម្តងទៀត';
        feedback.className = 'feedback wrong';
        
        buttons.forEach(btn => {
            if (parseInt(btn.innerText) === selected) {
                btn.style.background = '#ef4444'; // red
            }
        });
    }
}

function showLessonVictory() {
    clearInterval(quizState.timerInterval);
    document.getElementById('quiz-active-view').classList.add('hidden');
    document.getElementById('quiz-victory-view').classList.remove('hidden');

    const victorySubtitle = document.getElementById('victory-lesson-name');
    if (victorySubtitle) {
        victorySubtitle.innerText = `អ្នកបានបញ្ចប់ «${currentLessonTitle}» ដោយជោគជ័យ!`;
    }

    // Unlock next node in current grade curriculum
    if (currentCurriculumDB && currentCurriculumDB[currentActiveGradeKey] && currentCurriculumDB[currentActiveGradeKey][currentActiveSubject]) {
        const lessons = currentCurriculumDB[currentActiveGradeKey][currentActiveSubject];
        const nextIndex = currentActiveLessonIndex + 1;
        if (nextIndex < lessons.length) {
            lessons[nextIndex].locked = false;
        }
    }
}

function finishLessonAndUnlockNext() {
    closeMathGame();
    // Re-render map to show newly unlocked node
    renderLearningMap(currentActiveSubject);
}

// --- Algebra Balance Game Logic ---
let algebraState = {
    leftX: 2,
    leftUnits: 4,
    rightUnits: 10,
    targetXValue: 3
};

function generateAlgebraProblem() {
    // Generate a problem of form: aX + b = c
    // Ensure 'a' is between 1 and 4, 'b' is between 1 and 8, and 'x' is between 1 and 5
    const a = Math.floor(Math.random() * 3) + 2; // 2 to 4
    const x = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const b = Math.floor(Math.random() * 6) + 1; // 1 to 6
    const c = (a * x) + b;
    
    algebraState = {
        leftX: a,
        leftUnits: b,
        rightUnits: c,
        targetXValue: x
    };
    
    document.getElementById('algebra-feedback').innerText = '';
    renderAlgebraScale();
}

function openAlgebraGame() {
    document.getElementById('algebra-game-overlay').classList.remove('hidden');
    generateAlgebraProblem();
}

function closeAlgebraGame() {
    document.getElementById('algebra-game-overlay').classList.add('hidden');
}

function resetAlgebraGame() {
    generateAlgebraProblem();
}

function renderAlgebraScale() {
    // Render Blocks
    const leftPlate = document.getElementById('left-plate');
    const rightPlate = document.getElementById('right-plate');
    
    leftPlate.innerHTML = '';
    rightPlate.innerHTML = '';

    for (let i = 0; i < algebraState.leftX; i++) {
        leftPlate.innerHTML += `<div class="block-x">X</div>`;
    }
    for (let i = 0; i < algebraState.leftUnits; i++) {
        leftPlate.innerHTML += `<div class="block-1">1</div>`;
    }
    for (let i = 0; i < algebraState.rightUnits; i++) {
        rightPlate.innerHTML += `<div class="block-1">1</div>`;
    }

    // Update Equation Text
    let leftText = '';
    if (algebraState.leftX > 0) leftText += `${algebraState.leftX}x`;
    if (algebraState.leftX > 0 && algebraState.leftUnits > 0) leftText += ' + ';
    if (algebraState.leftUnits > 0) leftText += algebraState.leftUnits;
    if (algebraState.leftX === 0 && algebraState.leftUnits === 0) leftText = '0';
    
    document.getElementById('algebra-equation').innerText = `${leftText} = ${algebraState.rightUnits}`;

    // Balance Visual (Tilt)
    const trueXWeight = 3; // Visual constant
    const leftWeight = (algebraState.leftX * algebraState.targetXValue) + algebraState.leftUnits;
    const rightWeight = algebraState.rightUnits;
    
    const diff = leftWeight - rightWeight;
    const tiltAngle = Math.max(Math.min(diff * -2, 20), -20);
    
    document.getElementById('scale-beam').style.transform = `translateX(-50%) rotate(${tiltAngle}deg)`;
    
    // Pan Heights
    const offset = tiltAngle * 2;
    document.querySelector('.left-pan').style.bottom = `${40 - offset}px`;
    document.querySelector('.right-pan').style.bottom = `${40 + offset}px`;

    // Dynamic Action Buttons
    const actionButtonsDiv = document.querySelector('#algebra-game-overlay .action-buttons');
    if (!actionButtonsDiv) return;

    // Check Win State
    if (algebraState.leftX === 1 && algebraState.leftUnits === 0 && algebraState.rightUnits === algebraState.targetXValue) {
        document.getElementById('algebra-feedback').innerText = `Perfect! 🎉 X = ${algebraState.targetXValue} (អស្ចារ្យណាស់!)`;
        document.getElementById('algebra-feedback').className = 'feedback correct';
        
        actionButtonsDiv.innerHTML = `<button class="btn btn-primary khmer-text" style="background: #10b981;" onclick="generateAlgebraProblem()">លេងវគ្គបន្ទាប់ (Next Level)</button>`;

        // Save XP
        fetch('/api/progress/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xpEarned: 25 })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                document.querySelector('.pill:nth-child(1)').innerHTML = `<i class="fa-solid fa-star text-yellow"></i> ${data.newTotalXp} XP`;
            }
        });
        return;
    }

    // Normal play state buttons
    let divideNum = algebraState.leftX > 1 ? algebraState.leftX : 2;
    actionButtonsDiv.innerHTML = `
        <button class="btn btn-primary khmer-text" onclick="algebraAction('subtract', 1)">ដក ១ ចេញពីសងខាង</button>
        <button class="btn btn-primary khmer-text" onclick="algebraAction('divide', ${divideNum})">ចែកនឹង ${divideNum} ទាំងសងខាង</button>
    `;
}

function algebraAction(action, amount) {
    if (action === 'subtract') {
        if (algebraState.leftUnits >= amount && algebraState.rightUnits >= amount) {
            algebraState.leftUnits -= amount;
            algebraState.rightUnits -= amount;
        } else {
            document.getElementById('algebra-feedback').innerText = 'Cannot subtract! មិនអាចដកបានទេ!';
            document.getElementById('algebra-feedback').className = 'feedback wrong';
            return;
        }
    } else if (action === 'divide') {
        if (algebraState.leftX % amount === 0 && algebraState.leftUnits % amount === 0 && algebraState.rightUnits % amount === 0) {
            if(algebraState.leftX > 0) algebraState.leftX /= amount;
            if(algebraState.leftUnits > 0) algebraState.leftUnits /= amount;
            if(algebraState.rightUnits > 0) algebraState.rightUnits /= amount;
        } else {
            document.getElementById('algebra-feedback').innerText = 'Cannot divide evenly! មិនអាចចែកដាច់ទេ!';
            document.getElementById('algebra-feedback').className = 'feedback wrong';
            return;
        }
    }
    document.getElementById('algebra-feedback').innerText = '';
    renderAlgebraScale();
}


// Initial setup
loadUserData();
