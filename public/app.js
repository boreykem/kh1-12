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
    timerInterval: null,
    activeProblem: null,
    fillBlankValue: '',
    selectedMatchLeft: null,
    matchedCount: 0,
    totalPairsToMatch: 0,
    orderedSelected: []
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

    updateQuizProgress();
    generateMathProblem();
}

function closeMathGame() {
    clearInterval(quizState.timerInterval);
    document.getElementById('math-game-overlay').classList.add('hidden');
    document.getElementById('feedback-msg').innerText = '';
}

function startQuizTimer(seconds = 30) {
    clearInterval(quizState.timerInterval);
    quizState.timer = seconds;
    const timerElem = document.getElementById('quiz-timer');
    
    const formatTime = (totalSecs) => {
        const mins = Math.floor(totalSecs / 60);
        const remSecs = totalSecs % 60;
        return `${mins < 10 ? '0' + mins : mins}:${remSecs < 10 ? '0' + remSecs : remSecs}`;
    };

    if (timerElem) {
        timerElem.innerText = formatTime(quizState.timer);
        timerElem.style.background = 'rgba(239, 68, 68, 0.1)';
        timerElem.style.color = '#ef4444';
    }

    quizState.timerInterval = setInterval(() => {
        quizState.timer--;
        if (timerElem) {
            timerElem.innerText = formatTime(quizState.timer);
            if (quizState.timer <= 10) {
                timerElem.style.background = '#ef4444';
                timerElem.style.color = 'white';
            }
        }

        if (quizState.timer <= 0) {
            clearInterval(quizState.timerInterval);
            if (quizState.isProcessingAnswer) return;
            quizState.isProcessingAnswer = true;
            quizState.wrongAttempts++;
            quizState.currentQuestionHasError = true;

            const feedback = document.getElementById('feedback-msg');
            const prob = quizState.activeProblem;

            if (prob && prob.type === 'true_false') {
                if (feedback) {
                    feedback.innerHTML = `⏰ <b>អស់ពេលហើយ!</b> ចម្លើយត្រឹមត្រូវគឺ <b>${prob.correctAnswer ? 'ត្រូវ (ពិត)' : 'ខុស (មិនពិត)'}</b> (+0 XP)`;
                    feedback.className = 'feedback wrong';
                }
                const correctBtn = prob.correctAnswer ? document.getElementById('tf-btn-true') : document.getElementById('tf-btn-false');
                if (correctBtn) correctBtn.style.border = '4px solid #ffffff';
            } else if (prob && prob.type === 'fill_blank') {
                if (feedback) {
                    feedback.innerHTML = `⏰ <b>អស់ពេលហើយ!</b> តម្លៃត្រឹមត្រូវគឺ <b>${prob.correctAnswer}</b> (+0 XP)`;
                    feedback.className = 'feedback wrong';
                }
                const input = document.getElementById('fillblank-input');
                if (input) {
                    input.value = prob.correctAnswer;
                    input.style.borderColor = '#ef4444';
                }
            } else if (prob && prob.type === 'matching') {
                if (feedback) {
                    feedback.innerHTML = `⏰ <b>អស់ពេលហើយ!</b> (+0 XP)`;
                    feedback.className = 'feedback wrong';
                }
            } else if (prob && prob.type === 'ordering') {
                if (feedback) {
                    feedback.innerHTML = `⏰ <b>អស់ពេលហើយ!</b> លំដាប់ត្រឹមត្រូវគឺ <b>${prob.correctOrder.join(' < ')}</b> (+0 XP)`;
                    feedback.className = 'feedback wrong';
                }
            } else {
                if (feedback) {
                    feedback.innerHTML = `⏰ <b>អស់ពេលហើយ!</b> ចម្លើយត្រឹមត្រូវគឺ <b>${currentCorrectAnswer}</b> (+0 XP)`;
                    feedback.className = 'feedback wrong';
                }
                const buttons = document.querySelectorAll('.game-option');
                buttons.forEach(btn => {
                    if (parseInt(btn.dataset.val) === currentCorrectAnswer) {
                        btn.style.background = '#10b981';
                    }
                    btn.disabled = true;
                });
            }

            setTimeout(() => {
                advanceToNextQuestion();
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

function hideAllQuestionContainers() {
    const ids = [
        'game-word-problem',
        'game-equation',
        'game-options',
        'game-tf-options',
        'game-fillblank',
        'game-matching',
        'game-ordering'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function generateMathProblem() {
    quizState.currentQuestionHasError = false;
    quizState.isProcessingAnswer = false;
    hideAllQuestionContainers();

    const feedback = document.getElementById('feedback-msg');
    if (feedback) {
        feedback.innerText = '';
        feedback.className = 'feedback';
    }

    const grade = parseInt(document.getElementById('grade-select').value) || 1;
    const title = currentLessonTitle || '';

    // Generate Question according to step
    let problem = null;
    if (window.QuestionEngine && typeof QuestionEngine.generateQuestionForStep === 'function') {
        problem = QuestionEngine.generateQuestionForStep(quizState.currentQuestion, quizState.totalQuestions, grade, title);
    } else {
        problem = {
            type: 'mcq',
            badgeText: 'ពហុជ្រើសរើស',
            badgeIcon: 'fa-list-check',
            equation: '5 + 5 = ?',
            options: [10, 8, 12, 15],
            correctAnswer: 10,
            unit: '',
            timerSecs: 30
        };
    }
    quizState.activeProblem = problem;

    // Update Badge
    const badgeElem = document.getElementById('quiz-qtype-badge');
    if (badgeElem) {
        badgeElem.innerHTML = `<i class="fa-solid ${problem.badgeIcon || 'fa-star'}"></i> <span>${problem.badgeText || 'សំណួរអនុវត្ត'}</span>`;
    }

    // Render by type
    if (problem.type === 'true_false') {
        const eqElem = document.getElementById('game-equation');
        const tfContainer = document.getElementById('game-tf-options');
        const trueBtn = document.getElementById('tf-btn-true');
        const falseBtn = document.getElementById('tf-btn-false');

        if (eqElem) {
            eqElem.classList.remove('hidden');
            eqElem.style.fontSize = 'clamp(1.5rem, 4.5vw, 2.3rem)';
            eqElem.style.marginBottom = '1.2rem';
            eqElem.innerHTML = `<span>${problem.statement}</span>`;
        }
        if (tfContainer) tfContainer.classList.remove('hidden');
        if (trueBtn) {
            trueBtn.disabled = false;
            trueBtn.style.opacity = '1';
            trueBtn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            trueBtn.style.transform = 'none';
        }
        if (falseBtn) {
            falseBtn.disabled = false;
            falseBtn.style.opacity = '1';
            falseBtn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            falseBtn.style.transform = 'none';
        }
        startQuizTimer(problem.timerSecs || 30);

    } else if (problem.type === 'fill_blank') {
        const fbContainer = document.getElementById('game-fillblank');
        const promptElem = document.getElementById('fillblank-prompt-text');
        const eqDisplay = document.getElementById('fillblank-eq-display');
        const inputElem = document.getElementById('fillblank-input');

        if (fbContainer) fbContainer.classList.remove('hidden');
        if (promptElem) promptElem.innerText = problem.prompt || 'ចូររកតម្លៃលេខដាក់ក្នុងសញ្ញា [ ❓ ]';
        if (eqDisplay) {
            eqDisplay.innerHTML = problem.equationDisplay.replace('❓', '<span class="fillblank-box-target">❓</span>');
        }
        quizState.fillBlankValue = '';
        if (inputElem) {
            inputElem.value = '';
            inputElem.style.borderColor = 'var(--glass-border)';
            inputElem.style.color = 'var(--text-main)';
        }
        startQuizTimer(problem.timerSecs || 40);

    } else if (problem.type === 'matching') {
        const matchContainer = document.getElementById('game-matching');
        const instrElem = document.getElementById('matching-instruction-text');
        const leftCol = document.getElementById('matching-left-col');
        const rightCol = document.getElementById('matching-right-col');

        if (matchContainer) matchContainer.classList.remove('hidden');
        if (instrElem) instrElem.innerText = problem.prompt || 'ចុចជ្រើសសំណួរខាងឆ្វេង រួចចុចចម្លើយត្រូវខាងស្តាំ';

        const shuffledLeft = QuestionEngine.shuffle(problem.pairs);
        const shuffledRight = QuestionEngine.shuffle(problem.pairs);

        if (leftCol) {
            leftCol.innerHTML = '';
            shuffledLeft.forEach(p => {
                leftCol.innerHTML += `<button type="button" class="match-card" data-id="${p.id}" data-side="left" onclick="onMatchCardClick('left', ${p.id}, this)">${p.left}</button>`;
            });
        }
        if (rightCol) {
            rightCol.innerHTML = '';
            shuffledRight.forEach(p => {
                rightCol.innerHTML += `<button type="button" class="match-card" data-id="${p.id}" data-side="right" onclick="onMatchCardClick('right', ${p.id}, this)">${p.right}</button>`;
            });
        }

        quizState.selectedMatchLeft = null;
        quizState.matchedCount = 0;
        quizState.totalPairsToMatch = problem.pairs.length;
        startQuizTimer(problem.timerSecs || 50);

    } else if (problem.type === 'ordering') {
        const orderContainer = document.getElementById('game-ordering');
        const promptElem = document.getElementById('ordering-prompt-text');
        const slotsTray = document.getElementById('ordering-slots-tray');
        const poolTray = document.getElementById('ordering-pool-tray');

        if (orderContainer) orderContainer.classList.remove('hidden');
        if (promptElem) promptElem.innerText = problem.prompt || 'ចូរចុចជ្រើសរើសលេខពី «តូច ទៅ ធំ» តាមលំដាប់លំដោយ៖';
        if (slotsTray) slotsTray.innerHTML = '<span style="opacity:0.5; font-size:0.85rem;">(លេខដែលបានតម្រៀបរួច)</span>';
        if (poolTray) {
            poolTray.innerHTML = '';
            problem.items.forEach(num => {
                poolTray.innerHTML += `<button type="button" class="order-chip" data-val="${num}" onclick="onOrderChipClick(${num}, this)">${num}</button>`;
            });
        }

        quizState.orderedSelected = [];
        startQuizTimer(problem.timerSecs || 45);

    } else {
        // Multiple Choice (MCQ) and Word Problems
        const wordCard = document.getElementById('game-word-problem');
        const storyElem = document.getElementById('problem-story-text');
        const questionElem = document.getElementById('problem-question-text');
        const eqElem = document.getElementById('game-equation');
        const optGrid = document.getElementById('game-options');

        currentCorrectAnswer = problem.correctAnswer;
        const unit = problem.unit ? ` ${problem.unit}` : '';

        if (problem.isWordProblem) {
            if (wordCard) {
                wordCard.classList.remove('hidden');
                if (storyElem) storyElem.innerText = problem.story;
                if (questionElem) questionElem.innerText = problem.question;
            }
            if (eqElem) {
                eqElem.classList.remove('hidden');
                eqElem.style.fontSize = '1.4rem';
                eqElem.style.marginBottom = '1rem';
                eqElem.innerHTML = `<span>${problem.equation}</span>`;
            }
        } else {
            if (wordCard) wordCard.classList.add('hidden');
            if (eqElem) {
                eqElem.classList.remove('hidden');
                eqElem.style.fontSize = 'clamp(2rem, 5vw, 3rem)';
                eqElem.style.marginBottom = '1.4rem';
                eqElem.innerHTML = `<span>${problem.equation}</span>`;
            }
        }

        if (optGrid) optGrid.classList.remove('hidden');

        // Render options into buttons
        const buttons = document.querySelectorAll('.game-option');
        buttons.forEach((btn, index) => {
            if (problem.options && problem.options[index] !== undefined) {
                btn.dataset.val = problem.options[index];
                btn.innerText = `${problem.options[index]}${unit}`;
                btn.onclick = () => checkAnswer(problem.options[index]);
                btn.style.background = 'var(--primary-color)';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.disabled = false;
                btn.style.fontSize = unit ? '1.3rem' : '1.8rem';
            }
        });

        startQuizTimer(problem.timerSecs || (problem.isWordProblem ? 60 : 30));
    }
}

// 1. True / False Handler
function checkTrueFalseAnswer(userChoice) {
    if (quizState.isProcessingAnswer) return;
    quizState.isProcessingAnswer = true;
    clearInterval(quizState.timerInterval);

    quizState.totalAttempts++;
    const prob = quizState.activeProblem;
    const trueBtn = document.getElementById('tf-btn-true');
    const falseBtn = document.getElementById('tf-btn-false');
    const feedback = document.getElementById('feedback-msg');

    if (trueBtn) trueBtn.disabled = true;
    if (falseBtn) falseBtn.disabled = true;

    const isCorrect = (userChoice === prob.correctAnswer);

    if (isCorrect) {
        quizState.firstTryCorrect++;
        quizState.earnedXp += 10;
        if (feedback) {
            feedback.innerHTML = `🎉 <b>ត្រឹមត្រូវល្អណាស់!</b> ${prob.explanation ? '(' + prob.explanation + ')' : ''} (+10 XP)`;
            feedback.className = 'feedback correct';
        }
        const chosenBtn = userChoice ? trueBtn : falseBtn;
        if (chosenBtn) chosenBtn.style.transform = 'scale(1.05)';
        setTimeout(() => advanceToNextQuestion(), 1300);
    } else {
        quizState.wrongAttempts++;
        quizState.currentQuestionHasError = true;
        if (feedback) {
            feedback.innerHTML = `❌ <b>មិនត្រឹមត្រូវទេ!</b> ចម្លើយត្រឹមត្រូវគឺ <b>${prob.correctAnswer ? 'ត្រូវ (ពិត)' : 'ខុស (មិនពិត)'}</b> ${prob.explanation ? '<br><small>' + prob.explanation + '</small>' : ''} (+0 XP)`;
            feedback.className = 'feedback wrong';
        }
        const wrongBtn = userChoice ? trueBtn : falseBtn;
        const correctBtn = prob.correctAnswer ? trueBtn : falseBtn;
        if (wrongBtn) wrongBtn.style.opacity = '0.35';
        if (correctBtn) correctBtn.style.border = '4px solid #ffffff';
        setTimeout(() => advanceToNextQuestion(), 2000);
    }
}

// 2. Fill in the Blank Handler
function pressFillKey(key) {
    if (quizState.isProcessingAnswer) return;
    const inputElem = document.getElementById('fillblank-input');
    if (key === 'del') {
        quizState.fillBlankValue = quizState.fillBlankValue.slice(0, -1);
    } else {
        if (quizState.fillBlankValue.length < 5) {
            quizState.fillBlankValue += key;
        }
    }
    if (inputElem) inputElem.value = quizState.fillBlankValue;
}

function submitFillBlank() {
    if (quizState.isProcessingAnswer) return;
    const prob = quizState.activeProblem;
    const inputElem = document.getElementById('fillblank-input');
    const feedback = document.getElementById('feedback-msg');

    if (!quizState.fillBlankValue) {
        if (feedback) {
            feedback.innerHTML = '⚠️ សូមចុចលេខបំពេញប្រអប់ជាមុនសិន!';
            feedback.className = 'feedback wrong';
        }
        return;
    }

    quizState.isProcessingAnswer = true;
    clearInterval(quizState.timerInterval);
    quizState.totalAttempts++;

    const userVal = parseInt(quizState.fillBlankValue, 10);
    const isCorrect = (userVal === prob.correctAnswer);

    if (isCorrect) {
        quizState.firstTryCorrect++;
        quizState.earnedXp += 10;
        if (inputElem) {
            inputElem.style.borderColor = '#10b981';
            inputElem.style.color = '#10b981';
        }
        if (feedback) {
            feedback.innerHTML = `🎉 <b>ត្រឹមត្រូវល្អឥតខ្ចោះ!</b> តម្លៃចន្លោះគឺ ${prob.correctAnswer} (+10 XP)`;
            feedback.className = 'feedback correct';
        }
        setTimeout(() => advanceToNextQuestion(), 1300);
    } else {
        quizState.wrongAttempts++;
        quizState.currentQuestionHasError = true;
        if (inputElem) {
            inputElem.style.borderColor = '#ef4444';
            inputElem.style.color = '#ef4444';
        }
        if (feedback) {
            feedback.innerHTML = `❌ <b>មិនត្រឹមត្រូវទេ!</b> តម្លៃត្រឹមត្រូវគឺ <b>${prob.correctAnswer}</b> (+0 XP)`;
            feedback.className = 'feedback wrong';
        }
        setTimeout(() => advanceToNextQuestion(), 1900);
    }
}

// 3. Matching Pairs Handler
function onMatchCardClick(side, id, el) {
    if (quizState.isProcessingAnswer) return;
    if (el.classList.contains('matched')) return;

    const feedback = document.getElementById('feedback-msg');

    if (side === 'left') {
        const prevSelected = document.querySelector('.match-card.selected[data-side="left"]');
        if (prevSelected) prevSelected.classList.remove('selected');

        el.classList.add('selected');
        quizState.selectedMatchLeft = { id, el };
        if (feedback) feedback.innerText = '';
    } else {
        if (!quizState.selectedMatchLeft) {
            if (feedback) {
                feedback.innerHTML = '👆 សូមចុចជ្រើសសំណួរខាងឆ្វេងជាមុនសិន!';
                feedback.className = 'feedback';
            }
            return;
        }

        const isMatch = (quizState.selectedMatchLeft.id === id);
        const leftEl = quizState.selectedMatchLeft.el;

        if (isMatch) {
            leftEl.classList.remove('selected');
            leftEl.classList.add('matched');
            el.classList.add('matched');
            leftEl.innerHTML += ' <i class="fa-solid fa-check"></i>';
            el.innerHTML += ' <i class="fa-solid fa-check"></i>';

            quizState.matchedCount++;
            quizState.selectedMatchLeft = null;

            if (quizState.matchedCount === quizState.totalPairsToMatch) {
                clearInterval(quizState.timerInterval);
                quizState.isProcessingAnswer = true;
                if (!quizState.currentQuestionHasError) {
                    quizState.firstTryCorrect++;
                    quizState.earnedXp += 10;
                }
                if (feedback) {
                    feedback.innerHTML = '🎉 <b>អស្ចារ្យណាស់! អ្នកបានផ្គូផ្គងត្រូវទាំងអស់</b> (+10 XP)';
                    feedback.className = 'feedback correct';
                }
                setTimeout(() => advanceToNextQuestion(), 1400);
            }
        } else {
            quizState.currentQuestionHasError = true;
            leftEl.classList.add('wrong-match');
            el.classList.add('wrong-match');
            if (feedback) {
                feedback.innerHTML = '❌ គូនេះមិនទាន់ត្រូវគ្នាទេ! សូមសាកល្បងម្តងទៀត។';
                feedback.className = 'feedback wrong';
            }
            setTimeout(() => {
                leftEl.classList.remove('wrong-match', 'selected');
                el.classList.remove('wrong-match');
                quizState.selectedMatchLeft = null;
            }, 600);
        }
    }
}

// 4. Ordering / Sequencing Handler
function onOrderChipClick(num, btnElem) {
    if (quizState.isProcessingAnswer) return;
    const prob = quizState.activeProblem;
    const slotsTray = document.getElementById('ordering-slots-tray');
    const feedback = document.getElementById('feedback-msg');

    const nextIndex = quizState.orderedSelected.length;
    const expected = prob.correctOrder[nextIndex];

    if (num === expected) {
        quizState.orderedSelected.push(num);
        btnElem.style.visibility = 'hidden';
        btnElem.disabled = true;

        if (slotsTray) {
            if (nextIndex === 0) slotsTray.innerHTML = '';
            const chip = document.createElement('div');
            chip.className = 'order-chip placed';
            chip.innerText = num;
            slotsTray.appendChild(chip);
        }

        if (quizState.orderedSelected.length === prob.correctOrder.length) {
            clearInterval(quizState.timerInterval);
            quizState.isProcessingAnswer = true;
            if (!quizState.currentQuestionHasError) {
                quizState.firstTryCorrect++;
                quizState.earnedXp += 10;
            }
            if (feedback) {
                feedback.innerHTML = '🎉 <b>ពូកែណាស់! អ្នកបានតម្រៀបត្រឹមត្រូវ</b> (+10 XP)';
                feedback.className = 'feedback correct';
            }
            setTimeout(() => advanceToNextQuestion(), 1400);
        }
    } else {
        quizState.currentQuestionHasError = true;
        btnElem.classList.add('order-wrong');
        if (feedback) {
            feedback.innerHTML = '❌ មិនទាន់ត្រូវលំដាប់ទេ! សូមរកមើលលេខតូចជាងគេបន្ទាប់។';
            feedback.className = 'feedback wrong';
        }
        setTimeout(() => {
            btnElem.classList.remove('order-wrong');
        }, 500);
    }
}

// 5. Multiple Choice Handler
function checkAnswer(selected) {
    if (quizState.isProcessingAnswer) return;
    quizState.isProcessingAnswer = true;
    clearInterval(quizState.timerInterval);

    quizState.totalAttempts++;
    const feedback = document.getElementById('feedback-msg');
    const buttons = document.querySelectorAll('.game-option');
    
    // Disable all buttons immediately
    buttons.forEach(btn => btn.disabled = true);

    if (selected === currentCorrectAnswer) {
        quizState.firstTryCorrect++;
        quizState.earnedXp += 10;

        if (feedback) {
            feedback.innerHTML = '🎉 <b>ត្រឹមត្រូវល្អណាស់!</b> (+10 XP)';
            feedback.className = 'feedback correct';
        }
        
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.val) === currentCorrectAnswer) {
                btn.style.background = '#10b981';
            }
        });

        setTimeout(() => advanceToNextQuestion(), 1200);
    } else {
        quizState.wrongAttempts++;
        quizState.currentQuestionHasError = true;

        if (feedback) {
            feedback.innerHTML = `❌ <b>មិនត្រឹមត្រូវទេ!</b> ចម្លើយត្រឹមត្រូវគឺ <b>${currentCorrectAnswer}</b> (+0 XP)`;
            feedback.className = 'feedback wrong';
        }
        
        buttons.forEach(btn => {
            const val = parseInt(btn.dataset.val);
            if (val === selected) {
                btn.style.background = '#ef4444';
            } else if (val === currentCorrectAnswer) {
                btn.style.background = '#10b981';
            }
        });

        setTimeout(() => advanceToNextQuestion(), 1800);
    }
}

// Step advancement
function advanceToNextQuestion() {
    if (quizState.currentQuestion < quizState.totalQuestions) {
        quizState.currentQuestion++;
        updateQuizProgress();
        generateMathProblem();
    } else {
        showLessonVictory();
    }
}

// Global Keyboard Listener for Fill-in-Blank
window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('math-game-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        const prob = quizState.activeProblem;
        if (prob && prob.type === 'fill_blank') {
            if (e.key >= '0' && e.key <= '9') {
                pressFillKey(e.key);
            } else if (e.key === 'Backspace') {
                pressFillKey('del');
            } else if (e.key === 'Enter') {
                submitFillBlank();
            }
        }
    }
});

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
