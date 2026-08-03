import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';

const SERIES_COLOR = '#5da23a';

export default function FrequencyBarChart({ frequency }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fa';

  const data = frequency.map((f) => ({
    name: f.label?.[lang] || f.label?.fa || f.value,
    count: f.count,
  }));

  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="#e1e0d9" />
          <XAxis type="number" allowDecimals={false} tick={{ fill: '#898781', fontSize: 12 }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: '#52514e', fontSize: 12 }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(93,162,58,0.08)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Bar dataKey="count" fill={SERIES_COLOR} radius={[0, 4, 4, 0]} barSize={18}>
            <LabelList dataKey="count" position="right" style={{ fill: '#52514e', fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
