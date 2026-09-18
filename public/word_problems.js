// K-12 Khmer Mathematics Word Problem Engine (ម៉ាស៊ីនបង្កើតចំណោទគណិតវិទ្យាភាសាខ្មែរតាមកម្រិតស្មុគស្មាញ)
// Implements Graduated Cognitive Complexity (ZPD) from Grade 1 to 12!

const KHMER_NAMES = ['តារា', 'សុខ', 'បូរី', 'ចិន្តា', 'វិចិត្រ', 'ធីតា', 'រតនា', 'ពិសិដ្ឋ', 'សុវណ្ណ', 'សុភាព', 'មករា', 'កល្យាណ', 'កញ្ញា', 'ចាន់ណា', 'ស្រីនាង'];
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

// Generate a graduated, non-repeating Word Problem based on Grade Complexity
function generateWordProblem(grade, lessonTitle) {
    const title = lessonTitle || '';
    const name1 = getRandomItem(KHMER_NAMES);
    let name2 = getRandomItem(KHMER_NAMES);
    while (name2 === name1) name2 = getRandomItem(KHMER_NAMES);
    const giver = getRandomItem(KHMER_GIVERS);
    const item = getRandomItem(KHMER_ITEMS);

    let problem = null;

    // ==========================================
    // ថ្នាក់ទី ១ (កម្រិត ១ ជំហាន៖ បូក-ដកសាមញ្ញក្នុងរង្វង់ ១០-២០)
    // ==========================================
    if (grade === 1) {
        const isAdd = title.includes('បូក') || (title.includes('ដក') ? false : Math.random() > 0.5);
        if (isAdd) {
            const n1 = getRandomInt(2, 6);
            const n2 = getRandomInt(1, 4);
            problem = {
                story: `${item.icon} ${name1} មាន${item.name}ចំនួន ${n1} ${item.unit}។ ${giver}បានឱ្យ ${n2} ${item.unit}បន្ថែមទៀត។`,
                question: `តើ${name1}មាន${item.name}សរុបទាំងអស់ប៉ុន្មាន${item.unit}?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: n1 + n2,
                unit: item.unit
            };
        } else {
            const n1 = getRandomInt(5, 10);
            const n2 = getRandomInt(1, n1 - 1);
            problem = {
                story: `${item.icon} ${name1} មាន${item.name}ចំនួន ${n1} ${item.unit}។ គាត់បានញ៉ាំអស់ ${n2} ${item.unit}។`,
                question: `តើ${name1}នៅសល់${item.name}ចំនួនប៉ុន្មាន${item.unit}?`,
                equation: `${n1} - ${n2} = ?`,
                correctAnswer: n1 - n2,
                unit: item.unit
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ២ (កម្រិត ១-២ ជំហាន៖ គុណ ចែក និងរូបិយវត្ថុរៀល)
    // ==========================================
    else if (grade === 2) {
        const scenarios = ['mult', 'div', 'money', 'compare'];
        const chosen = title.includes('ចែក') ? 'div' : (title.includes('គុណ') ? 'mult' : getRandomItem(scenarios));

        if (chosen === 'mult') {
            const boxes = getRandomInt(2, 5);
            const perBox = getRandomInt(3, 6);
            problem = {
                story: `📦 ${name1} ទិញ${item.name}ចំនួន ${boxes} ប្រអប់។ ក្នុងមួយប្រអប់មាន ${perBox} ${item.unit}។`,
                question: `តើ${name1}ទិញបាន${item.name}សរុបទាំងអស់ប៉ុន្មាន${item.unit}?`,
                equation: `${boxes} × ${perBox} = ?`,
                correctAnswer: boxes * perBox,
                unit: item.unit
            };
        } else if (chosen === 'div') {
            const friends = getRandomInt(2, 4);
            const perFriend = getRandomInt(2, 6);
            const total = friends * perFriend;
            problem = {
                story: `${item.icon} ${name1} មាន${item.name}ចំនួន ${total} ${item.unit}។ គាត់ចែកស្មើៗគ្នាឱ្យមិត្តភក្តិ ${friends} នាក់។`,
                question: `តើមិត្តម្នាក់ៗទទួលបាន${item.name}ចំនួនប៉ុន្មាន${item.unit}?`,
                equation: `${total} ÷ ${friends} = ?`,
                correctAnswer: perFriend,
                unit: item.unit
            };
        } else if (chosen === 'money') {
            const n1 = getRandomInt(2, 6) * 100;
            const n2 = getRandomInt(1, 4) * 100;
            problem = {
                story: `💵 ${name1} មានលុយ ${n1} រៀល។ ${giver}ឱ្យថែម ${n2} រៀលទៀត។`,
                question: `តើ${name1}មានប្រាក់សរុបទាំងអស់ប៉ុន្មានរៀល?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: n1 + n2,
                unit: 'រៀល'
            };
        } else {
            const n1 = getRandomInt(40, 80);
            const n2 = getRandomInt(10, 30);
            problem = {
                story: `🏫 ក្នុងបណ្ណាល័យមានសៀវភៅគណិតវិទ្យា ${n1} ក្បាល និងសៀវភៅអក្សរសាស្ត្រ ${n2} ក្បាល។`,
                question: `តើបណ្ណាល័យមានសៀវភៅទាំងពីរមុខសរុបប៉ុន្មានក្បាល?`,
                equation: `${n1} + ${n2} = ?`,
                correctAnswer: n1 + n2,
                unit: 'ក្បាល'
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ៣ (កម្រិត ២ ជំហាន៖ ទិញទំនិញចម្រុះមុខ + អាប់ប្រាក់ + បរិមាត្រ)
    // ==========================================
    else if (grade === 3) {
        const scenarios = ['change_calc', 'mixed_shopping', 'broken_items', 'perimeter'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'change_calc') {
            // Multi-step: Buy items, pay with larger bill, find change
            const itemPrice = getRandomInt(2, 4) * 500;
            const qty = getRandomInt(2, 3);
            const totalCost = itemPrice * qty;
            const paid = (Math.floor(totalCost / 5000) + 1) * 5000;
            const change = paid - totalCost;
            problem = {
                story: `🛒 ${name1} ទិញសៀវភៅចំនួន ${qty} ក្បាល (មួយក្បាលតម្លៃ ${itemPrice} រៀល)។ គាត់បានហុចប្រាក់ ${paid} រៀលឱ្យអ្នកលក់។`,
                question: `តើអ្នកលក់ត្រូវអាប់ប្រាក់ឱ្យ${name1}វិញចំនួនប៉ុន្មានរៀល?`,
                equation: `${paid} - (${qty} × ${itemPrice}) = ?`,
                correctAnswer: change,
                unit: 'រៀល'
            };
        } else if (chosen === 'broken_items') {
            // Multi-step: Total collected - broken items, then distribute equally
            const perBasket = getRandomInt(4, 8);
            const baskets = getRandomInt(3, 5);
            const broken = getRandomInt(2, 6);
            const totalGood = perBasket * baskets;
            const initialTotal = totalGood + broken;
            problem = {
                story: `🧺 ចម្ការមួយប្រមូល${item.name}បាន ${initialTotal} ${item.unit} តែខូចអស់ ${broken} ${item.unit}។ ${item.name}ដែលនៅល្អ គេច្រកស្មើៗគ្នាចូលក្នុង ${baskets} កន្ត្រក។`,
                question: `តើក្នុងមួយកន្ត្រកៗមាន${item.name}ចំនួនប៉ុន្មាន${item.unit}?`,
                equation: `(${initialTotal} - ${broken}) ÷ ${baskets} = ?`,
                correctAnswer: perBasket,
                unit: item.unit
            };
        } else if (chosen === 'perimeter') {
            const length = getRandomInt(12, 25);
            const width = getRandomInt(6, length - 4);
            const perim = (length + width) * 2;
            problem = {
                story: `📐 បន្ទប់រៀនរាងចតុកោណកែងមួយមានបណ្តោយ ${length} ម៉ែត្រ និងទទឹង ${width} ម៉ែត្រ។`,
                question: `តើបន្ទប់រៀននេះមានបរិមាត្រសរុបប៉ុន្មានម៉ែត្រ?`,
                equation: `(${length} + ${width}) × 2 = ?`,
                correctAnswer: perim,
                unit: 'ម៉ែត្រ'
            };
        } else {
            const p1 = getRandomInt(1, 3) * 1000;
            const p2 = getRandomInt(2, 4) * 1000;
            problem = {
                story: `🛍️ ${name1} ទិញប៊ិចអស់ ${p1} រៀល និងទិញសៀវភៅគំនូរអស់ ${p2} រៀល។ គាត់មានប្រាក់សរុប ១០,០០០ រៀល។`,
                question: `តើបន្ទាប់ពីទិញរួច ${name1} នៅសល់ប្រាក់ប៉ុន្មានរៀល?`,
                equation: `10000 - (${p1} + ${p2}) = ?`,
                correctAnswer: 10000 - (p1 + p2),
                unit: 'រៀល'
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ៤ (កម្រិត ២ ជំហានកម្រិតខ្ពស់៖ ចែកលេខច្រើនខ្ទង់ ទម្ងន់ និងផលបូកចម្រុះ)
    // ==========================================
    else if (grade === 4) {
        if (title.includes('ចែក')) {
            const perBox = getRandomInt(15, 30);
            const boxes = getRandomInt(6, 14);
            const total = perBox * boxes;
            problem = {
                story: `📦 រោងចក្រផលិតនំបាន ${total} កញ្ចប់ ហើយវេចខ្ចប់ស្មើៗគ្នាដាក់ក្នុងប្រអប់ ដោយមួយប្រអប់ៗដាក់ ${perBox} កញ្ចប់។`,
                question: `តើរោងចក្រត្រូវប្រើប្រអប់សរុបចំនួនប៉ុន្មាន?`,
                equation: `${total} ÷ ${perBox} = ?`,
                correctAnswer: boxes,
                unit: 'ប្រអប់'
            };
        } else {
            // Multi-step: Buy multiple kilos at a price per kilo, plus shipping
            const kg = getRandomInt(10, 25);
            const pricePerKg = getRandomInt(2, 4) * 1000;
            const shipping = 2000;
            const total = (kg * pricePerKg) + shipping;
            problem = {
                story: `🌾 កសិករទិញជីកសិកម្មចំនួន ${kg} គីឡូក្រាម (មួយគីឡូតម្លៃ ${pricePerKg} រៀល) និងត្រូវចំណាយថ្លៃដឹកជញ្ជូន ${shipping} រៀលទៀត។`,
                question: `តើគាត់ត្រូវចំណាយប្រាក់សរុបទាំងអស់ប៉ុន្មានរៀល?`,
                equation: `(${kg} × ${pricePerKg}) + ${shipping} = ?`,
                correctAnswer: total,
                unit: 'រៀល'
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ៥ (កម្រិត ៣ ជំហាន៖ ភាគរយ % បញ្ចុះតម្លៃ របងដកទ្វារ និងល្បឿនចម្ងាយ)
    // ==========================================
    else if (grade === 5) {
        const scenarios = ['fence_gate', 'discount_mult', 'speed_trip'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'fence_gate') {
            // Complex Geometry: Perimeter minus gate opening
            const length = getRandomInt(30, 60);
            const width = getRandomInt(15, 30);
            const gate = getRandomInt(4, 6);
            const totalFence = ((length + width) * 2) - gate;
            problem = {
                story: `🏡 ដីឡូតិ៍រាងចតុកោណកែងមួយមានបណ្តោយ ${length} ម៉ែត្រ និងទទឹង ${width} ម៉ែត្រ។ ម្ចាស់ដីចង់ធ្វើរបងព័ទ្ធជុំវិញ ដោយទុកច្រកទ្វារចូលប្រវែង ${gate} ម៉ែត្រ។`,
                question: `តើរបងដែលត្រូវសាងសង់មានប្រវែងសរុបប៉ុន្មានម៉ែត្រ?`,
                equation: `(${length} + ${width}) × 2 - ${gate} = ?`,
                correctAnswer: totalFence,
                unit: 'ម៉ែត្រ'
            };
        } else if (chosen === 'discount_mult') {
            // Multi-step percentage: item cost, discount, buying multiple
            const originalPrice = getRandomInt(4, 10) * 10;
            const pct = 20;
            const discountedPrice = originalPrice - (originalPrice * pct / 100);
            const qty = 2;
            const totalCost = discountedPrice * qty;
            problem = {
                story: `🏷️ កាតាបមួយតម្លៃដើម ${originalPrice} ដុល្លារ។ ហាងបញ្ចុះតម្លៃ ${pct}%។ ${name1} ទិញកាតាបនោះចំនួន ${qty}។`,
                question: `តើ${name1}ត្រូវបង់ប្រាក់សរុបចំនួនប៉ុន្មានដុល្លារ?`,
                equation: `(${originalPrice} - ${originalPrice * pct / 100}) × ${qty} = ?`,
                correctAnswer: totalCost,
                unit: 'ដុល្លារ'
            };
        } else {
            const speed = getRandomInt(50, 70);
            const hours = getRandomInt(2, 4);
            const dist = speed * hours;
            problem = {
                story: `🚗 រថយន្តមួយចេញដំណើរពីភ្នំពេញទៅកំពង់សោម ដោយបើកបរក្នុងល្បឿនមធ្យម ${speed} គ.ម/ម៉ោង រយៈពេល ${hours} ម៉ោងទើបដល់។`,
                question: `តើចម្ងាយផ្លូវធ្វើដំណើរមានសរុបប៉ុន្មានគីឡូម៉ែត្រ?`,
                equation: `${speed} × ${hours} = ?`,
                correctAnswer: dist,
                unit: 'គ.ម'
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ៦ (កម្រិត ៣ ជំហាន៖ សមាមាត្រ Ratios ដើមទុន-ចំណេញ និងពេលធ្វើដំណើរ)
    // ==========================================
    else if (grade === 6) {
        const scenarios = ['ratio_total', 'commercial_profit', 'elapsed_time_speed'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'ratio_total') {
            // Ratio multi-step: Ratio 3:5, find total students given one group
            const rBoys = 3;
            const rGirls = 5;
            const multiplier = getRandomInt(4, 7);
            const boys = rBoys * multiplier;
            const totalStudents = (rBoys + rGirls) * multiplier;
            problem = {
                story: `👥 ក្នុងក្លឹបសិក្សាមួយ ផលធៀបរវាងសិស្សប្រុស និងសិស្សស្រីគឺ ${rBoys}:${rGirls}។ ប្រសិនបើមានសិស្សប្រុសចំនួន ${boys} នាក់។`,
                question: `តើក្លឹបសិក្សានោះមានសិស្សទាំងអស់សរុបប៉ុន្មាននាក់?`,
                equation: `(${boys} ÷ ${rBoys}) × (${rBoys} + ${rGirls}) = ?`,
                correctAnswer: totalStudents,
                unit: 'នាក់'
            };
        } else if (chosen === 'commercial_profit') {
            const costPerUnit = getRandomInt(10, 25);
            const units = getRandomInt(4, 8);
            const totalCost = costPerUnit * units;
            const profitPct = 20;
            const totalRevenue = totalCost + (totalCost * profitPct / 100);
            problem = {
                story: `💼 អាជីវករទិញទំនិញ ${units} គ្រឿង ក្នុងតម្លៃដើម ${costPerUnit} ដុល្លារក្នុងមួយគ្រឿង។ គាត់លក់ចេញទាំងអស់វិញដោយទទួលបានប្រាក់ចំណេញ ${profitPct}%។`,
                question: `តើគាត់លក់ទំនិញទាំងអស់នោះបានប្រាក់សរុបប៉ុន្មានដុល្លារ?`,
                equation: `(${units} × ${costPerUnit}) + 20% = ?`,
                correctAnswer: totalRevenue,
                unit: 'ដុល្លារ'
            };
        } else {
            // Time elapsed & distance
            const startHour = 7;
            const endHour = getRandomInt(9, 11);
            const elapsed = endHour - startHour;
            const speed = 60;
            const dist = speed * elapsed;
            problem = {
                story: `🚌 ឡានក្រុងចេញដំណើរម៉ោង ${startHour}:០០ ព្រឹក និងដល់គោលដៅម៉ោង ${endHour}:០០ ថ្ងៃត្រង់ ដោយបើកបរក្នុងល្បឿនថេរ ${speed} គ.ម/ម៉ោង។`,
                question: `តើចម្ងាយផ្លូវដែលឡានក្រុងបានធ្វើដំណើរមានប៉ុន្មានគីឡូម៉ែត្រ?`,
                equation: `(${endHour} - ${startHour}) × ${speed} = ?`,
                correctAnswer: dist,
                unit: 'គ.ម'
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ៧ - ៩ (អនុវិទ្យាល័យ៖ ចំណោទសមីការពិជគណិត ចំណោទជើងសត្វ និងល្បឿនផ្ទុយទិស)
    // ==========================================
    else if (grade <= 9) {
        const scenarios = ['chicken_pig', 'age_problem', 'opposite_motion'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'chicken_pig') {
            // Classic System of Equations: 2x + 4y = Legs, x + y = Heads
            const pigs = getRandomInt(6, 12);
            const chickens = getRandomInt(8, 15);
            const totalAnimals = pigs + chickens;
            const totalLegs = (chickens * 2) + (pigs * 4);
            problem = {
                story: `🐖 ក្នុងកសិដ្ឋានមួយមានមាន់ (ជើង ២) និងជ្រូក (ជើង ៤) សរុប ${totalAnimals} ក្បាល។ បើរាប់ជើងសរុបឃើញមាន ${totalLegs} ជើង។`,
                question: `តើក្នុងកសិដ្ឋាននោះមានជ្រូកចំនួនប៉ុន្មានក្បាល?`,
                equation: `2x + 4y = ${totalLegs}, x + y = ${totalAnimals}`,
                correctAnswer: pigs,
                unit: 'ក្បាល'
            };
        } else if (chosen === 'age_problem') {
            // Age equation: in Y years, parent is twice child's age
            const childAge = getRandomInt(10, 16);
            const diff = getRandomInt(20, 26);
            const parentAge = childAge + diff;
            const yearsLater = diff - childAge;
            problem = {
                story: `👨‍👦 បច្ចុប្បន្ន ម្តាយមានអាយុច្រើនជាងកូន ${diff} ឆ្នាំ។ បច្ចុប្បន្នកូនមានអាយុ ${childAge} ឆ្នាំ។`,
                question: `តើបច្ចុប្បន្ន ម្តាយមានអាយុប៉ុន្មានឆ្នាំ?`,
                equation: `${childAge} + ${diff} = ?`,
                correctAnswer: parentAge,
                unit: 'ឆ្នាំ'
            };
        } else {
            // Opposite motion meeting point: d = (v1 + v2) * t
            const speedA = getRandomInt(45, 60);
            const speedB = getRandomInt(55, 70);
            const hours = getRandomInt(2, 4);
            const totalDist = (speedA + speedB) * hours;
            problem = {
                story: `🚗 ទីក្រុង A និង B មានចម្ងាយ ${totalDist} គ.ម។ រថយន្តទី១ ចេញពី A ក្នុងល្បឿន ${speedA} គ.ម/ម៉ោង ហើយរថយន្តទី២ ចេញពី B ក្នុងល្បឿន ${speedB} គ.ម/ម៉ោង បើកសំដៅរកគ្នា។`,
                question: `តើរយៈពេលប៉ុន្មានម៉ោងទើបរថយន្តទាំងពីរជួបគ្នា?`,
                equation: `${totalDist} ÷ (${speedA} + ${speedB}) = ?`,
                correctAnswer: hours,
                unit: 'ម៉ោង'
            };
        }
    }

    // ==========================================
    // ថ្នាក់ទី ១០ - ១២ (វិទ្យាល័យ៖ ប្រូបាប៊ីលីតេ បន្សំ និងចំណោទអតិបរមា)
    // ==========================================
    else {
        const scenarios = ['probability_comb', 'arithmetic_savings', 'max_area'];
        const chosen = getRandomItem(scenarios);

        if (chosen === 'probability_comb') {
            // Combination C(n, 2) = n*(n-1)/2
            const blueBalls = getRandomInt(4, 7);
            const redBalls = getRandomInt(3, 5);
            const ways = (blueBalls * (blueBalls - 1)) / 2;
            problem = {
                story: `🎲 ក្នុងប្រអប់មួយមានបាល់ពណ៌ខៀវ ${blueBalls} និងបាល់ពណ៌ក្រហម ${redBalls}។ គេចាប់យកបាល់ ២ គ្រាប់ព្រមគ្នាដោយចៃដន្យ។`,
                question: `តើមានប៉ុន្មានរបៀបដើម្បីចាប់បានបាល់ពណ៌ខៀវទាំង ២ គ្រាប់?`,
                equation: `C(${blueBalls}, 2) = (${blueBalls} × ${blueBalls - 1}) ÷ 2`,
                correctAnswer: ways,
                unit: 'របៀប'
            };
        } else if (chosen === 'arithmetic_savings') {
            // Arithmetic sequence: u_n = u1 + (n-1)*d
            const u1 = 10;
            const d = 5;
            const month = getRandomInt(5, 8);
            const ans = u1 + (month - 1) * d;
            problem = {
                story: `💰 ${name1} សន្សំប្រាក់ជារៀងរាល់ខែ។ ខែទី១ គាត់សន្សំបាន ${u1}$ ហើយខែបន្តបន្ទាប់ទៀត គាត់សន្សំកើនឡើង ${d}$ ក្នុងមួយខែ។`,
                question: `តើនៅខែទី ${month} គាត់សន្សំបានប្រាក់ចំនួនប៉ុន្មានដុល្លារ?`,
                equation: `u_${month} = ${u1} + (${month} - 1) × ${d}`,
                correctAnswer: ans,
                unit: 'ដុល្លារ'
            };
        } else {
            // Optimization: rectangle with perimeter P has max area when x = P/4
            const perim = getRandomInt(6, 12) * 4;
            const side = perim / 4;
            problem = {
                story: `📐 កសិករម្នាក់មានសំណាញ់របងប្រវែង ${perim} ម៉ែត្រ សម្រាប់ព័ទ្ធសួនបន្លែរាងចតុកោណកែងឱ្យបានផ្ទៃក្រឡាធំបំផុត។`,
                question: `តើគាត់ត្រូវធ្វើសួនបន្លែនោះមានបណ្តោយប្រវែងប៉ុន្មានម៉ែត្រ?`,
                equation: `x = ${perim} ÷ 4`,
                correctAnswer: side,
                unit: 'ម៉ែត្រ'
            };
        }
    }

    return problem;
}
