import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState } from '../components/AsyncBoundary.jsx';
import { MatchBadge } from '../components/ui.jsx';

export default function Careers() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const categories = useAsync(
    (signal) => api.careerCategories(signal).then((r) => r.data.categories),
    []
  );

  const careers = useAsync(
    (signal) =>
      api
        .listCareers({ search: debounced, category, page, limit: 12 }, signal)
        .then((r) => r),
    [debounced, category, page]
  );

  const list = careers.data ? careers.data.data.careers : [];
  const meta = careers.data ? careers.data.meta : null;

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Careers</h1>
        <p>
          Occupations and their skill requirements come from the ESCO
          classification. Match scores are calculated against the skills in your
          profile.
        </p>
      </div>

      <section className="card">
        <div className="grid cols-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="career-search">Search careers</label>
            <input
              id="career-search"
              type="search"
              value={search}
              placeholder="e.g. developer, data, security"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="career-category">Category</label>
            <select
              id="career-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {(categories.data || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <AsyncBoundary
        status={careers.status}
        error={careers.error}
        onRetry={careers.retry}
        loadingLabel="Loading careers…"
        isEmpty={list.length === 0}
        empty={
          <div className="card">
            <EmptyState
              title="No careers found."
              message={
                debounced || category
                  ? 'Try a different search term or clear the category filter.'
                  : 'The career database is empty. Run the seed command to load the ESCO dataset.'
              }
            />
          </div>
        }
      >
        <>
          <div className="grid cols-3">
            {list.map((career) => (
              <article className="card" key={career._id}>
                <div className="card-title">
                  <h3 style={{ marginBottom: 0 }}>
                    <Link to={`/careers/${career._id}`}>{career.title}</Link>
                  </h3>
                </div>
                <p className="badge neutral">{career.category}</p>
                <p className="small muted" style={{ marginTop: 8 }}>
                  {career.description
                    ? `${career.description.slice(0, 150)}${career.description.length > 150 ? '…' : ''}`
                    : 'No description recorded for this occupation.'}
                </p>
                {typeof career.matchScore === 'number' ? (
                  <MatchBadge
                    score={career.matchScore}
                    classification={career.matchClassification}
                  />
                ) : (
                  <span className="badge neutral">No match score yet</span>
                )}
              </article>
            ))}
          </div>

          {meta && meta.totalPages > 1 ? (
            <nav className="row between mt-4" aria-label="Career list pages">
              <button
                type="button"
                className="btn secondary small"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="small muted">
                Page {meta.page} of {meta.totalPages} · {meta.total} careers
              </span>
              <button
                type="button"
                className="btn secondary small"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      </AsyncBoundary>
    </div>
  );
}
