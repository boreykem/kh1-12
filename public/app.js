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
    firstTryCorrect: 0,
    wrongAttempts: 0,
    totalAttempts: 0,
    currentQuestionHasError: false,
    earnedXp: 0,
    isProcessingAnswer: false,
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
    quizState.firstTryCorrect = 0;
    quizState.wrongAttempts = 0;
    quizState.totalAttempts = 0;
    quizState.currentQuestionHasError = false;
    quizState.earnedXp = 0;
    quizState.isProcessingAnswer = false;

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
            if (quizState.isProcessingAnswer) return;
            quizState.isProcessingAnswer = true;
            quizState.wrongAttempts++;

            const feedback = document.getElementById('feedback-msg');
            if (feedback) {
                feedback.innerHTML = `⏰ <b>អស់ពេលហើយ!</b> ចម្លើយត្រឹមត្រូវគឺ <b>${currentCorrectAnswer}</b> (+0 XP)`;
                feedback.className = 'feedback wrong';
            }

            // Reveal correct answer and disable buttons
            const buttons = document.querySelectorAll('.game-option');
            buttons.forEach(btn => {
                if (parseInt(btn.innerText) === currentCorrectAnswer) {
                    btn.style.background = '#10b981'; // highlight correct
                }
                btn.disabled = true;
            });

            setTimeout(() => {
                if (quizState.currentQuestion < quizState.totalQuestions) {
                    quizState.currentQuestion++;
                    updateQuizProgress();
                    startQuizTimer();
                    generateMathProblem();
                } else {
                    showLessonVictory();
                }
            }, 1800);
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
    quizState.currentQuestionHasError = false;
    quizState.isProcessingAnswer = false;

    const grade = parseInt(document.getElementById('grade-select').value) || 1;
    const title = currentLessonTitle || '';
    
    // Adapt operation based on lesson topic
    let num1 = 10, num2 = 5, operation = '+';

    if (title.includes('ចែក')) {
        operation = '÷';
        if (grade <= 3) {
            num2 = Math.floor(Math.random() * 8) + 2;
            currentCorrectAnswer = Math.floor(Math.random() * 9) + 1;
            num1 = num2 * currentCorrectAnswer;
        } else if (grade <= 6) {
            num2 = Math.floor(Math.random() * 12) + 2;
            currentCorrectAnswer = Math.floor(Math.random() * 20) + 5;
            num1 = num2 * currentCorrectAnswer;
        } else {
            num2 = Math.floor(Math.random() * 20) + 3;
            currentCorrectAnswer = Math.floor(Math.random() * 30) + 10;
            num1 = num2 * currentCorrectAnswer;
        }
    } else if (title.includes('គុណ')) {
        operation = '×';
        if (grade <= 2) {
            num1 = Math.floor(Math.random() * 5) + 2;
            num2 = Math.floor(Math.random() * 9) + 1;
        } else if (grade <= 6) {
            num1 = Math.floor(Math.random() * 12) + 3;
            num2 = Math.floor(Math.random() * 12) + 2;
        } else {
            num1 = Math.floor(Math.random() * 20) + 5;
            num2 = Math.floor(Math.random() * 15) + 3;
        }
        currentCorrectAnswer = num1 * num2;
    } else if (title.includes('ដក')) {
        operation = '-';
        if (grade === 1) {
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        } else if (grade <= 3) {
            num1 = Math.floor(Math.random() * 60) + 20;
            num2 = Math.floor(Math.random() * (num1 - 10)) + 5;
        } else {
            num1 = Math.floor(Math.random() * 200) + 50;
            num2 = Math.floor(Math.random() * (num1 - 30)) + 15;
        }
        currentCorrectAnswer = num1 - num2;
    } else if (title.includes('បូក') || title.includes('ចំនួន')) {
        operation = '+';
        if (grade === 1) {
            num1 = Math.floor(Math.random() * 9) + 1;
            num2 = Math.floor(Math.random() * 9) + 1;
        } else if (grade <= 3) {
            num1 = Math.floor(Math.random() * 40) + 10;
            num2 = Math.floor(Math.random() * 40) + 10;
        } else {
            num1 = Math.floor(Math.random() * 150) + 50;
            num2 = Math.floor(Math.random() * 150) + 50;
        }
        currentCorrectAnswer = num1 + num2;
    } else {
        // Default general arithmetic
        const ops = grade <= 2 ? ['+', '-'] : ['+', '-', '×', '÷'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        if (operation === '÷') {
            num2 = Math.floor(Math.random() * 9) + 2;
            currentCorrectAnswer = Math.floor(Math.random() * 10) + 2;
            num1 = num2 * currentCorrectAnswer;
        } else if (operation === '×') {
            num1 = Math.floor(Math.random() * 10) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            currentCorrectAnswer = num1 * num2;
        } else if (operation === '-') {
            num1 = Math.floor(Math.random() * 50) + 20;
            num2 = Math.floor(Math.random() * 20) + 1;
            currentCorrectAnswer = num1 - num2;
        } else {
            num1 = Math.floor(Math.random() * 30) + 5;
            num2 = Math.floor(Math.random() * 30) + 5;
            currentCorrectAnswer = num1 + num2;
        }
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
        if (!options.includes(fakeAnswer) && (grade >= 7 || fakeAnswer >= 0)) {
            options.push(fakeAnswer);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Render options
    const buttons = document.querySelectorAll('.game-option');
    buttons.forEach((btn, index) => {
        btn.innerText = options[index];
        btn.onclick = () => checkAnswer(options[index]);
        btn.style.background = 'var(--primary-color)';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.disabled = false;
    });

    document.getElementById('feedback-msg').innerText = '';
}

function checkAnswer(selected) {
    if (quizState.isProcessingAnswer) return;
    quizState.isProcessingAnswer = true;
    clearInterval(quizState.timerInterval);

    quizState.totalAttempts++;
    const feedback = document.getElementById('feedback-msg');
    const buttons = document.querySelectorAll('.game-option');
    
    // Disable all buttons immediately so no extra clicks are allowed
    buttons.forEach(btn => btn.disabled = true);

    if (selected === currentCorrectAnswer) {
        // Correct on first try!
        quizState.firstTryCorrect++;
        quizState.earnedXp += 10;

        feedback.innerHTML = '🎉 <b>ត្រឹមត្រូវល្អណាស់!</b> (+10 XP)';
        feedback.className = 'feedback correct';
        
        buttons.forEach(btn => {
            if (parseInt(btn.innerText) === currentCorrectAnswer) {
                btn.style.background = '#10b981'; // green
            }
        });

        setTimeout(() => {
            if (quizState.currentQuestion < quizState.totalQuestions) {
                quizState.currentQuestion++;
                updateQuizProgress();
                startQuizTimer();
                generateMathProblem();
            } else {
                showLessonVictory();
            }
        }, 1200);
    } else {
        // Wrong answer: mark as wrong, reveal correct answer, give 0 XP, then advance!
        quizState.wrongAttempts++;
        quizState.currentQuestionHasError = true;

        feedback.innerHTML = `❌ <b>មិនត្រឹមត្រូវទេ!</b> ចម្លើយត្រឹមត្រូវគឺ <b>${currentCorrectAnswer}</b> (+0 XP)`;
        feedback.className = 'feedback wrong';
        
        buttons.forEach(btn => {
            const val = parseInt(btn.innerText);
            if (val === selected) {
                btn.style.background = '#ef4444'; // Red for user's wrong choice
            } else if (val === currentCorrectAnswer) {
                btn.style.background = '#10b981'; // Green to reveal the correct answer!
            }
        });

        setTimeout(() => {
            if (quizState.currentQuestion < quizState.totalQuestions) {
                quizState.currentQuestion++;
                updateQuizProgress();
                startQuizTimer();
                generateMathProblem();
            } else {
                showLessonVictory();
            }
        }, 1800);
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

    // Dynamic Accuracy Calculation: (Correct on 1st attempt / Total Questions) * 100
    const accuracy = Math.round((quizState.firstTryCorrect / quizState.totalQuestions) * 100);

    const accuracyElem = document.getElementById('victory-accuracy');
    const accIcon = document.getElementById('victory-acc-icon');
    if (accuracyElem) {
        accuracyElem.innerText = `${accuracy}%`;
    }
    if (accIcon) {
        if (accuracy >= 80) {
            accIcon.style.color = '#10b981'; // Green
        } else if (accuracy >= 60) {
            accIcon.style.color = '#f59e0b'; // Amber
        } else {
            accIcon.style.color = '#ef4444'; // Red
        }
    }

    // Dynamic XP (bonus +10 if 100% accuracy)
    let totalXp = quizState.earnedXp;
    if (accuracy === 100) {
        totalXp += 10;
    }

    const xpElem = document.getElementById('victory-xp');
    if (xpElem) {
        xpElem.innerText = `+${totalXp} XP`;
    }

    // Save XP to server
    fetch('/api/progress/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpEarned: totalXp })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            const xpPill = document.querySelector('.pill:nth-child(1)');
            if (xpPill) xpPill.innerHTML = `<i class="fa-solid fa-star text-yellow"></i> ${data.newTotalXp} XP`;
        }
    }).catch(err => console.error('XP update error:', err));

    // Threshold check (>= 60% passes and unlocks next lesson)
    const statusVal = document.getElementById('victory-status');
    const statusLbl = document.getElementById('victory-status-lbl');
    const statusIcon = document.getElementById('victory-status-icon');
    const victoryTitle = document.querySelector('.victory-title');

    if (accuracy >= 60) {
        if (statusVal) statusVal.innerText = 'បានដោះសោរ';
        if (statusLbl) statusLbl.innerText = 'មេរៀនបន្ទាប់';
        if (statusIcon) {
            statusIcon.className = 'fa-solid fa-lock-open';
            statusIcon.style.color = '#3b82f6';
        }
        if (victoryTitle) {
            victoryTitle.innerText = accuracy === 100 ? '🎉 ពូកែឥតខ្ចោះ (100%)!' : '🎉 អស្ចារ្យណាស់!';
        }

        // Unlock next node in current grade curriculum
        if (currentCurriculumDB && currentCurriculumDB[currentActiveGradeKey] && currentCurriculumDB[currentActiveGradeKey][currentActiveSubject]) {
            const lessons = currentCurriculumDB[currentActiveGradeKey][currentActiveSubject];
            const nextIndex = currentActiveLessonIndex + 1;
            if (nextIndex < lessons.length) {
                lessons[nextIndex].locked = false;
            }
        }
    } else {
        if (statusVal) statusVal.innerText = 'គួររៀនឡើងវិញ';
        if (statusLbl) statusLbl.innerText = 'ពិន្ទុមិនទាន់គ្រប់គ្រាន់';
        if (statusIcon) {
            statusIcon.className = 'fa-solid fa-rotate-right';
            statusIcon.style.color = '#f59e0b';
        }
        if (victoryTitle) {
            victoryTitle.innerText = '💪 ព្យាយាមម្តងទៀត!';
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
