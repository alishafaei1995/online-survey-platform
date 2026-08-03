import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { useTranslation } from 'react-i18next';

const POINT_COLOR = '#2f6fa8';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-slate-800">{point.name}</div>
      {point.resultLabel && <div className="text-slate-500 mt-0.5">{point.resultLabel}</div>}
    </div>
  );
}

export default function QuadrantScatterChart({ xDimension, yDimension, subjects, domain = [1, 5] }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';

  const xLabel = xDimension.name?.[lang] || xDimension.name?.fa || xDimension.key;
  const yLabel = yDimension.name?.[lang] || yDimension.name?.fa || yDimension.key;

  const data = subjects
    .map((s) => ({
      x: s.scores[xDimension.key],
      y: s.scores[yDimension.key],
      name: s.subjectName || '—',
      resultLabel: Object.values(s.derived || {})[0]?.label?.[lang] || Object.values(s.derived || {})[0]?.label?.fa,
    }))
    .filter((d) => d.x !== null && d.x !== undefined && d.y !== null && d.y !== undefined);

  const [min, max] = domain;
  const gridLines = [min + (max - min) / 3, min + (2 * (max - min)) / 3];

  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 24, left: 10 }}>
          <CartesianGrid stroke="#e1e0d9" />
          <XAxis
            type="number"
            dataKey="x"
            domain={domain}
            tick={{ fill: '#898781', fontSize: 12 }}
            axisLine={{ stroke: '#c3c2b7' }}
            label={{ value: xLabel, position: 'insideBottom', offset: -14, fontSize: 12, fill: '#52514e' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={domain}
            tick={{ fill: '#898781', fontSize: 12 }}
            axisLine={{ stroke: '#c3c2b7' }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 12, fill: '#52514e' }}
          />
          <ZAxis range={[140, 140]} />
          {gridLines.map((v) => (
            <ReferenceLine key={`x-${v}`} x={v} stroke="#c3c2b7" strokeDasharray="4 4" />
          ))}
          {gridLines.map((v) => (
            <ReferenceLine key={`y-${v}`} y={v} stroke="#c3c2b7" strokeDasharray="4 4" />
          ))}
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill={POINT_COLOR} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
