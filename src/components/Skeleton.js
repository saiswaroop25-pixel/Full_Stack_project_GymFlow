import React from 'react';

// Shimmer animation injected once
const shimmerStyle = `
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--bg-hover)    50%,
    var(--bg-elevated) 75%
  );
  background-size: 400px 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 8px;
}
`;

if (!document.getElementById('skeleton-style')) {
  const tag = document.createElement('style');
  tag.id = 'skeleton-style';
  tag.textContent = shimmerStyle;
  document.head.appendChild(tag);
}

// Basic skeleton block
export function Skeleton({ width = '100%', height = 20, style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: 8, ...style }} />
  );
}

// Stat card skeleton (matches the 4-col stat grid)
export function StatCardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <Skeleton width={40} height={40} style={{ borderRadius: 10, marginBottom: 14 }} />
      <Skeleton width="60%" height={32} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="50%" height={12} />
    </div>
  );
}

// Chart card skeleton
export function ChartSkeleton({ height = 200 }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <Skeleton width="40%" height={22} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={height} />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <Skeleton width={i === 0 ? '80%' : '60%'} height={14} />
        </td>
      ))}
    </tr>
  );
}

// Page-level skeleton for dashboard
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <Skeleton width={200} height={16} style={{ marginBottom: 8 }} />
        <Skeleton width={320} height={48} />
      </div>
      {/* Stat cards */}
      <div className="grid-4">
        {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
      </div>
      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <ChartSkeleton height={160} />
        <ChartSkeleton height={160} />
      </div>
      {/* Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <ChartSkeleton height={200} />
        <ChartSkeleton height={200} />
      </div>
    </div>
  );
}

// Generic list skeleton
export function ListSkeleton({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Skeleton width="40%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="25%" height={13} />
            </div>
            <Skeleton width={80} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
}
