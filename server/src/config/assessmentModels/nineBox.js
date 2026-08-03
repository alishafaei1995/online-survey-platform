// Illustrative 9-box grid model inspired by the public-domain performance/potential
// talent-review concept. Items, wording, thresholds and cell labels below are authored
// for this project — not a reproduction of any commercial vendor's instrument.
import { likertItemToQuestion } from './shared.js';

const items = [
  {
    key: 'p1',
    text: {
      fa: 'این فرد به‌طور مستمر اهداف و شاخص‌های عملکردی خود را محقق می‌کند.',
      en: 'This person consistently meets their performance goals and targets.',
    },
    scoring: [{ dimension: 'performance', weight: 1, reverse: false }],
  },
  {
    key: 'p2',
    text: { fa: 'کیفیت کار این فرد در سطح بالایی است.', en: "The quality of this person's work is consistently high." },
    scoring: [{ dimension: 'performance', weight: 1, reverse: false }],
  },
  {
    key: 'p3',
    text: {
      fa: 'این فرد در مدیریت زمان و اولویت‌بندی وظایف مؤثر عمل می‌کند.',
      en: 'This person manages time and priorities effectively.',
    },
    scoring: [{ dimension: 'performance', weight: 1, reverse: false }],
  },
  {
    key: 't1',
    text: { fa: 'این فرد توانایی یادگیری سریع مهارت‌های جدید را دارد.', en: 'This person learns new skills quickly.' },
    scoring: [{ dimension: 'potential', weight: 1, reverse: false }],
  },
  {
    key: 't2',
    text: {
      fa: 'این فرد آمادگی پذیرش مسئولیت‌های بزرگ‌تر را دارد.',
      en: 'This person is ready to take on greater responsibility.',
    },
    scoring: [{ dimension: 'potential', weight: 1, reverse: false }],
  },
  {
    key: 't3',
    text: {
      fa: 'این فرد در موقعیت‌های چالش‌برانگیز رشد و پیشرفت می‌کند.',
      en: 'This person grows and develops well under challenging situations.',
    },
    scoring: [{ dimension: 'potential', weight: 1, reverse: false }],
  },
];

// Splits the 1–5 average into three equal bands.
const LOW_MAX = 1 + 4 / 3; // 2.33
const MID_MAX = 1 + 8 / 3; // 3.67

const CELL_LABELS = {
  low_low: { fa: 'نیازمند توسعه فوری', en: 'Needs Immediate Development' },
  low_mid: { fa: 'پتانسیل نیازمند حمایت', en: 'Potential Needing Support' },
  low_high: { fa: 'استعداد ناشناخته', en: 'Hidden Talent' },
  mid_low: { fa: 'عملکرد ثابت', en: 'Steady Performer' },
  mid_mid: { fa: 'هسته اصلی تیم', en: 'Core Contributor' },
  mid_high: { fa: 'ستاره در حال ظهور', en: 'Rising Star' },
  high_low: { fa: 'متخصص قابل اعتماد', en: 'Trusted Expert' },
  high_mid: { fa: 'عملکرد برتر', en: 'High Performer' },
  high_high: { fa: 'ستاره سازمان', en: 'Organization Star' },
};

const nineBox = {
  key: 'nine_box',
  version: 1,
  name: { fa: 'ماتریس ۹-باکس (9-Box Grid)', en: '9-Box Grid' },
  description: {
    fa: 'ارزیابی مدیر از یک کارمند در دو محور عملکرد و پتانسیل، برای جانمایی در ماتریس ۹-باکس استعداد.',
    en: "A manager's rating of an employee across performance and potential, placed on a 9-box talent grid.",
  },
  identitySource: 'participant_invite',
  granularity: 'per_respondent',
  dimensions: [
    { key: 'performance', name: { fa: 'عملکرد', en: 'Performance' }, color: '#2f6fa8' },
    { key: 'potential', name: { fa: 'پتانسیل', en: 'Potential' }, color: '#5da23a' },
  ],
  items,
  scoring: { method: 'average' },
  derived: [
    {
      key: 'quadrant',
      type: 'quadrantLookup',
      xDimension: 'potential',
      yDimension: 'performance',
      bands: [
        { max: LOW_MAX, key: 'low' },
        { max: MID_MAX, key: 'mid' },
        { max: Infinity, key: 'high' },
      ],
      grid: CELL_LABELS,
    },
  ],
  chart: { type: 'quadrantScatter', xDimension: 'potential', yDimension: 'performance' },
  buildQuestions() {
    return items.map((item, idx) => likertItemToQuestion(item, idx));
  },
};

export default nineBox;
