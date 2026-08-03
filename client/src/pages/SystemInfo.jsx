import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function SystemInfo() {
  const { t } = useTranslation();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/system/version').then((res) => {
      setInfo(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-slate-500 text-sm">{t('common.loading')}</p>;

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 text-center">{t('system.title')}</h1>
      <div className="card p-6 text-center">
        <div className="text-xs text-slate-400 mb-1">{t('system.version')}</div>
        <div className="text-3xl font-bold text-brand-700 tracking-tight mb-4" dir="ltr">
          v{info.version}
        </div>
        <div className="text-xs text-slate-400 mb-1">{t('system.releaseDate')}</div>
        <div className="text-sm text-slate-700 mb-4">{info.releaseDate}</div>
        {info.notes && (
          <>
            <div className="text-xs text-slate-400 mb-1">{t('system.notes')}</div>
            <p className="text-sm text-slate-600">{info.notes}</p>
          </>
        )}
      </div>
    </div>
  );
}
