import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../api';
import { Brain, TrendingDown, Zap, Clock, Loader, AlertTriangle, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CARD_COLORS = {
  churn: 'var(--accent-red)',
  peak: 'var(--accent-amber)',
  revenue: 'var(--accent-lime)',
  accuracy: 'var(--accent-purple)',
};

export default function AIInsightsPage() {
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: response } = await adminAPI.getAIInsights();
        setData(response.data);
      } catch (err) {
        setError('Failed to load AI insights.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const statCards = useMemo(() => {
    if (!data?.summary) return [];

    return [
      {
        label: 'Members At Risk',
        value: data.summary.membersAtRisk,
        color: CARD_COLORS.churn,
        icon: TrendingDown,
      },
      {
        label: 'Predicted Peak Hour',
        value: data.summary.predictedPeakHour,
        color: CARD_COLORS.peak,
        icon: Clock,
      },
      {
        label: 'Upgrade Opportunities',
        value: data.summary.upsellOpportunities,
        color: CARD_COLORS.revenue,
        icon: Zap,
      },
      {
        label: 'Forecast Accuracy',
        value: `${data.summary.predictionAccuracy}%`,
        color: CARD_COLORS.accuracy,
        icon: Brain,
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, gap: 16 }}>
        <Loader size={28} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading AI insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b' }}>
        {error}
      </div>
    );
  }

  const { churnRisk = [], peakForecast = [], planSuggestions = [], insights = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN DATA INTELLIGENCE</div>
          <h1 className="page-title">AI <span style={{ color: 'var(--accent-orange)' }}>INSIGHTS</span></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 999 }}>
          <Brain size={14} color="var(--accent-purple)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)' }}>Model trained on live gym activity</span>
        </div>
      </div>

      <div className="grid-4">
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ border: `1px solid ${color}20` }}>
            <div style={{ width: 40, height: 40, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <AlertTriangle size={16} color="var(--accent-red)" />
            <div className="section-title">Churn Watchlist</div>
          </div>

          {churnRisk.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No high-risk members detected right now.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {churnRisk.map((member) => {
                const riskColor = member.riskLevel === 'HIGH' ? 'var(--accent-red)' : member.riskLevel === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--accent-lime)';
                const isOpen = expandedId === member.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setExpandedId(isOpen ? null : member.id)}
                    style={{ background: 'var(--bg-elevated)', border: `1px solid ${riskColor}25`, borderRadius: 10, padding: 14, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{member.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: riskColor }}>{member.riskScore}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${member.riskScore}%`, height: '100%', background: riskColor, borderRadius: 999 }} />
                        </div>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Plan: <b style={{ color: 'var(--text-primary)' }}>{member.plan}</b></span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visits This Month: <b style={{ color: 'var(--text-primary)' }}>{member.visitsLastMonth}</b></span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last Visit: <b style={{ color: 'var(--text-primary)' }}>{member.lastVisit ? new Date(member.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No visits'}</b></span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{member.reason}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={16} color="var(--accent-amber)" />
              <div className="section-title">Evening Peak Forecast</div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={peakForecast} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(value, name, entry) => [`${value}%`, name === 'expected' ? `Expected crowd (${entry.payload.confidence}% confidence)` : name]} />
                <Bar dataKey="expected" radius={[4, 4, 0, 0]}>
                  {peakForecast.map((slot, index) => (
                    <Cell key={index} fill={slot.expected < 60 ? 'var(--accent-lime)' : slot.expected < 80 ? 'var(--accent-amber)' : 'var(--accent-red)'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={16} color="var(--accent-lime)" />
              <div className="section-title">Upgrade Signals</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planSuggestions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No targeted upgrade suggestions available yet.</div>
              ) : (
                planSuggestions.map((suggestion) => (
                  <div key={suggestion.id} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{suggestion.member}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{suggestion.suggestion}</div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 800, background: 'rgba(0,255,135,0.12)', color: 'var(--accent-lime)', border: '1px solid rgba(0,255,135,0.2)', whiteSpace: 'nowrap' }}>
                      {suggestion.action}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), var(--bg-card))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Brain size={16} color="var(--accent-purple)" />
          <div className="section-title">Recommended Actions</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {insights.map((insight) => (
            <div key={insight.title} style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, border: '1px solid rgba(139,92,246,0.12)' }}>
              <div style={{ fontSize: 11, color: 'var(--accent-purple)', fontWeight: 800, marginBottom: 10 }}>{insight.impact} IMPACT</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{insight.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
