import { v4 as uuidv4 } from 'uuid';

export function getRespondentToken(surveyId) {
  const key = `respondent_${surveyId}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(key, token);
  }
  return token;
}
