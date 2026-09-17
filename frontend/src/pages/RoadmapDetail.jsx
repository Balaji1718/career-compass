import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary from '../components/AsyncBoundary.jsx';
import { ProgressBar, Notice, FieldErrors, formatDate } from '../components/ui.jsx';

export default function RoadmapDetail() {
  const { id } = useParams();
  const roadmapQuery = useAsync(
    (signal) => api.getRoadmap(id, signal).then((r) => r.data.roadmap),
    [id]
  );

  const [roadmap, setRoadmap] = useState(null);
  const { pending, error, execute } = useAction();

  useEffect(() => {
    if (roadmapQuery.data) {
      setRoadmap(roadmapQuery.data);
    }
  }, [roadmapQuery.data]);

  const toggleStage = async (stageNumber, currentCompleted) => {
    if (!roadmap) return;
    const newCompleted = !currentCompleted;

    // Optimistically update local view
    const updatedStages = roadmap.stages.map((s) =>
      s.stageNumber === stageNumber ? { ...s, completed: newCompleted } : s
    );
    const doneCount = updatedStages.filter((s) => s.completed).length;
    const pct = Math.round((doneCount / updatedStages.length) * 100);
    setRoadmap({
      ...roadmap,
      stages: updatedStages,
      progressPercentage: pct,
      status: pct === 100 ? 'completed' : pct === 0 ? 'not_started' : 'in_progress',
    });

    const res = await execute(() =>
      api.updateRoadmap(id, {
        stages: [{ stageNumber, completed: newCompleted }],
      })
    );

    if (res && res.data && res.data.roadmap) {
      setRoadmap(res.data.roadmap);
    }
  };

  return (
    <div className="stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="small" style={{ margin: 0 }}>
          <Link to="/roadmap">← Back to All Roadmaps</Link>
        </p>
        {roadmap && roadmap.analysisId && (
          <Link to={`/analysis/${roadmap.analysisId}`} className="small">
            View Source Skill Gap Analysis →
          </Link>
        )}
      </div>

      <AsyncBoundary
        status={roadmapQuery.status}
        error={roadmapQuery.error}
        onRetry={roadmapQuery.retry}
        loadingLabel="Loading your learning roadmap…"
      >
        {roadmap ? (
          <div className="stack">
            {/* Header / Summary Card */}
            <div className="card pad-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 style={{ margin: '0 0 8px' }}>{roadmap.title}</h1>
                  {roadmap.objective && (
                    <p className="muted" style={{ margin: '0 0 8px', maxWidth: 700 }}>
                      {roadmap.objective}
                    </p>
                  )}
                  <p className="small muted" style={{ margin: 0 }}>
                    Created {formatDate(roadmap.createdAt)} · Total Estimated Learning: {roadmap.totalEstimatedHours || 0} hrs
                  </p>
                </div>
                <div>
                  <span className={`badge ${roadmap.progressPercentage === 100 ? 'strong' : 'moderate'}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
                    {roadmap.progressPercentage}% Completed
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="small muted">Roadmap Progress</span>
                  <span className="small" style={{ fontWeight: 600 }}>{roadmap.progressPercentage}%</span>
                </div>
                <ProgressBar
                  value={roadmap.progressPercentage}
                  variant={roadmap.progressPercentage === 100 ? 'strong' : 'moderate'}
                />
              </div>
            </div>

            <FieldErrors error={error} />

            {/* Stages List */}
            <div className="stack">
              <h2>Learning Stages ({roadmap.stages.length})</h2>
              {roadmap.stages.map((stage) => (
                <div
                  key={stage.stageNumber}
                  className="card pad-md"
                  style={{
                    borderLeft: stage.completed
                      ? '4px solid var(--c-success)'
                      : '4px solid var(--c-primary)',
                    background: stage.completed ? 'var(--c-surface-alt)' : 'var(--c-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: 3 }}>
                        <input
                          type="checkbox"
                          checked={stage.completed}
                          disabled={pending}
                          onChange={() => toggleStage(stage.stageNumber, stage.completed)}
                          style={{ width: 18, height: 18, cursor: 'pointer' }}
                        />
                      </label>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, textDecoration: stage.completed ? 'line-through' : 'none' }}>
                            Stage {stage.stageNumber}: {stage.title}
                          </h3>
                          {stage.skillName && (
                            <span className="badge" style={{ fontSize: '0.75rem' }}>
                              Skill: {stage.skillName}
                            </span>
                          )}
                          <span className="badge low" style={{ fontSize: '0.75rem' }}>
                            Priority {stage.priority}/5
                          </span>
                        </div>
                        {stage.reason && (
                          <p className="small muted" style={{ margin: '6px 0 0' }}>
                            {stage.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="small muted" style={{ whiteSpace: 'nowrap' }}>
                      ~{stage.estimatedHours || 15} hours
                    </div>
                  </div>

                  {/* Learning Resources */}
                  {stage.resources && stage.resources.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--c-border)' }}>
                      <span className="small" style={{ fontWeight: 600 }}>Curated Learning Resources:</span>
                      <ul className="bullets" style={{ marginTop: 6 }}>
                        {stage.resources.map((res, ri) => (
                          <li key={ri} style={{ marginBottom: 4 }}>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontWeight: 500 }}
                            >
                              {res.title} ↗
                            </a>{' '}
                            <span className="small muted">
                              ({res.provider || 'Web'} · {res.resourceType || 'Guide'} · {res.isFree !== false ? 'Free' : 'Paid'})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Hands-on Projects */}
                  {stage.projects && stage.projects.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <span className="small" style={{ fontWeight: 600 }}>Hands-on Practice / Projects:</span>
                      <ul className="bullets" style={{ marginTop: 4 }}>
                        {stage.projects.map((proj, pi) => (
                          <li key={pi} className="small muted" style={{ marginBottom: 2 }}>
                            {proj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </div>
  );
}
