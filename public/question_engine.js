// K-12 Interactive Mathematics Question Engine (ម៉ាស៊ីនសំណួរចម្រុះ Kahoot & Duolingo Style)
// Supports:
// 1. True / False (ខុស ឬ ត្រូវ)
// 2. Fill-in-the-Blank (បំពេញចន្លោះប្រអប់)
// 3. Matching Pairs (ផ្គូផ្គងគូ)
// 4. Ordering / Sequencing (តម្រៀបលំដាប់)
// 5. Multiple Choice & Word Problems (ពហុជ្រើសរើស និងចំណោទ)

const QuestionEngine = {
    // Utility helpers
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    shuffle(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },

    // 1. True / False Generator (ខុស ឬ ត្រូវ)
    generateTrueFalse(grade, lessonTitle = '') {
        const title = lessonTitle || '';
        const isTrue = Math.random() > 0.45; // ~55% true, 45% false
        let statement = '';
        let explanation = '';

        if (grade === 1) {
            const a = this.randInt(2, 6);
            const b = this.randInt(1, 4);
            const actual = a + b;
            const displayed = isTrue ? actual : (actual + (Math.random() > 0.5 ? 1 : -1));
            statement = `${a} + ${b} = ${displayed}`;
            explanation = `${a} + ${b} គឺស្មើ ${actual}`;
        } else if (grade <= 3) {
            if (title.includes('គុណ') || Math.random() > 0.5) {
                const a = this.randInt(2, 9);
                const b = this.randInt(2, 5);
                const actual = a * b;
                const displayed = isTrue ? actual : (actual + (Math.random() > 0.5 ? 2 : -2));
                statement = `${a} × ${b} = ${displayed}`;
                explanation = `${a} × ${b} គឺស្មើ ${actual}`;
            } else {
                const b = this.randInt(2, 5);
                const actual = this.randInt(2, 6);
                const a = b * actual;
                const displayed = isTrue ? actual : actual + 1;
                statement = `${a} ÷ ${b} = ${displayed}`;
                explanation = `${a} ÷ ${b} គឺស្មើ ${actual}`;
            }
        } else if (grade <= 6) {
            const concepts = ['fraction', 'geometry', 'unit', 'calc'];
            const chosen = this.pick(concepts);
            if (chosen === 'fraction') {
                const fracPairs = [
                    { s: '1/2 = 0.5', actual: true, exp: '1/2 ស្មើនឹង 0.5' },
                    { s: '1/4 = 0.25', actual: true, exp: '1/4 ស្មើនឹង 0.25' },
                    { s: '3/4 = 0.75', actual: true, exp: '3/4 ស្មើនឹង 0.75' },
                    { s: '1/2 = 0.2', actual: false, exp: '1/2 ស្មើនឹង 0.5 មិនមែន 0.2 ទេ' },
                    { s: '2/5 = 0.4', actual: true, exp: '2/5 ស្មើនឹង 0.4' },
                    { s: '1/5 = 0.5', actual: false, exp: '1/5 ស្មើនឹង 0.2 មិនមែន 0.5 ទេ' }
                ];
                const p = this.pick(fracPairs);
                statement = p.s;
                explanation = p.exp;
                return {
                    type: 'true_false',
                    badgeText: 'ខុស ឬ ត្រូវ (True / False)',
                    badgeIcon: 'fa-check-double',
                    prompt: 'តើសមភាពខាងក្រោមនេះ ត្រឹមត្រូវ (ពិត) ឬមិនត្រឹមត្រូវ (មិនពិត)?',
                    statement,
                    correctAnswer: p.actual,
                    explanation,
                    timerSecs: 30
                };
            } else if (chosen === 'geometry') {
                const geomStatements = [
                    { s: 'ផលបូកមុំក្នុងត្រីកោណស្មើ 180°', actual: true, exp: 'ផលបូកមុំក្នុងត្រីកោណតែងតែស្មើ 180°' },
                    { s: 'មុំកែងមានទំហំ 90°', actual: true, exp: 'មុំកែងមានទំហំជាក់លាក់ 90°' },
                    { s: 'ការ៉េមានជ្រុង ៤ មិនស្មើគ្នាទេ', actual: false, exp: 'ការ៉េមានជ្រុងទាំង ៤ ស្មើគ្នាជានិច្ច' },
                    { s: 'ផ្ទៃក្រឡាចតុកោណកែង = បណ្តោយ × ទទឹង', actual: true, exp: 'S = a × b ជារូបមន្តផ្ទៃក្រឡាចតុកោណកែង' }
                ];
                const p = this.pick(geomStatements);
                return {
                    type: 'true_false',
                    badgeText: 'ខុស ឬ ត្រូវ (True / False)',
                    badgeIcon: 'fa-check-double',
                    prompt: 'តើទ្រឹស្តីបទខាងក្រោមនេះ ត្រឹមត្រូវ ឬខុស?',
                    statement: p.s,
                    correctAnswer: p.actual,
                    explanation: p.exp,
                    timerSecs: 30
                };
            } else {
                const a = this.randInt(12, 30);
                const b = this.randInt(4, 9);
                const actual = a * b;
                const displayed = isTrue ? actual : actual + 10;
                statement = `${a} × ${b} = ${displayed}`;
                explanation = `${a} × ${b} គឺស្មើ ${actual}`;
            }
        } else if (grade <= 9) {
            const highPairs = [
                { s: '(-4) × (-5) = 20', actual: true, exp: 'ដក គុណ ដក ស្មើនឹង បូក (+20)' },
                { s: '(-3) × 6 = 18', actual: false, exp: 'ដក គុណ បូក ស្មើនឹង ដក (-18)' },
                { s: '√64 = 8', actual: true, exp: 'ព្រោះ 8² = 64' },
                { s: '√49 = 9', actual: false, exp: '√49 = 7 មិនមែន 9 ទេ' },
                { s: '2³ = 8', actual: true, exp: '2 × 2 × 2 = 8' },
                { s: 'បើ 2x = 14 នោះ x = 7', actual: true, exp: 'x = 14 ÷ 2 = 7' },
                { s: 'បើ x - 5 = 10 នោះ x = 5', actual: false, exp: 'x = 10 + 5 = 15' },
                { s: 'a² - b² = (a - b)(a + b)', actual: true, exp: 'រូបមន្តកន្សោមភាពខុសគ្នានៃការ៉េ' }
            ];
            const p = this.pick(highPairs);
            return {
                type: 'true_false',
                badgeText: 'ខុស ឬ ត្រូវ (True / False)',
                badgeIcon: 'fa-check-double',
                prompt: 'តើការគណនា ឬរូបមន្តខាងក្រោមនេះ ត្រឹមត្រូវ ឬមិនត្រឹមត្រូវ?',
                statement: p.s,
                correctAnswer: p.actual,
                explanation: p.exp,
                timerSecs: 30
            };
        } else {
            // Grades 10-12
            const advPairs = [
                { s: 'sin²(x) + cos²(x) = 1', actual: true, exp: 'រូបមន្តគ្រឹះត្រីកោណមាត្រ' },
                { s: 'cos(0°) = 1', actual: true, exp: 'កូស៊ីនុសនៃមុំ 0° ស្មើ 1' },
                { s: 'sin(90°) = 0', actual: false, exp: 'sin(90°) = 1 មិនមែន 0 ទេ' },
                { s: 'ដេរីវេនៃ x² គឺ 2x', actual: true, exp: '(xⁿ)\' = n·xⁿ⁻¹ => (x²)\' = 2x' },
                { s: 'log₁₀(100) = 2', actual: true, exp: '10² = 100 ដូច្នេះ log₁₀(100) = 2' },
                { s: 'lim(x→0) [sin(x)/x] = 1', actual: true, exp: 'លីមីតគ្រឹះល្បីក្នុងគណិតវិទ្យា' },
                { s: 'ដេរីវេនៃចំនួនថេរ C គឺ C', actual: false, exp: 'ដេរីវេនៃចំនួនថេរគឺ 0' }
            ];
            const p = this.pick(advPairs);
            return {
                type: 'true_false',
                badgeText: 'ខុស ឬ ត្រូវ (True / False)',
                badgeIcon: 'fa-check-double',
                prompt: 'តើទ្រឹស្តីបទ/លទ្ធផលគណិតវិទ្យាខាងក្រោម ពិត ឬមិនពិត?',
                statement: p.s,
                correctAnswer: p.actual,
                explanation: p.exp,
                timerSecs: 35
            };
        }

        return {
            type: 'true_false',
            badgeText: 'ខុស ឬ ត្រូវ (True / False)',
            badgeIcon: 'fa-check-double',
            prompt: 'តើការគណនាខាងក្រោមនេះ ត្រឹមត្រូវ (ពិត) ឬមិនត្រឹមត្រូវ (មិនពិត)?',
            statement,
            correctAnswer: isTrue,
            explanation,
            timerSecs: 30
        };
    },

    // 2. Fill in the Blank Generator (បំពេញប្រអប់ [ ? ])
    generateFillBlank(grade, lessonTitle = '') {
        const title = lessonTitle || '';
        let eqText = '';
        let missingVal = 0;
        let hint = '';

        if (grade === 1) {
            const a = this.randInt(2, 7);
            const b = this.randInt(1, 5);
            const sum = a + b;
            if (Math.random() > 0.5) {
                // a + [?] = sum
                eqText = `${a} + ❓ = ${sum}`;
                missingVal = b;
            } else {
                // [?] - b = a
                eqText = `❓ - ${b} = ${a}`;
                missingVal = sum;
            }
            hint = 'បំពេញលេខដើម្បីឱ្យផលបូក ឬផលដកត្រឹមត្រូវ';
        } else if (grade <= 3) {
            if (title.includes('គុណ') || Math.random() > 0.5) {
                const a = this.randInt(2, 9);
                const b = this.randInt(2, 6);
                const prod = a * b;
                eqText = `${a} × ❓ = ${prod}`;
                missingVal = b;
                hint = `តើ ${a} គុណនឹងប៉ុន្មានស្មើ ${prod}?`;
            } else {
                const b = this.randInt(2, 6);
                const ans = this.randInt(2, 7);
                const a = b * ans;
                eqText = `${a} ÷ ❓ = ${ans}`;
                missingVal = b;
                hint = `តើ ${a} ចែកនឹងប៉ុន្មានស្មើ ${ans}?`;
            }
        } else if (grade <= 6) {
            const a = this.randInt(15, 60);
            const b = this.randInt(10, 40);
            if (Math.random() > 0.5) {
                const sum = a + b;
                eqText = `${a} + ❓ = ${sum}`;
                missingVal = b;
            } else {
                const prod = a * 2;
                eqText = `❓ × 2 = ${prod}`;
                missingVal = a;
            }
            hint = 'គណនារកតម្លៃមិនស្គាល់ក្នុងប្រអប់';
        } else if (grade <= 9) {
            // Linear equation: 2x + 4 = 16 => x = 6
            const x = this.randInt(2, 9);
            const coeff = this.randInt(2, 5);
            const constVal = this.randInt(1, 9);
            const total = coeff * x + constVal;
            eqText = `${coeff}x + ${constVal} = ${total}  ⟹  x = ❓`;
            missingVal = x;
            hint = `ដោះស្រាយសមីការរកតម្លៃ x`;
        } else {
            // Grades 10-12: Powers or Logarithms or Simple derivatives
            const base = this.pick([2, 3, 5]);
            const exp = this.randInt(2, 4);
            const res = Math.pow(base, exp);
            eqText = `log₍${base}₎(${res}) = ❓`;
            missingVal = exp;
            hint = `ព្រោះ ${base}^❓ = ${res}`;
        }

        return {
            type: 'fill_blank',
            badgeText: 'បំពេញប្រអប់ (Fill in the Blank)',
            badgeIcon: 'fa-square-pen',
            prompt: 'ចូររកតម្លៃលេខដាក់ក្នុងសញ្ញា [ ❓ ] ឱ្យបានត្រឹមត្រូវ៖',
            equationDisplay: eqText,
            correctAnswer: missingVal,
            hint,
            timerSecs: 40
        };
    },

    // 3. Matching Pairs Generator (ផ្គូផ្គង)
    generateMatching(grade, lessonTitle = '') {
        let pairs = [];

        if (grade <= 2) {
            const pool = [
                { left: '2 + 3', right: '5' },
                { left: '4 + 4', right: '8' },
                { left: '10 - 3', right: '7' },
                { left: '6 + 3', right: '9' },
                { left: '7 - 5', right: '2' },
                { left: '5 + 5', right: '10' }
            ];
            pairs = this.shuffle(pool).slice(0, 3);
        } else if (grade <= 4) {
            const pool = [
                { left: '3 × 4', right: '12' },
                { left: '5 × 6', right: '30' },
                { left: '7 × 3', right: '21' },
                { left: '8 × 4', right: '32' },
                { left: '9 × 2', right: '18' },
                { left: '36 ÷ 6', right: '6' },
                { left: '24 ÷ 3', right: '8' }
            ];
            pairs = this.shuffle(pool).slice(0, 3);
        } else if (grade <= 6) {
            const pool = [
                { left: 'ប្រភាគ 1/2', right: '0.5' },
                { left: 'ប្រភាគ 1/4', right: '0.25' },
                { left: 'ប្រភាគ 3/4', right: '0.75' },
                { left: 'ប្រភាគ 1/5', right: '0.2' },
                { left: '1 គីឡូក្រាម', right: '1000 ក្រាម' },
                { left: '1 ម៉ែត្រ', right: '100 ស.ម' },
                { left: '1 ម៉ោង', right: '60 នាទី' }
            ];
            pairs = this.shuffle(pool).slice(0, 3);
        } else if (grade <= 9) {
            const pool = [
                { left: '√64', right: '8' },
                { left: '√81', right: '9' },
                { left: '2³', right: '8' },
                { left: '3²', right: '9' },
                { left: '(-5) × (-3)', right: '15' },
                { left: '√100', right: '10' },
                { left: '4²', right: '16' }
            ];
            pairs = this.shuffle(pool).slice(0, 3);
        } else {
            // Grades 10-12
            const pool = [
                { left: 'sin(90°)', right: '1' },
                { left: 'cos(90°)', right: '0' },
                { left: 'tan(45°)', right: '1' },
                { left: 'cos(0°)', right: '1' },
                { left: '(x²)\'', right: '2x' },
                { left: '(x³)\'', right: '3x²' },
                { left: 'log₁₀(10)', right: '1' }
            ];
            pairs = this.shuffle(pool).slice(0, 3);
        }

        // Attach IDs to ensure distinct matching
        const pairedData = pairs.map((p, idx) => ({ id: idx + 1, left: p.left, right: p.right }));

        return {
            type: 'matching',
            badgeText: 'ផ្គូផ្គង (Match Pairs)',
            badgeIcon: 'fa-link',
            prompt: 'ចូរចុចផ្គូផ្គងសំណួរខាងឆ្វេង ជាមួយចម្លើយត្រឹមត្រូវខាងស្តាំ៖',
            pairs: pairedData,
            timerSecs: 50
        };
    },

    // 4. Ordering / Sequencing Generator (តម្រៀបលំដាប់)
    generateOrdering(grade, lessonTitle = '') {
        let nums = [];
        let promptText = '';

        if (grade <= 2) {
            while (nums.length < 4) {
                const n = this.randInt(1, 20);
                if (!nums.includes(n)) nums.push(n);
            }
        } else if (grade <= 5) {
            while (nums.length < 4) {
                const n = this.randInt(10, 99);
                if (!nums.includes(n)) nums.push(n);
            }
        } else if (grade <= 8) {
            // Include negative integers
            while (nums.length < 4) {
                const n = this.randInt(-20, 30);
                if (!nums.includes(n)) nums.push(n);
            }
        } else {
            // Higher numbers / decimals
            while (nums.length < 4) {
                const n = this.randInt(1, 50) * 5;
                if (!nums.includes(n)) nums.push(n);
            }
        }

        const isAscending = true; // Smallest to largest is standard and clear
        const sorted = [...nums].sort((a, b) => a - b);
        promptText = 'ចូរចុចជ្រើសរើសលេខពី «តូច ទៅ ធំ» តាមលំដាប់លំដោយ៖';

        return {
            type: 'ordering',
            badgeText: 'តម្រៀបលំដាប់ (Ordering)',
            badgeIcon: 'fa-arrow-down-short-wide',
            prompt: promptText,
            items: nums, // scrambled
            correctOrder: sorted,
            timerSecs: 45
        };
    },

    // 5. Multiple Choice & Word Problem Generator
    generateMCQ(grade, lessonTitle = '') {
        // Delegate to word problem engine if available
        let wp = null;
        if (typeof generateWordProblem === 'function') {
            wp = generateWordProblem(grade, lessonTitle);
        }

        if (wp) {
            const correctAnswer = wp.correctAnswer;
            const options = [correctAnswer];
            while (options.length < 4) {
                const offset = this.randInt(1, 8);
                const fake = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
                if (!options.includes(fake) && (grade >= 7 || fake >= 0)) {
                    options.push(fake);
                }
            }
            return {
                type: 'mcq',
                badgeText: 'ចំណោទអនុវត្តន៍ (Word Problem)',
                badgeIcon: 'fa-book-open',
                isWordProblem: true,
                story: wp.story,
                question: wp.question,
                equation: `រូបមន្ត៖ ${wp.equation}`,
                options: this.shuffle(options),
                correctAnswer,
                unit: wp.unit || '',
                timerSecs: 60
            };
        }

        // Standard arithmetic fallback
        const a = this.randInt(10, 30);
        const b = this.randInt(5, 20);
        const correctAnswer = a + b;
        const options = [correctAnswer];
        while (options.length < 4) {
            const fake = correctAnswer + this.pick([-3, -2, -1, 1, 2, 3, 5]);
            if (!options.includes(fake) && fake > 0) options.push(fake);
        }

        return {
            type: 'mcq',
            badgeText: 'ពហុជ្រើសរើស (Multiple Choice)',
            badgeIcon: 'fa-list-check',
            isWordProblem: false,
            equation: `${a} + ${b} = ?`,
            options: this.shuffle(options),
            correctAnswer,
            unit: '',
            timerSecs: 30
        };
    },

    // Master dispatcher for the 5-question session
    generateQuestionForStep(stepIndex, totalSteps, grade, lessonTitle) {
        // Step 1: True / False (Icebreaker, fast recognition)
        // Step 2: Fill in the Blank (Missing number equation)
        // Step 3: Real-World Word Problem (ចំណោទ)
        // Step 4: Matching Pairs OR Ordering (Interactivity & categorization)
        // Step 5: Advanced Problem or Word Problem Capstone
        switch (stepIndex) {
            case 1:
                return this.generateTrueFalse(grade, lessonTitle);
            case 2:
                return this.generateFillBlank(grade, lessonTitle);
            case 3:
                return this.generateMCQ(grade, lessonTitle); // Word problem with 60s
            case 4:
                return Math.random() > 0.5 ? this.generateMatching(grade, lessonTitle) : this.generateOrdering(grade, lessonTitle);
            case 5:
                return this.generateMCQ(grade, lessonTitle);
            default:
                return this.generateMCQ(grade, lessonTitle);
        }
    }
};

// Export to window for browser access and module for Node.js
if (typeof window !== 'undefined') {
    window.QuestionEngine = QuestionEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionEngine;
}
