import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { BarChart3, LineChart, PieChart, Disc } from 'lucide-react';
import { QueryDataResult } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartViewProps {
  data: QueryDataResult;
}

export const ChartView: React.FC<ChartViewProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut'>('bar');
  const [labelColIdx, setLabelColIdx] = useState<number>(0);
  const [valueColIdx, setValueColIdx] = useState<number>(
    data.columns.findIndex((_, idx) => typeof data.rows[0]?.[idx] === 'number') !== -1
      ? data.columns.findIndex((_, idx) => typeof data.rows[0]?.[idx] === 'number')
      : 1
  );

  const chartData = useMemo(() => {
    const labels = data.rows.map(r => String(r[labelColIdx] ?? ''));
    const values = data.rows.map(r => {
      const val = Number(r[valueColIdx]);
      return isNaN(val) ? 0 : val;
    });

    const colors = [
      '#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f472b6',
      '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#4ade80'
    ];

    return {
      labels,
      datasets: [
        {
          label: data.columns[valueColIdx] || 'Values',
          data: values,
          backgroundColor: chartType === 'bar' || chartType === 'line'
            ? 'rgba(56, 189, 248, 0.7)'
            : colors.slice(0, labels.length),
          borderColor: chartType === 'bar' || chartType === 'line'
            ? '#38bdf8'
            : colors.slice(0, labels.length),
          borderWidth: 1.5,
          tension: 0.3
        }
      ]
    };
  }, [data, labelColIdx, valueColIdx, chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: chartType === 'bar' || chartType === 'line' ? {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
      }
    } : undefined
  };

  return (
    <div style={{
      marginTop: '14px',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(15, 23, 42, 0.7)'
    }}>
      {/* Chart Selector Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(30, 41, 59, 0.6)', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setChartType('bar')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              background: chartType === 'bar' ? '#0284c7' : 'transparent',
              color: chartType === 'bar' ? '#fff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={13} /> Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              background: chartType === 'line' ? '#0284c7' : 'transparent',
              color: chartType === 'line' ? '#fff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LineChart size={13} /> Line
          </button>
          <button
            onClick={() => setChartType('pie')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              background: chartType === 'pie' ? '#0284c7' : 'transparent',
              color: chartType === 'pie' ? '#fff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <PieChart size={13} /> Pie
          </button>
          <button
            onClick={() => setChartType('doughnut')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              background: chartType === 'doughnut' ? '#0284c7' : 'transparent',
              color: chartType === 'doughnut' ? '#fff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Disc size={13} /> Donut
          </button>
        </div>

        {/* Column Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Axis:</span>
          <select
            value={labelColIdx}
            onChange={(e) => setLabelColIdx(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              outline: 'none'
            }}
          >
            {data.columns.map((c, i) => (
              <option key={i} value={i}>Label: {c}</option>
            ))}
          </select>

          <select
            value={valueColIdx}
            onChange={(e) => setValueColIdx(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              outline: 'none'
            }}
          >
            {data.columns.map((c, i) => (
              <option key={i} value={i}>Metric: {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Canvas container */}
      <div style={{ height: '280px', position: 'relative' }}>
        {chartType === 'bar' && <Bar data={chartData} options={options} />}
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'pie' && <Pie data={chartData} options={options} />}
        {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
      </div>
    </div>
  );
};
