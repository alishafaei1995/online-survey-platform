function answerMatchesCondition(answerValue, operator, condValue) {
  if (answerValue === undefined || answerValue === null) return false;
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

function isQuestionVisible(question, answersByQuestionId) {
  const cond = question.conditional;
  if (!cond || !cond.dependsOn) return true;
  const dependsOnAnswer = answersByQuestionId.get(String(cond.dependsOn));
  return answerMatchesCondition(dependsOnAnswer, cond.operator || 'equals', cond.value);
}

function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

/**
 * Validates submitted answers against a survey's question definitions.
 * Skips required/validation checks for questions hidden by conditional logic.
 * Returns { valid: boolean, errors: [{ questionId, message }] }
 */
export function validateAnswers(questions, answers) {
  const answersByQuestionId = new Map(answers.map((a) => [String(a.questionId), a.value]));
  const errors = [];

  for (const question of questions) {
    const visible = isQuestionVisible(question, answersByQuestionId);
    if (!visible) continue;

    const value = answersByQuestionId.get(String(question._id));

    if (question.required && isEmpty(value)) {
      errors.push({ questionId: question._id, message: 'This question is required' });
      continue;
    }
    if (isEmpty(value)) continue;

    const v = question.validation || {};
    if (question.type === 'numeric') {
      const num = Number(value);
      if (Number.isNaN(num)) errors.push({ questionId: question._id, message: 'Must be a number' });
      else {
        if (v.min !== undefined && v.min !== null && num < v.min)
          errors.push({ questionId: question._id, message: `Must be >= ${v.min}` });
        if (v.max !== undefined && v.max !== null && num > v.max)
          errors.push({ questionId: question._id, message: `Must be <= ${v.max}` });
      }
    }
    if (question.type === 'date') {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) errors.push({ questionId: question._id, message: 'Invalid date' });
      else {
        if (v.minDate && d < new Date(v.minDate))
          errors.push({ questionId: question._id, message: `Must be after ${v.minDate}` });
        if (v.maxDate && d > new Date(v.maxDate))
          errors.push({ questionId: question._id, message: `Must be before ${v.maxDate}` });
      }
    }
    if (question.type === 'text' && v.regex) {
      try {
        const re = new RegExp(v.regex);
        if (!re.test(String(value))) errors.push({ questionId: question._id, message: 'Invalid format' });
      } catch {
        // invalid regex configured, skip
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
