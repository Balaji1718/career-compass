import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState } from '../components/AsyncBoundary.jsx';
import { MatchBadge, ProgressBar, FieldErrors } from '../components/ui.jsx';

export default function Recommendations() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);

  const recommendationsQuery = useAsync(
    (signal) => api.recommendations({ limit }, signal).then((r) => r.data),
    [limit]
  );

  const { pending, error, execute } = useAction();

  const handleAnalyze = async (careerId) => {
    const res = await execute(() => api.createAnalysis(careerId));
    if (res && res.data && res.data.analysis) {
      navigate(`/analysis/${res.data.analysis._id}`);
    }
  };

  const data = recommendationsQuery.data;
  const list = data ? data.recommendations : [];

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Career Recommendations</h1>
        <p>
          Ranked deterministically using your recorded skill profile against all ESCO-classified IT occupations.
          No black-box scoring: every percentage reflects required versus verified proficiency.
        </p>
      </div>

      <FieldErrors error={error} />

      {data && data.skillCount === 0 && (
        <div className="notice warn">
          You have not added any skills to your profile yet. Add your current skills to get personalized matches!
          <div style={{ marginTop: 8 }}>
            <Link to="/skills" className="btn small">Go to Skills Management</Link>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="small muted" style={{ margin: 0 }}>
          {list.length} careers matched · Algorithm {data ? data.algorithmVersion : 'v1'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="rec-limit" className="small" style={{ margin: 0 }}>Show top:</label>
          <select
            id="rec-limit"
            value={limit}
            style={{ width: 'auto', padding: '4px 8px' }}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5 careers</option>
            <option value={10}>10 careers</option>
            <option value={20}>20 careers</option>
          </select>
        </div>
      </div>

      <AsyncBoundary
        status={recommendationsQuery.status}
        error={recommendationsQuery.error}
        onRetry={recommendationsQuery.retry}
        loadingLabel="Calculating career compatibility…"
        isEmpty={list.length === 0}
        empty={
          <div className="card pad-lg">
            <EmptyState
              title="No recommendations available"
              message="Add skills to your profile to let the matching engine discover compatible paths."
              action={
                <Link to="/skills" className="btn">
                  Add Skills
                </Link>
              }
            />
          </div>
        }
      >
        <div className="stack">
          {list.map((rec) => (
            <div key={rec.careerId} className="card pad-md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                      <Link to={`/careers/${rec.careerId}`}>{rec.title}</Link>
                    </h2>
                    <span className="badge" style={{ fontSize: '0.75rem' }}>{rec.category}</span>
                    <MatchBadge score={rec.score} classification={rec.classification} />
                  </div>
                  <p className="small muted" style={{ margin: '6px 0 12px', maxWidth: 700 }}>
                    {rec.description || 'No detailed description available.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/careers/${rec.careerId}`} className="btn secondary small">
                    View Requirements
                  </Link>
                  <button
                    type="button"
                    className="btn small"
                    disabled={pending}
                    onClick={() => handleAnalyze(rec.careerId)}
                  >
                    Run Full Gap Analysis →
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="small muted">Match Score</span>
                    <span className="small" style={{ fontWeight: 600 }}>{rec.score}%</span>
                  </div>
                  <ProgressBar value={rec.score} />
                </div>

                {rec.strengths && rec.strengths.length > 0 && (
                  <div>
                    <span className="small muted">Top Matched Strengths:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {rec.strengths.map((str, i) => (
                        <span key={i} className="badge strong" style={{ fontSize: '0.75rem' }}>
                          ✓ {str}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rec.majorGaps && rec.majorGaps.length > 0 && (
                  <div>
                    <span className="small muted">Key Gaps to Close:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {rec.majorGaps.map((gap, i) => (
                        <span key={i} className="badge low" style={{ fontSize: '0.75rem' }}>
                          {gap.skillName} (needs lvl {gap.requiredLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </AsyncBoundary>
    </div>
  );
}
