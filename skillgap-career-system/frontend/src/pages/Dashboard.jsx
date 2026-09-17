import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState } from '../components/AsyncBoundary.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  MatchBadge,
  ProgressBar,
  LevelDots,
  Notice,
  formatDate,
} from '../components/ui.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { status, data, error, retry } = useAsync(
    (signal) => api.dashboard(signal).then((r) => r.data),
    []
  );

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Welcome back, {user.name.split(' ')[0]}</h1>
        <p>
          Your skills, your closest career matches and what to learn next — all
          calculated from the skills you have recorded.
        </p>
      </div>

      <AsyncBoundary
        status={status}
        error={error}
        onRetry={retry}
        loadingLabel="Loading your dashboard…"
      >
        {data ? <DashboardBody data={data} /> : null}
      </AsyncBoundary>
    </div>
  );
}

function DashboardBody({ data }) {
  if (data.skillCount === 0) {
    return (
      <div className="card pad-lg">
        <EmptyState
          title="Add your first skills to get started."
          message="Career matching needs at least a few skills. It takes about two minutes."
          action={
            <Link className="btn" to="/skills">
              Add your skills
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="stack">
      {!data.aiConfigured ? (
        <Notice kind="warn">
          AI explanations are not configured on this server. Every score, ranking
          and roadmap below is still produced by the built-in matching engine.
        </Notice>
      ) : null}

      <div className="grid cols-4">
        <div className="card">
          <p className="stat-label">Skills recorded</p>
          <p className="stat">{data.skillCount}</p>
          <Link className="small" to="/skills">
            Manage skills
          </Link>
        </div>
        <div className="card">
          <p className="stat-label">Latest career match</p>
          {data.latestAnalysis ? (
            <>
              <p className="stat">{data.latestAnalysis.overallMatchScore}%</p>
              <p className="small muted" style={{ margin: 0 }}>
                {data.latestAnalysis.careerTitle}
              </p>
            </>
          ) : (
            <>
              <p className="stat">—</p>
              <Link className="small" to="/analysis">
                Run your first analysis
              </Link>
            </>
          )}
        </div>
        <div className="card">
          <p className="stat-label">Gap summary</p>
          {data.latestAnalysis ? (
            <p className="small" style={{ marginTop: 8 }}>
              <strong>{data.latestAnalysis.matchedCount}</strong> matched ·{' '}
              <strong>{data.latestAnalysis.weakCount}</strong> weak ·{' '}
              <strong>{data.latestAnalysis.missingCount}</strong> missing
            </p>
          ) : (
            <p className="small muted" style={{ marginTop: 8 }}>
              Run an analysis to see your gaps.
            </p>
          )}
        </div>
        <div className="card">
          <p className="stat-label">Roadmap progress</p>
          {data.roadmap ? (
            <>
              <p className="stat">{data.roadmap.progressPercentage}%</p>
              <ProgressBar
                value={data.roadmap.progressPercentage}
                label="Roadmap progress"
              />
              <Link className="small" to={`/roadmap/${data.roadmap._id}`}>
                Open roadmap
              </Link>
            </>
          ) : (
            <>
              <p className="stat">—</p>
              <span className="small muted">No roadmap yet.</span>
            </>
          )}
        </div>
      </div>

      <div className="grid cols-2">
        <section className="card">
          <div className="card-title">
            <h2>Top career matches</h2>
            <Link className="small" to="/recommendations">
              See all
            </Link>
          </div>
          {data.topRecommendations.length ? (
            <ul className="clean">
              {data.topRecommendations.map((rec, index) => (
                <li key={rec.careerId} className="row between">
                  <span>
                    {index + 1}.{' '}
                    <Link to={`/careers/${rec.careerId}`}>{rec.title}</Link>
                  </span>
                  <MatchBadge score={rec.score} classification={rec.classification} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">
              No careers could be ranked yet. Add more skills to improve matching.
            </p>
          )}
        </section>

        <section className="card">
          <div className="card-title">
            <h2>Your strongest skills</h2>
            <Link className="small" to="/skills">
              Edit
            </Link>
          </div>
          {data.strongestSkills.length ? (
            <ul className="clean">
              {data.strongestSkills.map((skill) => (
                <li key={skill.name} className="row between">
                  <span>{skill.name}</span>
                  <LevelDots level={skill.proficiencyLevel} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">
              No Advanced or Expert skills recorded yet.
            </p>
          )}

          <h3 className="mt-4">Skills to strengthen</h3>
          {data.weakestSkills.length ? (
            <ul className="clean">
              {data.weakestSkills.map((skill) => (
                <li key={skill.name} className="row between">
                  <span>{skill.name}</span>
                  <LevelDots level={skill.proficiencyLevel} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">Nothing below Intermediate. Nice work.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-title">
          <h2>Recent analyses</h2>
          <Link className="small" to="/history">
            Full history
          </Link>
        </div>
        {data.recentAnalyses.length ? (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Career</th>
                  <th scope="col">Score</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAnalyses.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <Link to={`/analysis/${row._id}`}>{row.careerTitle}</Link>
                    </td>
                    <td>
                      <MatchBadge
                        score={row.overallMatchScore}
                        classification={row.matchClassification}
                      />
                    </td>
                    <td className="muted small">{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small">
            You haven&apos;t run an analysis yet. <Link to="/analysis">Start one</Link>.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Quick actions</h2>
        <div className="row">
          <Link className="btn" to="/analysis">
            Run a skill gap analysis
          </Link>
          <Link className="btn secondary" to="/skills">
            Add a skill
          </Link>
          <Link className="btn secondary" to="/careers">
            Browse careers
          </Link>
          <Link className="btn secondary" to="/profile">
            Update profile
          </Link>
        </div>
      </section>
    </div>
  );
}
