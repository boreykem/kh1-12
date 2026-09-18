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
        document.getElementById('math-play-btn').setAttribute('onclick', 'openAlgebraGame()');
    } else {
        appDiv.classList.remove('senior-theme');
        appDiv.classList.add('junior-theme');
        heroSubtext.innerText = "Ready for today's Math and Science challenges?";
        document.getElementById('math-play-btn').setAttribute('onclick', 'openMathGame()');
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

async function renderLearningMap(subject) {
    const container = document.getElementById('map-nodes-container');
    container.innerHTML = '<div class="path-line"></div>';

    const grade = parseInt(document.getElementById('grade-select').value);
    
    // Default fallback nodes if fetch fails
    let nodes = [
        { title: 'ហ្គេមគណិតវិទ្យា', icon: 'fa-calculator', color: '#3b82f6', locked: false, gameId: 'math_basic' }
    ];

    try {
        const res = await fetch('/curriculum.json');
        const db = await res.json();
        
        // Find the closest grade mapping
        let gradeKey = `grade_${grade}`;
        if (!db[gradeKey]) {
            // Fallback: Use grade 1 for primary (<=6) and grade 7 for secondary (>6)
            gradeKey = grade <= 6 ? 'grade_1' : 'grade_7';
        }

        if (db[gradeKey] && db[gradeKey][subject]) {
            nodes = db[gradeKey][subject];
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
            action = `alert('វគ្គនេះជាប់សោរ (Locked)! ត្រូវលេងវគ្គមុនឲ្យឈ្នះសិន។')`;
        } else if (node.gameId === 'algebra_balance') {
            action = `openAlgebraGame()`;
        } else if (node.gameId === 'math_basic') {
            action = `openMathGame()`;
        } else {
            action = `alert('ហ្គេមនេះកំពុងស្ថិតក្នុងការអភិវឌ្ឍ! Coming soon!')`;
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
