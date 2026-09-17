import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState } from '../components/AsyncBoundary.jsx';
import { FieldErrors, MatchBadge } from '../components/ui.jsx';

export default function Analysis() {
  const navigate = useNavigate();
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const limit = 40;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const categoriesQuery = useAsync(
    (signal) => api.careerCategories(signal).then((r) => r.data.categories),
    []
  );

  const careersQuery = useAsync(
    (signal) =>
      api
        .listCareers({ limit, page, search: debouncedSearch, category }, signal)
        .then((r) => r),
    [debouncedSearch, category, page]
  );

  const { pending, error, execute } = useAction();

  const handleStartAnalysis = async (careerIdToAnalyze) => {
    const id = careerIdToAnalyze || selectedCareerId;
    if (!id) return;

    const res = await execute(() => api.createAnalysis(id));
    if (res && res.data && res.data.analysis) {
      navigate(`/analysis/${res.data.analysis._id}`);
    }
  };

  const careersList = careersQuery.data ? careersQuery.data.data.careers : [];
  const meta = careersQuery.data ? careersQuery.data.meta : null;
  const total = meta ? meta.total : careersList.length;
  const totalPages = meta ? meta.totalPages : 1;

  const selectedCareer = careersList.find((c) => c._id === selectedCareerId);

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Skill Gap Analysis</h1>
        <p>
          Select any career path to compare its standardized ESCO skill requirements against your recorded profile.
          The deterministic matching engine will calculate your compatibility score, identify your strengths, and list priority gaps.
        </p>
      </div>

      <FieldErrors error={error} />

      {/* Discovery / Filter Controls */}
      <section className="card">
        <h2>Find Your Target Career</h2>
        <div className="grid cols-2" style={{ gap: 16 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="analysis-search">Search by title or keyword</label>
            <input
              id="analysis-search"
              type="search"
              placeholder="e.g. software, data, cloud, devops, security..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="analysis-category">Filter by Category</label>
            <select
              id="analysis-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories ({total} total careers)</option>
              {(categoriesQuery.data || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Career Selection & Actions */}
      <AsyncBoundary
        status={careersQuery.status}
        error={careersQuery.error}
        onRetry={careersQuery.retry}
        loadingLabel="Loading career directory…"
        isEmpty={careersList.length === 0}
        empty={
          <div className="card pad-lg">
            <EmptyState
              title="No matching careers found"
              message="Try broadening your search term or clearing the category filter."
              action={
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                  }}
                >
                  Clear Filters
                </button>
              }
            />
          </div>
        }
      >
        <div className="stack">
          {/* Active selection summary if selected */}
          {selectedCareer && (
            <div className="card pad-md" style={{ borderLeft: '4px solid var(--c-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className="small muted">Selected Target Career:</span>
                  <h3 style={{ margin: '4px 0' }}>{selectedCareer.title}</h3>
                  <span className="badge" style={{ fontSize: '0.75rem' }}>{selectedCareer.category}</span>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn"
                    disabled={pending}
                    onClick={() => handleStartAnalysis(selectedCareer._id)}
                  >
                    {pending ? 'Analyzing Skill Gap…' : 'Run Full Skill Gap Analysis →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paginated Careers Table */}
          <div className="card pad-none">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="small muted">
                Showing {careersList.length} of {total} careers {category ? `in ${category}` : ''}
              </span>
              {totalPages > 1 && (
                <span className="small muted">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>

            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">Career Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Your Current Match</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {careersList.map((c) => {
                    const isSelected = c._id === selectedCareerId;
                    return (
                      <tr
                        key={c._id}
                        style={{
                          background: isSelected ? 'var(--c-primary-soft)' : undefined,
                        }}
                      >
                        <td>
                          <strong>{c.title}</strong>
                          <p className="small muted" style={{ margin: '2px 0 0', maxWidth: 450 }}>
                            {c.description ? c.description.slice(0, 110) + '…' : ''}
                          </p>
                        </td>
                        <td>
                          <span className="badge" style={{ fontSize: '0.75rem' }}>{c.category}</span>
                        </td>
                        <td>
                          {c.matchScore !== null && c.matchScore !== undefined ? (
                            <MatchBadge score={c.matchScore} classification={c.matchClassification} />
                          ) : (
                            <span className="small muted">—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn small"
                            disabled={pending}
                            onClick={() => {
                              setSelectedCareerId(c._id);
                              handleStartAnalysis(c._id);
                            }}
                          >
                            Analyze Now →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-border)' }}>
                <button
                  type="button"
                  className="btn secondary small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>
                <span className="small muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn secondary small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </AsyncBoundary>
    </div>
  );
}
