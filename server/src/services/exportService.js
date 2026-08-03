import ExcelJS from 'exceljs';
import { Parser as CsvParser } from 'json2csv';

function optionLabel(options, value, lang) {
  const opt = (options || []).find((o) => o.value === value);
  if (!opt) return value;
  return opt.label?.[lang] || opt.label?.fa || opt.label?.en || value;
}

function answerToText(question, value, lang) {
  if (value === undefined || value === null || value === '') return '';
  switch (question.type) {
    case 'single_choice':
    case 'likert':
      return optionLabel(question.options, value, lang);
    case 'multiple_choice':
      return (Array.isArray(value) ? value : [value]).map((v) => optionLabel(question.options, v, lang)).join('; ');
    case 'matrix': {
      if (typeof value !== 'object') return String(value);
      return Object.entries(value)
        .map(([rowValue, colValue]) => {
          const rowLabel = optionLabel(question.matrixRows, rowValue, lang);
          const colLabel = optionLabel(question.options, colValue, lang);
          return `${rowLabel}: ${colLabel}`;
        })
        .join('; ');
    }
    default:
      return String(value);
  }
}

export function buildRows(survey, responses, lang = 'fa') {
  const questions = [...survey.questions].sort((a, b) => a.order - b.order);
  const headers = ['#', 'submittedAt', ...questions.map((q) => q.title?.[lang] || q.title?.fa || q.title?.en || String(q._id))];

  const rows = responses.map((r, idx) => {
    const answersByQ = new Map(r.answers.map((a) => [String(a.questionId), a.value]));
    const row = {
      '#': idx + 1,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
    };
    for (const q of questions) {
      const header = q.title?.[lang] || q.title?.fa || q.title?.en || String(q._id);
      row[header] = answerToText(q, answersByQ.get(String(q._id)), lang);
    }
    return row;
  });

  return { headers, rows };
}

function dimensionHeader(dimension, lang) {
  return dimension.name?.[lang] || dimension.name?.fa || dimension.key;
}

function modelRowExtras(modelReport, idx, lang) {
  if (!modelReport) return {};
  const extras = {};
  if (modelReport.granularity === 'per_respondent') {
    const s = modelReport.subjects[idx];
    if (!s) return {};
    extras.Subject = s.subjectName || '';
    extras.Rater = s.raterName || '';
    extras.Relationship = s.raterRelationship || '';
    for (const d of modelReport.dimensions) {
      extras[dimensionHeader(d, lang)] = s.scores[d.key] != null ? Number(s.scores[d.key].toFixed(2)) : '';
    }
    const derivedVal = Object.values(s.derived)[0];
    extras.Result = derivedVal?.label?.[lang] || derivedVal?.label?.fa || '';
  } else {
    const r = modelReport.perResponse[idx];
    if (!r) return {};
    for (const d of modelReport.dimensions) {
      extras[dimensionHeader(d, lang)] = r.scores[d.key] != null ? Number(r.scores[d.key].toFixed(2)) : '';
    }
  }
  return extras;
}

// Summary table for the Excel "Scores" worksheet: one row per subject (participant-invite
// models like 9-Box) or one row per response plus an overall-average row (aggregate models like DiSC).
function buildModelScoreRows(modelReport, lang = 'fa') {
  if (!modelReport) return null;

  if (modelReport.granularity === 'per_respondent') {
    const headers = ['#', 'Subject', 'Rater', 'Relationship', ...modelReport.dimensions.map((d) => dimensionHeader(d, lang)), 'Result'];
    const rows = modelReport.subjects.map((s, idx) => ({ '#': idx + 1, ...modelRowExtras(modelReport, idx, lang) }));
    return { headers, rows };
  }

  const headers = ['#', ...modelReport.dimensions.map((d) => dimensionHeader(d, lang))];
  const rows = modelReport.perResponse.map((r, idx) => ({ '#': idx + 1, ...modelRowExtras(modelReport, idx, lang) }));
  const avgRow = { '#': lang === 'fa' ? 'میانگین کل' : 'Overall average' };
  for (const d of modelReport.dimensions) {
    avgRow[dimensionHeader(d, lang)] = modelReport.scores[d.key] != null ? Number(modelReport.scores[d.key].toFixed(2)) : '';
  }
  rows.push(avgRow);
  return { headers, rows };
}

export function buildCsv(survey, responses, lang = 'fa', modelReport = null) {
  const { rows } = buildRows(survey, responses, lang);
  if (modelReport) rows.forEach((row, idx) => Object.assign(row, modelRowExtras(modelReport, idx, lang)));
  if (rows.length === 0) return '';
  const parser = new CsvParser({ fields: Object.keys(rows[0]) });
  return parser.parse(rows);
}

function addSheet(workbook, name, headers, rows) {
  const sheet = workbook.addWorksheet(name);
  if (rows.length > 0) {
    sheet.columns = headers.map((key) => ({ header: key, key, width: 22 }));
    rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true };
  } else {
    sheet.addRow(['No responses yet']);
  }
}

export async function buildExcelBuffer(survey, responses, lang = 'fa', modelReport = null) {
  const { headers, rows } = buildRows(survey, responses, lang);
  const workbook = new ExcelJS.Workbook();
  addSheet(workbook, 'Responses', rows.length > 0 ? Object.keys(rows[0]) : headers, rows);

  const scoreTable = buildModelScoreRows(modelReport, lang);
  if (scoreTable) addSheet(workbook, 'Scores', scoreTable.headers, scoreTable.rows);

  return workbook.xlsx.writeBuffer();
}
