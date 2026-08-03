// Standard 5-point agreement scale reused by every self-authored assessment-model item.
// Values are plain '1'..'5' strings so scoringService can read them as ordinal numbers directly.
export const LIKERT5_OPTIONS = [
  { value: '1', label: { fa: 'کاملاً مخالفم', en: 'Strongly disagree' } },
  { value: '2', label: { fa: 'مخالفم', en: 'Disagree' } },
  { value: '3', label: { fa: 'نظری ندارم', en: 'Neutral' } },
  { value: '4', label: { fa: 'موافقم', en: 'Agree' } },
  { value: '5', label: { fa: 'کاملاً موافقم', en: 'Strongly agree' } },
];

export function likertItemToQuestion(item, order) {
  return {
    order,
    type: 'likert',
    title: item.text,
    required: true,
    options: LIKERT5_OPTIONS,
    matrixRows: [],
    modelItemKey: item.key,
    scoringDimensions: item.scoring,
  };
}
