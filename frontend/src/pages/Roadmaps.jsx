import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState } from '../components/AsyncBoundary.jsx';
import { ProgressBar, formatDate } from '../components/ui.jsx';

export default function Roadmaps() {
  const roadmapsQuery = useAsync(
    (signal) => api.listRoadmaps({ limit: 50 }, signal).then((r) => r.data.roadmaps),
    []
  );

  const list = roadmapsQuery.data || [];

  const statusLabel = (st) => {
    switch (st) {
      case 'completed':
        return <span className="badge strong">Completed</span>;
      case 'in_progress':
        return <span className="badge moderate">In Progress</span>;
      default:
        return <span className="badge">Not Started</span>;
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Learning Roadmaps</h1>
        <p>
          Step-by-step personalized learning paths generated from your skill gap analyses.
          Follow structured stages, explore free learning resources, and track your milestone completions.
        </p>
      </div>

      <AsyncBoundary
        status={roadmapsQuery.status}
        error={roadmapsQuery.error}
        onRetry={roadmapsQuery.retry}
        loadingLabel="Loading your learning roadmaps…"
        isEmpty={list.length === 0}
        empty={
          <div className="card pad-lg">
            <EmptyState
              title="No roadmaps created yet"
              message="Run a skill gap analysis for any target career to generate your first learning roadmap."
              action={
                <Link to="/analysis" className="btn">
                  Analyze a Career
                </Link>
              }
            />
          </div>
        }
      >
        <div className="stack">
          {list.map((rm) => (
            <div key={rm._id} className="card pad-md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                      <Link to={`/roadmap/${rm._id}`}>{rm.title}</Link>
                    </h2>
                    {statusLabel(rm.status)}
                  </div>
                  <p className="small muted" style={{ margin: 0 }}>
                    Created {formatDate(rm.createdAt)} · Estimated total time: {rm.totalEstimatedHours || 0} hours
                  </p>
                </div>

                <div>
                  <Link to={`/roadmap/${rm._id}`} className="btn small">
                    Open Roadmap →
                  </Link>
                </div>
              </div>

              <div style={{ marginTop: 16, maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="small muted">Completion Progress</span>
                  <span className="small" style={{ fontWeight: 600 }}>{rm.progressPercentage || 0}%</span>
                </div>
                <ProgressBar
                  value={rm.progressPercentage || 0}
                  variant={rm.progressPercentage === 100 ? 'strong' : 'moderate'}
                />
              </div>
            </div>
          ))}
        </div>
      </AsyncBoundary>
    </div>
  );
}
