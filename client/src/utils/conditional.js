function matches(answerValue, operator, condValue) {
  if (answerValue === undefined || answerValue === null || answerValue === '') return false;
  if (Array.isArray(answerValue)) {
    const has = answerValue.map(String).includes(String(condValue));
    return operator === 'notEquals' ? !has : has;
  }
  const strVal = String(answerValue);
  if (operator === 'equals') return strVal === String(condValue);
  if (operator === 'notEquals') return strVal !== String(condValue);
  if (operator === 'contains') return strVal.includes(String(condValue));
  return false;
}

export function isQuestionVisible(question, answers) {
  const cond = question.conditional;
  if (!cond || !cond.dependsOn) return true;
  return matches(answers[cond.dependsOn], cond.operator || 'equals', cond.value);
}

function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

export function validateVisibleAnswers(questions, answers) {
  const errors = {};
  for (const q of questions) {
    if (!isQuestionVisible(q, answers)) continue;
    if (q.required && isEmpty(answers[q._id])) errors[q._id] = true;
  }
  return errors;
}
