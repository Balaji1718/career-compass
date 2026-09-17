import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary from '../components/AsyncBoundary.jsx';
import { MatchBadge, LEVEL_LABELS, FieldErrors } from '../components/ui.jsx';

export default function CareerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pending, error, execute } = useAction();

  const career = useAsync(
    (signal) => api.getCareer(id, signal).then((r) => r.data),
    [id]
  );

  async function runAnalysis() {
    const result = await execute(() => api.createAnalysis(id));
    if (result) navigate(`/analysis/${result.data.analysis._id}`);
  }

  return (
    <div className="stack">
      <p className="small">
        <Link to="/careers">← Back to careers</Link>
      </p>

      <AsyncBoundary
        status={career.status}
        error={career.error}
        onRetry={career.retry}
        loadingLabel="Loading this career…"
      >
        {career.data ? (
          <Body
            data={career.data}
            onAnalyse={runAnalysis}
            pending={pending}
            error={error}
          />
        ) : null}
      </AsyncBoundary>
    </div>
  );
}

function SkillList({ title, items, emptyText }) {
  return (
    <section className="card">
      <h2>
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="muted small">{emptyText}</p>
      ) : (
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Skill</th>
                <th scope="col">Minimum level</th>
                <th scope="col">Importance</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.skillId}>
                  <td>
                    {item.skillName}
                    {item.isCore ? (
                      <span className="badge moderate" style={{ marginLeft: 8 }}>
                        Core
                      </span>
                    ) : null}
                  </td>
                  <td>
                    {item.minimumLevel} — {LEVEL_LABELS[item.minimumLevel]}
                  </td>
                  <td>{item.importance} / 5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Body({ data, onAnalyse, pending, error }) {
  const { career, requiredSkills, preferredSkills, analysisPreview } = data;

  return (
    <div className="stack">
      <div className="card pad-lg">
        <div className="row between">
          <div>
            <h1 style={{ marginBottom: 6 }}>{career.title}</h1>
            <span className="badge neutral">{career.category}</span>
          </div>
          {analysisPreview ? (
            <MatchBadge
              score={analysisPreview.overallMatchScore}
              classification={analysisPreview.matchClassification}
            />
          ) : null}
        </div>

        <p className="mt-4">
          {career.overview || career.description || 'No description recorded.'}
        </p>

        {analysisPreview ? (
          <p className="small muted">
            Against your current profile: {analysisPreview.matchedCount} matched,{' '}
            {analysisPreview.weakCount} weak, {analysisPreview.missingCount} missing
            — {analysisPreview.skillCoverage}% coverage.
          </p>
        ) : null}

        <FieldErrors error={error} />
        <div className="row mt-4">
          <button type="button" className="btn" onClick={onAnalyse} disabled={pending}>
            {pending ? 'Analysing your skill profile…' : 'Run skill gap analysis'}
          </button>
        </div>
      </div>

      <div className="grid cols-2">
        <section className="card">
          <h2>Education</h2>
          {career.educationRequirements && career.educationRequirements.length ? (
            <ul className="bullets">
              {career.educationRequirements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted small">
              The source dataset records no formal education requirement for this
              occupation.
            </p>
          )}
          <h3 className="mt-4">Experience levels</h3>
          <div className="row">
            {(career.experienceLevels || []).map((level) => (
              <span className="badge neutral" key={level}>
                {level}
              </span>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Responsibilities</h2>
          {career.responsibilities && career.responsibilities.length ? (
            <ul className="bullets">
              {career.responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted small">
              The source dataset does not list separate responsibilities; the
              description above summarises the role.
            </p>
          )}
        </section>
      </div>

      <SkillList
        title="Required skills"
        items={requiredSkills}
        emptyText="No required skills recorded."
      />
      <SkillList
        title="Preferred skills"
        items={preferredSkills}
        emptyText="No preferred skills recorded."
      />

      <section className="card">
        <h2>Related careers</h2>
        {career.relatedCareerIds && career.relatedCareerIds.length ? (
          <ul className="clean">
            {career.relatedCareerIds.map((rel) => (
              <li key={rel._id}>
                <Link to={`/careers/${rel._id}`}>{rel.title}</Link>{' '}
                <span className="muted small">· {rel.category}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">
            No related occupations are linked for this career.{' '}
            <Link to="/recommendations">See your ranked matches</Link> instead.
          </p>
        )}
      </section>
    </div>
  );
}
