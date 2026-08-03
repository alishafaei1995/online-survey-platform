import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

const SERIES_COLOR = '#5da23a';

export default function RadarProfileChart({ dimensions, scores, max = 5 }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';

  const data = dimensions.map((d) => ({
    dimension: d.name?.[lang] || d.name?.fa || d.key,
    value: scores[d.key] != null ? Number(scores[d.key].toFixed(2)) : 0,
  }));

  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#e1e0d9" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#52514e', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, max]} tick={{ fill: '#898781', fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Radar dataKey="value" stroke={SERIES_COLOR} fill={SERIES_COLOR} fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
