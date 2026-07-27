'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'

// ---------------------------------------------------------------------------
// Views over time — line chart
// ---------------------------------------------------------------------------
interface ViewsLineChartProps {
  data: { date: string; views: number }[]
}

export function ViewsLineChart({ data }: ViewsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--color-primary)' }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--color-primary)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Top AI queries — horizontal bar chart
// ---------------------------------------------------------------------------
interface TopQueriesBarChartProps {
  data: { query: string; count: number }[]
}

export function TopQueriesBarChart({ data }: TopQueriesBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="query"
          width={160}
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--color-primary)' }}
          cursor={{ fill: 'var(--color-background-subtle)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20} fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Device breakdown — donut / pie chart
// ---------------------------------------------------------------------------
const DEVICE_COLORS = ['#09bc7c', '#0284c7', '#d97706', '#8b5cf6']

interface DevicePieChartProps {
  data: { device: string; count: number }[]
}

export function DevicePieChart({ data }: DevicePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="device"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          formatter={(val: number, name: string) => [val.toLocaleString(), name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)', textTransform: 'capitalize' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Age group — horizontal bar chart
// ---------------------------------------------------------------------------
interface AgeGroupBarChartProps {
  data: { group: string; count: number }[]
}

export function AgeGroupBarChart({ data }: AgeGroupBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 38)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="group"
          width={80}
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--color-primary)' }}
          cursor={{ fill: 'var(--color-background-subtle)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18} fill="#0284c7" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Country breakdown — horizontal bar chart (top 8)
// ---------------------------------------------------------------------------
interface CountryBarChartProps {
  data: { country: string; views: number }[]
}

export function CountryBarChart({ data }: CountryBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 38)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="country"
          width={90}
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--color-primary)' }}
          cursor={{ fill: 'var(--color-background-subtle)' }}
        />
        <Bar dataKey="views" radius={[0, 4, 4, 0]} maxBarSize={18} fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Event type breakdown — vertical bar chart
// ---------------------------------------------------------------------------
interface EventBarChartProps {
  data: { type: string; count: number }[]
}

export function EventBarChart({ data }: EventBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="type"
          tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          itemStyle={{ color: '#d97706' }}
          cursor={{ fill: 'var(--color-background-subtle)' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36} fill="#d97706" />
      </BarChart>
    </ResponsiveContainer>
  )
}
