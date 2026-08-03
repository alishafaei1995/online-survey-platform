import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const RELATIONSHIPS = ['self', 'manager', 'peer', 'subordinate', 'external'];

function emptyInviteForm() {
  return { subjectParticipantId: '', raterParticipantId: '', raterRelationship: '' };
}

export default function SurveyShare() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  const [survey, setSurvey] = useState(null);
  const [model, setModel] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [invites, setInvites] = useState([]);
  const [form, setForm] = useState(emptyInviteForm());
  const [creating, setCreating] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(null);

  useEffect(() => {
    api.get(`/surveys/${id}/qrcode`).then((res) => setData(res.data));
    api.get(`/surveys/${id}`).then((res) => setSurvey(res.data.survey));
  }, [id]);

  useEffect(() => {
    if (!survey?.modelKey) return;
    api.get(`/assessment-models/${survey.modelKey}`).then((res) => setModel(res.data.model));
  }, [survey]);

  const needsInvites = model?.identitySource === 'participant_invite';

  async function loadInvites() {
    const res = await api.get(`/surveys/${id}/invites`);
    setInvites(res.data.invites);
  }

  useEffect(() => {
    if (!needsInvites) return;
    api.get('/participants').then((res) => setParticipants(res.data.participants.filter((p) => p.active)));
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsInvites]);

  function handleCopy() {
    navigator.clipboard.writeText(data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleCreateInvite(e) {
    e.preventDefault();
    setInviteError('');
    if (!form.subjectParticipantId) return;
    setCreating(true);
    try {
      await api.post(`/surveys/${id}/invites`, {
        subjectParticipantId: form.subjectParticipantId,
        raterParticipantId: form.raterParticipantId || undefined,
        raterRelationship: form.raterRelationship || undefined,
      });
      setForm(emptyInviteForm());
      loadInvites();
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Error');
    } finally {
      setCreating(false);
    }
  }

  function handleCopyInvite(link, responseId) {
    navigator.clipboard.writeText(link);
    setCopiedInvite(responseId);
    setTimeout(() => setCopiedInvite(null), 1500);
  }

  if (!data) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 text-center">{t('survey.share.title')}</h1>

      <div className="card p-6 mb-6">
        <label className="label-field">{t('survey.share.link')}</label>
        <div className="flex gap-2 mb-6">
          <input readOnly value={data.link} className="input-field flex-1 bg-slate-50" dir="ltr" />
          <button type="button" onClick={handleCopy} className="btn-primary shrink-0">
            {copied ? `✓ ${t('common.copied')}` : t('survey.share.copyLink')}
          </button>
        </div>

        <label className="label-field text-center block">{t('survey.share.qrCode')}</label>
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <img src={data.qrDataUrl} alt="QR Code" className="rounded-lg w-56 h-56" />
          </div>
          <a href={data.qrDataUrl} download={`survey-${id}-qr.png`} className="btn-secondary">
            ⬇ {t('survey.share.downloadQr')}
          </a>
        </div>
      </div>

      {needsInvites && (
        <div className="card p-6">
          <h2 className="section-title mb-1">{t('survey.share.invitesTitle')}</h2>
          <p className="text-sm text-slate-500 mb-4">{t('survey.share.invitesSubtitle')}</p>

          {inviteError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{inviteError}</div>
          )}

          <form onSubmit={handleCreateInvite} className="space-y-3 mb-6">
            <div>
              <label className="label-field">{t('survey.share.subjectLabel')}</label>
              <select
                required
                value={form.subjectParticipantId}
                onChange={(e) => setForm({ ...form, subjectParticipantId: e.target.value })}
                className="input-field"
              >
                <option value="">—</option>
                {participants.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">{t('survey.share.raterLabel')}</label>
              <select
                value={form.raterParticipantId}
                onChange={(e) => setForm({ ...form, raterParticipantId: e.target.value })}
                className="input-field"
              >
                <option value="">{t('survey.share.relationshipNone')}</option>
                {participants.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">{t('survey.share.relationshipLabel')}</label>
              <select
                value={form.raterRelationship}
                onChange={(e) => setForm({ ...form, raterRelationship: e.target.value })}
                className="input-field"
              >
                <option value="">{t('survey.share.relationshipNone')}</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {t(`survey.share.relationship_${r}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={creating} className="btn-primary">
                {t('survey.share.createInvite')}
              </button>
            </div>
          </form>

          <h3 className="text-sm font-medium text-slate-600 mb-2">{t('survey.share.invitesListTitle')}</h3>
          {invites.length === 0 ? (
            <p className="text-sm text-slate-400">{t('survey.share.invitesEmpty')}</p>
          ) : (
            <div className="space-y-2">
              {invites.map((inv) => (
                <div
                  key={inv.responseId}
                  className="flex items-center justify-between gap-2 border border-slate-100 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-slate-800 font-medium truncate">{inv.subjectName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {inv.raterName || '—'}
                      {inv.raterRelationship ? ` · ${t(`survey.share.relationship_${inv.raterRelationship}`)}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${inv.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.completed ? t('survey.share.invitesCompleted') : t('survey.share.invitesPending')}
                    </span>
                    <button type="button" onClick={() => handleCopyInvite(inv.link, inv.responseId)} className="btn-ghost">
                      {copiedInvite === inv.responseId ? `✓ ${t('common.copied')}` : t('common.copy')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
