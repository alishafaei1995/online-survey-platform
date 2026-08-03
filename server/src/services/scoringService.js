function scoreQuestionForResponse(question, response) {
  const answer = response.answers.find((a) => String(a.questionId) === String(question._id));
  if (!answer || answer.value === undefined || answer.value === null || answer.value === '') return [];
  const raw = Number(answer.value);
  if (Number.isNaN(raw)) return [];
  return (question.scoringDimensions || []).map((sd) => ({
    dimension: sd.dimension,
    points: (sd.reverse ? 6 - raw : raw) * (sd.weight ?? 1),
  }));
}

export function computePerResponseScores(survey, responses) {
  const scoredQuestions = survey.questions.filter((q) => q.scoringDimensions?.length);
  return responses.map((response) => {
    const buckets = {};
    for (const question of scoredQuestions) {
      for (const { dimension, points } of scoreQuestionForResponse(question, response)) {
        if (!buckets[dimension]) buckets[dimension] = { sum: 0, count: 0 };
        buckets[dimension].sum += points;
        buckets[dimension].count += 1;
      }
    }
    const scores = {};
    for (const [dimension, { sum, count }] of Object.entries(buckets)) {
      scores[dimension] = count > 0 ? sum / count : null;
    }
    return {
      responseId: response._id,
      subjectParticipantId: response.subjectParticipantId,
      raterParticipantId: response.raterParticipantId,
      raterRelationship: response.raterRelationship,
      scores,
    };
  });
}

function classifyBand(value, bands) {
  if (value === null || value === undefined) return null;
  for (const band of bands) {
    if (value <= band.max) return band.key;
  }
  return bands[bands.length - 1]?.key || null;
}

export function applyDerivedOutputs(modelDef, scores) {
  const derived = {};
  for (const spec of modelDef.derived || []) {
    if (spec.type === 'top1') {
      let bestKey = null;
      let bestValue = -Infinity;
      for (const dim of modelDef.dimensions) {
        const value = scores[dim.key];
        if (value !== null && value !== undefined && value > bestValue) {
          bestValue = value;
          bestKey = dim.key;
        }
      }
      const dimension = modelDef.dimensions.find((d) => d.key === bestKey);
      derived[spec.key] = bestKey ? { dimensionKey: bestKey, name: dimension.name, value: bestValue } : null;
    } else if (spec.type === 'quadrantLookup') {
      const xValue = scores[spec.xDimension];
      const yValue = scores[spec.yDimension];
      const xBand = classifyBand(xValue, spec.bands);
      const yBand = classifyBand(yValue, spec.bands);
      const cellKey = xBand && yBand ? `${yBand}_${xBand}` : null;
      const cell = cellKey ? spec.grid[cellKey] : null;
      derived[spec.key] = cell ? { cellKey, label: cell, xBand, yBand } : null;
    }
  }
  return derived;
}

export function buildModelReport(survey, responses, modelDef, participantsById = new Map()) {
  const perResponse = computePerResponseScores(survey, responses);

  function participantName(id) {
    if (!id) return null;
    const p = participantsById.get(String(id));
    return p ? p.name : null;
  }

  if (modelDef.granularity === 'per_respondent') {
    const subjects = perResponse.map((r) => ({
      responseId: r.responseId,
      subjectName: participantName(r.subjectParticipantId),
      raterName: participantName(r.raterParticipantId),
      raterRelationship: r.raterRelationship,
      scores: r.scores,
      derived: applyDerivedOutputs(modelDef, r.scores),
    }));
    return {
      modelKey: modelDef.key,
      name: modelDef.name,
      granularity: 'per_respondent',
      dimensions: modelDef.dimensions,
      chart: modelDef.chart,
      subjects,
    };
  }

  const aggregateScores = {};
  for (const dim of modelDef.dimensions) {
    const values = perResponse.map((r) => r.scores[dim.key]).filter((v) => v !== null && v !== undefined);
    aggregateScores[dim.key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }
  return {
    modelKey: modelDef.key,
    name: modelDef.name,
    granularity: 'aggregate',
    dimensions: modelDef.dimensions,
    chart: modelDef.chart,
    sampleSize: perResponse.length,
    scores: aggregateScores,
    derived: applyDerivedOutputs(modelDef, aggregateScores),
    perResponse,
  };
}
