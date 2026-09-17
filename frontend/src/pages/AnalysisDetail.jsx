import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary from '../components/AsyncBoundary.jsx';
import {
  MatchBadge,
  ProgressBar,
  LevelDots,
  Notice,
  formatDate,
  FieldErrors,
} from '../components/ui.jsx';

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const analysisQuery = useAsync(
    (signal) => api.getAnalysis(id, signal).then((r) => r.data.analysis),
    [id]
  );

  const { pending, error, execute } = useAction();

  const handleGenerateRoadmap = async () => {
    const res = await execute(() => api.createRoadmap({ analysisId: id }));
    if (res && res.data && res.data.roadmap) {
      navigate(`/roadmap/${res.data.roadmap._id}`);
    }
  };

  const a = analysisQuery.data;

  return (
    <div className="stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="small" style={{ margin: 0 }}>
          <Link to="/history">← Back to Analysis History</Link>
        </p>
        <Link to="/analysis" className="small">
          Analyze Another Career
        </Link>
      </div>

      <AsyncBoundary
        status={analysisQuery.status}
        error={analysisQuery.error}
        onRetry={analysisQuery.retry}
        loadingLabel="Loading analysis results…"
      >
        {a ? (
          <div className="stack">
            {/* Header / Score Banner */}
            <div className="card pad-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1 style={{ margin: 0 }}>{a.careerTitle}</h1>
                    <MatchBadge score={a.overallMatchScore} classification={a.matchClassification} />
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    Analysis evaluated on {formatDate(a.createdAt)} · Algorithm {a.algorithmVersion}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn"
                    disabled={pending}
                    onClick={handleGenerateRoadmap}
                  >
                    {pending ? 'Generating Roadmap…' : 'Generate Learning Roadmap →'}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 24 }} className="grid cols-3">
                <div>
                  <p className="stat-label">Overall Match Score</p>
                  <p className="stat" style={{ margin: '4px 0 8px' }}>{a.overallMatchScore}%</p>
                  <ProgressBar value={a.overallMatchScore} />
                </div>
                <div>
                  <p className="stat-label">Skill Coverage</p>
                  <p className="stat" style={{ margin: '4px 0 8px' }}>{a.skillCoverage}%</p>
                  <ProgressBar value={a.skillCoverage} variant="moderate" />
                </div>
                <div>
                  <p className="stat-label">Requirements Breakdown</p>
                  <p className="small" style={{ marginTop: 12 }}>
                    <span style={{ color: 'var(--c-success)', fontWeight: 600 }}>{a.matchedSkills.length} Matched</span> ·{' '}
                    <span style={{ color: 'var(--c-warning)', fontWeight: 600 }}>{a.weakSkills.length} Weak</span> ·{' '}
                    <span style={{ color: 'var(--c-danger)', fontWeight: 600 }}>{a.missingSkills.length} Missing</span>
                  </p>
                </div>
              </div>
            </div>

            <FieldErrors error={error} />

            {/* AI Summary / Explanation */}
            {a.aiSummary ? (
              <section className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h2 style={{ margin: 0 }}>AI Career Analysis & Explanation</h2>
                  {a.aiMetadata && a.aiMetadata.provider ? (
                    <span className="badge" style={{ fontSize: '0.75rem' }}>
                      {a.aiMetadata.provider} ({a.aiMetadata.model})
                    </span>
                  ) : null}
                </div>
                <p style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>{a.aiSummary}</p>
              </section>
            ) : a.aiMetadata && a.aiMetadata.available === false ? (
              <Notice kind="info">
                AI explanation is temporarily unavailable. All deterministic matching, coverage scores, and gap calculations below are fully accurate and active.
              </Notice>
            ) : null}

            {/* Recommendations */}
            {a.recommendations && a.recommendations.length > 0 && (
              <section className="card">
                <h2>Strategic Recommendations</h2>
                <ul className="bullets">
                  {a.recommendations.map((rec, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>{rec}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Strengths */}
            {a.strengths && a.strengths.length > 0 && (
              <section className="card">
                <h2>Identified Strengths</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {a.strengths.map((str, i) => (
                    <span key={i} className="badge strong" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                      ✓ {str}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Detailed Skills Tables */}
            <div className="grid cols-2">
              {/* Missing Skills */}
              <section className="card">
                <h2 style={{ color: 'var(--c-danger)' }}>Missing Skills ({a.missingSkills.length})</h2>
                {a.missingSkills.length === 0 ? (
                  <p className="muted small">No missing skills! You possess all required areas.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Target Level</th>
                          <th>Importance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.missingSkills.map((s, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{s.skillName}</strong>
                              <br />
                              <span className="small muted">{s.requirementType}</span>
                            </td>
                            <td>
                              <LevelDots level={s.requiredLevel} />
                            </td>
                            <td>Level {s.importance}/5</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Weak Skills */}
              <section className="card">
                <h2 style={{ color: 'var(--c-warning)' }}>Skills Needing Improvement ({a.weakSkills.length})</h2>
                {a.weakSkills.length === 0 ? (
                  <p className="muted small">No skills have an active proficiency gap.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Current / Target</th>
                          <th>Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.weakSkills.map((s, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{s.skillName}</strong>
                            </td>
                            <td>
                              <span className="small">Current: {s.userLevel} / Target: {s.requiredLevel}</span>
                            </td>
                            <td>
                              <span className="badge low">-{s.gap} levels</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Fully Matched Skills */}
            <section className="card">
              <h2 style={{ color: 'var(--c-success)' }}>Fully Matched Skills ({a.matchedSkills.length})</h2>
              {a.matchedSkills.length === 0 ? (
                <p className="muted small">No fully matched skills yet for this career.</p>
              ) : (
                <div className="table-scroll">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Your Proficiency</th>
                        <th>Requirement</th>
                        <th>Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.matchedSkills.map((s, idx) => (
                        <tr key={idx}>
                          <td><strong>{s.skillName}</strong></td>
                          <td><LevelDots level={s.userLevel} /></td>
                          <td>Requires Level {s.requiredLevel} ({s.requirementType})</td>
                          <td><span className="badge strong">100%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </AsyncBoundary>
    </div>
  );
}
