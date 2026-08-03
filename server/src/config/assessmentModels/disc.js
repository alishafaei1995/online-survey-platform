// Illustrative behavioral-style model inspired by the public-domain D-I-S-C concept
// (Dominance / Influence / Steadiness / Conscientiousness). Items, wording and scoring
// below are authored for this project — not a reproduction of any commercial vendor's
// item bank or proprietary algorithm.
import { likertItemToQuestion } from './shared.js';

const items = [
  {
    key: 'd1',
    text: { fa: 'در تصمیم‌گیری‌ها معمولاً قاطع و سریع عمل می‌کنم.', en: 'I tend to make decisions quickly and decisively.' },
    scoring: [{ dimension: 'D', weight: 1, reverse: false }],
  },
  {
    key: 'd2',
    text: { fa: 'دوست دارم کنترل و هدایت کارها را بر عهده بگیرم.', en: 'I like to take charge and direct the work.' },
    scoring: [{ dimension: 'D', weight: 1, reverse: false }],
  },
  {
    key: 'd3',
    text: { fa: 'در مواجهه با چالش، مستقیم و رقابتی برخورد می‌کنم.', en: 'I approach challenges directly and competitively.' },
    scoring: [{ dimension: 'D', weight: 1, reverse: false }],
  },
  {
    key: 'i1',
    text: { fa: 'برقراری ارتباط با افراد جدید برایم لذت‌بخش است.', en: 'I enjoy meeting and talking to new people.' },
    scoring: [{ dimension: 'I', weight: 1, reverse: false }],
  },
  {
    key: 'i2',
    text: { fa: 'معمولاً با انرژی و اشتیاق زیاد صحبت می‌کنم.', en: 'I usually speak with a lot of energy and enthusiasm.' },
    scoring: [{ dimension: 'I', weight: 1, reverse: false }],
  },
  {
    key: 'i3',
    text: { fa: 'ترغیب و متقاعد کردن دیگران برایم آسان است.', en: 'Persuading and motivating others comes easily to me.' },
    scoring: [{ dimension: 'I', weight: 1, reverse: false }],
  },
  {
    key: 's1',
    text: { fa: 'ثبات و روال مشخص در کار برایم اهمیت دارد.', en: 'Stability and a predictable routine matter to me at work.' },
    scoring: [{ dimension: 'S', weight: 1, reverse: false }],
  },
  {
    key: 's2',
    text: { fa: 'در کار گروهی صبور و حامی همکارانم هستم.', en: "I'm patient and supportive of my teammates." },
    scoring: [{ dimension: 'S', weight: 1, reverse: false }],
  },
  {
    key: 's3',
    text: { fa: 'ترجیح می‌دهم پیش از هر تغییر، کاملاً آماده و مطمئن شوم.', en: 'I prefer to feel fully prepared before embracing change.' },
    scoring: [{ dimension: 'S', weight: 1, reverse: false }],
  },
  {
    key: 'c1',
    text: { fa: 'به جزئیات و دقت در انجام کار اهمیت زیادی می‌دهم.', en: 'I pay close attention to detail and accuracy.' },
    scoring: [{ dimension: 'C', weight: 1, reverse: false }],
  },
  {
    key: 'c2',
    text: { fa: 'قبل از تصمیم‌گیری، اطلاعات را با دقت بررسی می‌کنم.', en: 'I carefully analyze information before deciding.' },
    scoring: [{ dimension: 'C', weight: 1, reverse: false }],
  },
  {
    key: 'c3',
    text: { fa: 'رعایت قوانین و استانداردهای کاری برایم مهم است.', en: 'Following rules and standards is important to me.' },
    scoring: [{ dimension: 'C', weight: 1, reverse: false }],
  },
];

const disc = {
  key: 'disc',
  version: 1,
  name: { fa: 'رفتارشناسی دیسک (DiSC)', en: 'DiSC Behavioral Style' },
  description: {
    fa: 'یک نظرسنجی خودارزیابی برای شناسایی سبک رفتاری غالب فرد در چهار بعد قاطعیت، تأثیرگذاری، ثبات و دقت.',
    en: 'A self-report survey identifying dominant behavioral style across four dimensions: Dominance, Influence, Steadiness, Conscientiousness.',
  },
  identitySource: 'anonymous',
  granularity: 'aggregate',
  dimensions: [
    { key: 'D', name: { fa: 'قاطعیت', en: 'Dominance' }, color: '#c0392b' },
    { key: 'I', name: { fa: 'تأثیرگذاری', en: 'Influence' }, color: '#e6a817' },
    { key: 'S', name: { fa: 'ثبات', en: 'Steadiness' }, color: '#5da23a' },
    { key: 'C', name: { fa: 'دقت', en: 'Conscientiousness' }, color: '#2f6fa8' },
  ],
  items,
  scoring: { method: 'average' },
  derived: [{ key: 'dominantStyle', type: 'top1' }],
  chart: { type: 'radar' },
  buildQuestions() {
    return items.map((item, idx) => likertItemToQuestion(item, idx));
  },
};

export default disc;
