import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState } from '../components/AsyncBoundary.jsx';
import { MatchBadge, formatDate } from '../components/ui.jsx';

export default function History() {
  const historyQuery = useAsync(
    (signal) => api.listAnalyses({ limit: 50 }, signal).then((r) => r.data.analyses),
    []
  );

  const list = historyQuery.data || [];

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Analysis History</h1>
        <p>
          Review every skill gap evaluation you have run across different career paths.
          Click on any record to inspect detailed breakdown, AI insights, and roadmap generation.
        </p>
      </div>

      <AsyncBoundary
        status={historyQuery.status}
        error={historyQuery.error}
        onRetry={historyQuery.retry}
        loadingLabel="Loading your analysis history…"
        isEmpty={list.length === 0}
        empty={
          <div className="card pad-lg">
            <EmptyState
              title="No analyses recorded yet"
              message="You haven't run any career skill-gap analyses yet. Pick a career to get started."
              action={
                <Link to="/analysis" className="btn">
                  Start Your First Analysis
                </Link>
              }
            />
          </div>
        }
      >
        <div className="card pad-none">
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Target Career</th>
                  <th scope="col">Match Score</th>
                  <th scope="col">Skill Coverage</th>
                  <th scope="col">Algorithm</th>
                  <th scope="col">Date Analyzed</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/analysis/${item._id}`} style={{ fontWeight: 600 }}>
                        {item.careerTitle}
                      </Link>
                    </td>
                    <td>
                      <MatchBadge
                        score={item.overallMatchScore}
                        classification={item.matchClassification}
                      />
                    </td>
                    <td>
                      <span className="small">{item.skillCoverage}% coverage</span>
                    </td>
                    <td>
                      <span className="small muted">{item.algorithmVersion}</span>
                    </td>
                    <td>
                      <span className="small muted">{formatDate(item.createdAt)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/analysis/${item._id}`} className="btn secondary small">
                        View Analysis →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AsyncBoundary>
    </div>
  );
}
