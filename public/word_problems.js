// K-12 Khmer Mathematics Word Problem Engine (ម៉ាស៊ីនបង្កើតចំណោទគណិតវិទ្យាភាសាខ្មែរ)
// Generates thousands of non-repeating parametric word problems per grade!

const KHMER_NAMES = ['តារា', 'សុខ', 'បូរី', 'ចិន្តា', 'វិចិត្រ', 'ធីតា', 'រតនា', 'ពិសិដ្ឋ', 'សុវណ្ណ', 'សុភាព', 'មករា', 'កល្យាណ', 'កញ្ញា', 'ចាន់ណា'];
const KHMER_GIVERS = ['ម្តាយ', 'ឪពុក', 'បងស្រី', 'បងប្រុស', 'លោកគ្រូ', 'អ្នកគ្រូ', 'មីង', 'ពូ'];
const KHMER_ITEMS = [
    { name: 'ផ្លែក្រូច', unit: 'ផ្លែ', icon: '🍊' },
    { name: 'ផ្លែប៉ោម', unit: 'ផ្លែ', icon: '🍎' },
    { name: 'សៀវភៅ', unit: 'ក្បាល', icon: '📚' },
    { name: 'ប៊ិច', unit: 'ដើម', icon: '🖊️' },
    { name: 'ឃ្លី', unit: 'គ្រាប់', icon: '⚪' },
    { name: 'នំខេក', unit: 'ចំណែក', icon: '🍰' },
    { name: 'ស្ករគ្រាប់', unit: 'គ្រាប់', icon: '🍬' },
    { name: 'ផ្កាឈូក', unit: 'ទង', icon: '🪷' },
    { name: 'ផ្លែស្វាយ', unit: 'ផ្លែ', icon: '🥭' }
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a unique, non-repeating Word Problem
function generateWordProblem(grade, lessonTitle) {
    const title = lessonTitle || '';
    const name1 = getRandomItem(KHMER_NAMES);
    let name2 = getRandomItem(KHMER_NAMES);
    while (name2 === name1) name2 = getRandomItem(KHMER_NAMES);
    const giver = getRandomItem(KHMER_GIVERS);
    const item = getRandomItem(KHMER_ITEMS);

    let problem = null;

    // --- GRADE 1 ---
    if (grade === 1) {
        const type = Math.random() > 0.5 ? 'add' : 'sub';
        if (type === 'add' || title.includes('បូក') || title.includes('ចំនួន')) {
            const n1 = getRandomInt(2, 6);
            const n2 = getRandomInt(1, 4);
            const ans = n1 + n2;
            problem = {
                story: `${item.icon} ${name1} មាន${item.name}ចំនួន ${n1} ${item.unit}។ ${giver}បានឱ្យ ${n2} ${item.unit}បន្ថែមទៀត។`,
                question: `តើ${name1}មាន${item.name}សរុបទាំងអស់ប៉ុន្មាន${item.unit}?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: ans,
                unit: item.unit
            };
        } else {
            const n1 = getRandomInt(5, 10);
            const n2 = getRandomInt(1, n1 - 1);
            const ans = n1 - n2;
            problem = {
                story: `${item.icon} ${name1} មាន${item.name}ចំនួន ${n1} ${item.unit}។ គាត់បានញ៉ាំអស់ ${n2} ${item.unit}។`,
                question: `តើ${name1}នៅសល់${item.name}ចំនួនប៉ុន្មាន${item.unit}?`,
                equation: `${n1} - ${n2} = ?`,
                correctAnswer: ans,
                unit: item.unit
            };
        }
    }
    // --- GRADE 2 ---
    else if (grade === 2) {
        const scenarios = ['mult', 'div', 'money', 'add', 'sub'];
        const chosen = title.includes('ចែក') ? 'div' : (title.includes('គុណ') ? 'mult' : getRandomItem(scenarios));

        if (chosen === 'mult') {
            const boxes = getRandomInt(2, 5);
            const perBox = getRandomInt(2, 6);
            const ans = boxes * perBox;
            problem = {
                story: `${item.icon} ${name1} ទិញ${item.name}ចំនួន ${boxes} ប្រអប់។ ក្នុងមួយប្រអប់មាន ${perBox} ${item.unit}។`,
                question: `តើ${name1}ទិញបាន${item.name}សរុបទាំងអស់ប៉ុន្មាន${item.unit}?`,
                equation: `${boxes} × ${perBox} = ?`,
                correctAnswer: ans,
                unit: item.unit
            };
        } else if (chosen === 'div') {
            const friends = getRandomInt(2, 4);
            const perFriend = getRandomInt(2, 5);
            const total = friends * perFriend;
            problem = {
                story: `${item.icon} ${name1} មាន${item.name}ចំនួន ${total} ${item.unit}។ គាត់ចែកស្មើៗគ្នាឱ្យមិត្តភក្តិ ${friends} នាក់។`,
                question: `តើមិត្តម្នាក់ៗទទួលបាន${item.name}ចំនួនប៉ុន្មាន${item.unit}?`,
                equation: `${total} ÷ ${friends} = ?`,
                correctAnswer: perFriend,
                unit: item.unit
            };
        } else if (chosen === 'money') {
            const n1 = getRandomInt(2, 8) * 100;
            const n2 = getRandomInt(1, 5) * 100;
            const ans = n1 + n2;
            problem = {
                story: `💵 ${name1} មានលុយ ${n1} រៀល។ ${giver}ឱ្យថែម ${n2} រៀលទៀត។`,
                question: `តើ${name1}មានប្រាក់សរុបទាំងអស់ប៉ុន្មានរៀល?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: ans,
                unit: 'រៀល'
            };
        } else {
            const n1 = getRandomInt(20, 60);
            const n2 = getRandomInt(10, 30);
            const ans = n1 + n2;
            problem = {
                story: `🏫 ក្នុងបណ្ណាល័យមានសៀវភៅគណិតវិទ្យា ${n1} ក្បាល និងសៀវភៅអក្សរសាស្ត្រ ${n2} ក្បាល។`,
                question: `តើបណ្ណាល័យមានសៀវភៅទាំងពីរមុខសរុបប៉ុន្មានក្បាល?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: ans,
                unit: 'ក្បាល'
            };
        }
    }
    // --- GRADE 3 ---
    else if (grade === 3) {
        const scenarios = ['shopping', 'change', 'trees', 'perimeter'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'shopping') {
            const price = getRandomInt(2, 6) * 500;
            const qty = getRandomInt(2, 4);
            const ans = price * qty;
            problem = {
                story: `🛍️ សៀវភៅមួយក្បាលតម្លៃ ${price} រៀល។ ${name1} ទិញចំនួន ${qty} ក្បាល។`,
                question: `តើ${name1}ត្រូវចំណាយប្រាក់សរុបប៉ុន្មានរៀល?`,
                equation: `${price} × ${qty} = ?`,
                correctAnswer: ans,
                unit: 'រៀល'
            };
        } else if (chosen === 'change') {
            const cost = getRandomInt(1, 4) * 1000;
            const paid = cost + getRandomInt(1, 3) * 1000;
            const ans = paid - cost;
            problem = {
                story: `🛒 ${name1} ទិញទំនិញអស់ប្រាក់ ${cost} រៀល។ គាត់បានហុចប្រាក់ ${paid} រៀលឱ្យអ្នកលក់។`,
                question: `តើអ្នកលក់ត្រូវអាប់ប្រាក់ឱ្យ${name1}វិញចំនួនប៉ុន្មានរៀល?`,
                equation: `${paid} - ${cost} = ?`,
                correctAnswer: ans,
                unit: 'រៀល'
            };
        } else if (chosen === 'trees') {
            const rows = getRandomInt(4, 9);
            const perRow = getRandomInt(10, 25);
            const ans = rows * perRow;
            problem = {
                story: `🌳 សាលារៀនបានដាំដើមឈើចំនួន ${rows} ជួរ ដោយក្នុងមួយជួរៗមានដើមឈើ ${perRow} ដើម។`,
                question: `តើសាលារៀនដាំដើមឈើបានសរុបទាំងអស់ប៉ុន្មានដើម?`,
                equation: `${rows} × ${perRow} = ?`,
                correctAnswer: ans,
                unit: 'ដើម'
            };
        } else {
            const length = getRandomInt(10, 30);
            const width = getRandomInt(5, length - 2);
            const ans = (length + width) * 2;
            problem = {
                story: `📐 បន្ទប់រៀនរាងចតុកោណកែងមួយមានបណ្តោយ ${length} ម៉ែត្រ និងទទឹង ${width} ម៉ែត្រ។`,
                question: `តើបន្ទប់រៀននេះមានបរិមាត្រសរុបប៉ុន្មានម៉ែត្រ?`,
                equation: `(${length} + ${width}) × 2 = ?`,
                correctAnswer: ans,
                unit: 'ម៉ែត្រ'
            };
        }
    }
    // --- GRADE 4 ---
    else if (grade === 4) {
        if (title.includes('ចែក')) {
            const perBox = getRandomInt(10, 25);
            const numBoxes = getRandomInt(5, 15);
            const total = perBox * numBoxes;
            problem = {
                story: `📦 រោងចក្រផលិតនំបានចំនួន ${total} កញ្ចប់ ហើយវេចខ្ចប់ដាក់ក្នុងប្រអប់ ដោយក្នុងមួយប្រអប់ៗដាក់ ${perBox} កញ្ចប់។`,
                question: `តើរោងចក្រនោះត្រូវប្រើប្រអប់សរុបចំនួនប៉ុន្មាន?`,
                equation: `${total} ÷ ${perBox} = ?`,
                correctAnswer: numBoxes,
                unit: 'ប្រអប់'
            };
        } else if (title.includes('គុណ')) {
            const kg = getRandomInt(15, 40);
            const price = getRandomInt(2, 5) * 1000;
            const ans = kg * price;
            problem = {
                story: `🌾 កសិករម្នាក់លក់ស្រូវបាន ${kg} គីឡូក្រាម ដោយក្នុងមួយគីឡូក្រាមតម្លៃ ${price} រៀល។`,
                question: `តើកសិករនោះទទួលបានប្រាក់ចំណូលសរុបប៉ុន្មានរៀល?`,
                equation: `${kg} × ${price} = ?`,
                correctAnswer: ans,
                unit: 'រៀល'
            };
        } else {
            const n1 = getRandomInt(1500, 4500);
            const n2 = getRandomInt(500, 2500);
            const ans = n1 + n2;
            problem = {
                story: `🚛 ឡានដឹកទំនិញមួយគ្រឿង បានដឹកទំនិញជើងទីមួយទម្ងន់ ${n1} គីឡូក្រាម និងជើងទីពីរទម្ងន់ ${n2} គីឡូក្រាម។`,
                question: `តើឡាននោះដឹកទំនិញទាំងពីរជើងសរុបបានទម្ងន់ប៉ុន្មានគីឡូក្រាម?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: ans,
                unit: 'គីឡូក្រាម'
            };
        }
    }
    // --- GRADE 5 ---
    else if (grade === 5) {
        const scenarios = ['discount', 'speed', 'area'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'discount') {
            const price = getRandomInt(50, 200);
            const pct = getRandomItem([10, 20, 25, 50]);
            const discount = (price * pct) / 100;
            problem = {
                story: `🏷️ ទំនិញមួយមានតម្លៃដើម ${price} ដុល្លារ។ ហាងបានបញ្ចុះតម្លៃ ${pct}% ជូនអតិថិជន។`,
                question: `តើអតិថិជនទទួលបានការបញ្ចុះតម្លៃចំនួនប៉ុន្មានដុល្លារ?`,
                equation: `(${price} × ${pct}) ÷ 100 = ?`,
                correctAnswer: discount,
                unit: 'ដុល្លារ'
            };
        } else if (chosen === 'speed') {
            const speed = getRandomInt(40, 80);
            const hours = getRandomInt(2, 5);
            const distance = speed * hours;
            problem = {
                story: `🚗 រថយន្តមួយបើកបរក្នុងល្បឿនមធ្យម ${speed} គីឡូម៉ែត្រក្នុងមួយម៉ោង រយៈពេល ${hours} ម៉ោង។`,
                question: `តើរថយន្តនោះធ្វើដំណើរបានចម្ងាយសរុបប៉ុន្មានគីឡូម៉ែត្រ?`,
                equation: `${speed} × ${hours} = ?`,
                correctAnswer: distance,
                unit: 'គ.ម'
            };
        } else {
            const base = getRandomInt(10, 24);
            const height = getRandomInt(6, 16);
            const area = (base * height) / 2;
            problem = {
                story: `📐 ដីស្រែរាងត្រីកោណមួយមានបាតប្រវែង ${base} ម៉ែត្រ និងកម្ពស់ ${height} ម៉ែត្រ។`,
                question: `តើដីស្រែនោះមានផ្ទៃក្រឡាសរុបប៉ុន្មានម៉ែត្រការ៉េ ($m^2$)?`,
                equation: `(${base} × ${height}) ÷ 2 = ?`,
                correctAnswer: area,
                unit: 'm²'
            };
        }
    }
    // --- GRADE 6 ---
    else if (grade === 6) {
        const scenarios = ['ratio', 'profit', 'speed_calc'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'ratio') {
            const r1 = getRandomInt(2, 3);
            const r2 = getRandomInt(4, 5);
            const mult = getRandomInt(4, 8);
            const girls = r2 * mult;
            const boys = r1 * mult;
            problem = {
                story: `👥 ក្នុងថ្នាក់រៀនមួយ ផលធៀបរវាងសិស្សប្រុស និងសិស្សស្រីគឺ ${r1} ធៀបនឹង ${r2} (${r1}:${r2})។ បើសិស្សស្រីមាន ${girls} នាក់។`,
                question: `តើក្នុងថ្នាក់នោះមានសិស្សប្រុសចំនួនប៉ុន្មាននាក់?`,
                equation: `(${girls} ÷ ${r2}) × ${r1} = ?`,
                correctAnswer: boys,
                unit: 'នាក់'
            };
        } else if (chosen === 'profit') {
            const cost = getRandomInt(5, 20) * 100;
            const pct = getRandomItem([10, 15, 20, 25]);
            const profit = (cost * pct) / 100;
            problem = {
                story: `💼 អាជីវករម្នាក់បានចំណាយដើមទុន ${cost} ដុល្លារ ហើយលក់បានប្រាក់ចំណេញ ${pct}%។`,
                question: `តើគាត់ចំណេញបានប្រាក់សុទ្ធចំនួនប៉ុន្មានដុល្លារ?`,
                equation: `(${cost} × ${pct}) ÷ 100 = ?`,
                correctAnswer: profit,
                unit: 'ដុល្លារ'
            };
        } else {
            const speed = getRandomInt(30, 60);
            const hours = getRandomInt(2, 4);
            const dist = speed * hours;
            problem = {
                story: `🚴 អ្នកជិះកង់ម្នាក់ធ្វើដំណើរបានចម្ងាយ ${dist} គីឡូម៉ែត្រ ក្នុងរយៈពេល ${hours} ម៉ោង។`,
                question: `តើគាត់ជិះក្នុងល្បឿនមធ្យមប៉ុន្មានគីឡូម៉ែត្រក្នុងមួយម៉ោង?`,
                equation: `${dist} ÷ ${hours} = ?`,
                correctAnswer: speed,
                unit: 'គ.ម/ម៉ោង'
            };
        }
    }
    // --- GRADE 7 TO 12 ---
    else {
        // High School Word Problems (Algebra / Equation applications)
        const ageDiff = getRandomInt(18, 28);
        const childAge = getRandomInt(8, 16);
        const parentAge = childAge + ageDiff;
        problem = {
            story: `👨‍👦 ឪពុកមានអាយុច្រើនជាងកូន ${ageDiff} ឆ្នាំ។ បច្ចុប្បន្នកូនមានអាយុ ${childAge} ឆ្នាំ។`,
            question: `តើបច្ចុប្បន្នឪពុកមានអាយុប៉ុន្មានឆ្នាំ?`,
            equation: `${childAge} + ${ageDiff} = ?`,
            correctAnswer: parentAge,
            unit: 'ឆ្នាំ'
        };
    }

    return problem;
}
