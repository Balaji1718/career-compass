import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary, { EmptyState, LoadingState } from '../components/AsyncBoundary.jsx';
import { LevelDots, LEVEL_LABELS, Notice, FieldErrors } from '../components/ui.jsx';

const SOURCE_LABELS = {
  manual: 'Added by you',
  resume: 'From your resume',
  assessment: 'From an assessment',
  ai_suggested: 'Suggested by AI',
};

export default function Skills() {
  const mine = useAsync((signal) => api.listUserSkills(signal).then((r) => r.data.skills), []);
  const [filter, setFilter] = useState('');

  const visible = useMemo(() => {
    const list = mine.data || [];
    if (!filter.trim()) return list;
    const needle = filter.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        String(s.category).toLowerCase().includes(needle)
    );
  }, [mine.data, filter]);

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Your skills</h1>
        <p>
          Everything here feeds the matching engine. Rate yourself honestly — the
          gap report is only as useful as the levels you record.
        </p>
      </div>

      <AddSkillPanel onAdded={mine.retry} existing={mine.data || []} />
      <ResumePanel onImported={mine.retry} existing={mine.data || []} />

      <section className="card">
        <div className="card-title">
          <h2>Recorded skills {mine.data ? `(${mine.data.length})` : ''}</h2>
          <div style={{ minWidth: 220 }}>
            <label htmlFor="skill-filter" className="small muted">
              Filter your list
            </label>
            <input
              id="skill-filter"
              type="search"
              value={filter}
              placeholder="Search your skills"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <AsyncBoundary
          status={mine.status}
          error={mine.error}
          onRetry={mine.retry}
          loadingLabel="Loading your skills…"
          isEmpty={(mine.data || []).length === 0}
          empty={
            <EmptyState
              title="You haven't added any skills yet."
              message="Use the search above to find a skill and set your level."
            />
          }
        >
          {visible.length === 0 ? (
            <EmptyState
              title="No skills match that filter."
              message="Try a different word, or clear the filter."
            />
          ) : (
            <SkillTable skills={visible} onChanged={mine.retry} />
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}

function SkillTable({ skills, onChanged }) {
  const { pending, error, execute } = useAction();
  const [busyId, setBusyId] = useState(null);

  async function updateLevel(row, level) {
    setBusyId(row._id);
    await execute(() => api.updateUserSkill(row._id, { proficiencyLevel: Number(level) }));
    setBusyId(null);
    onChanged();
  }

  async function confirmVerified(row) {
    setBusyId(row._id);
    await execute(() => api.updateUserSkill(row._id, { verified: true }));
    setBusyId(null);
    onChanged();
  }

  async function remove(row) {
    setBusyId(row._id);
    await execute(() => api.deleteUserSkill(row._id));
    setBusyId(null);
    onChanged();
  }

  return (
    <>
      <FieldErrors error={error} />
      <div className="table-scroll">
        <table className="data">
          <caption className="sr-only" style={{ display: 'none' }}>
            Your recorded skills and proficiency levels
          </caption>
          <thead>
            <tr>
              <th scope="col">Skill</th>
              <th scope="col">Proficiency</th>
              <th scope="col">Source</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((row) => (
              <tr key={row._id}>
                <td>
                  <strong>{row.name}</strong>
                  <div className="small muted">{row.category}</div>
                </td>
                <td>
                  <div className="row">
                    <LevelDots level={row.proficiencyLevel} />
                    <label
                      className="sr-only"
                      style={{ display: 'none' }}
                      htmlFor={`lvl-${row._id}`}
                    >
                      Proficiency for {row.name}
                    </label>
                    <select
                      id={`lvl-${row._id}`}
                      aria-label={`Proficiency level for ${row.name}`}
                      value={row.proficiencyLevel}
                      disabled={pending && busyId === row._id}
                      onChange={(e) => updateLevel(row, e.target.value)}
                      style={{ width: 160 }}
                    >
                      {[1, 2, 3, 4].map((level) => (
                        <option key={level} value={level}>
                          {level} — {LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <span className="badge neutral">
                    {SOURCE_LABELS[row.source] || row.source}
                  </span>
                  {!row.verified ? (
                    <div className="small muted">Awaiting your confirmation</div>
                  ) : null}
                </td>
                <td>
                  <div className="row">
                    {!row.verified ? (
                      <button
                        type="button"
                        className="btn small"
                        disabled={pending && busyId === row._id}
                        onClick={() => confirmVerified(row)}
                      >
                        Confirm
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn secondary small"
                      disabled={pending && busyId === row._id}
                      onClick={() => remove(row)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted mt-4" style={{ marginBottom: 0 }}>
        Only confirmed skills are used in matching. Skills suggested by AI stay
        unconfirmed until you accept them.
      </p>
    </>
  );
}

function AddSkillPanel({ onAdded, existing }) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [level, setLevel] = useState(2);
  const [selected, setSelected] = useState(null);
  const { pending, error, execute } = useAction();
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const search = useAsync(
    (signal) =>
      debounced.length < 2
        ? Promise.resolve([])
        : api
            .listSkills({ search: debounced, limit: 10 }, signal)
            .then((r) => r.data.skills),
    [debounced]
  );

  const owned = new Set(existing.map((s) => String(s.skillId)));

  async function add(skill) {
    setSelected(skill);
    const result = await execute(() =>
      api.addUserSkill({ skillId: skill._id, proficiencyLevel: Number(level) })
    );
    if (result) {
      setConfirmation(`${skill.name} added at ${LEVEL_LABELS[level]}.`);
      setTerm('');
      setDebounced('');
      onAdded();
    }
  }

  return (
    <section className="card" aria-labelledby="add-skill-title">
      <h2 id="add-skill-title">Add a skill</h2>
      <FieldErrors error={error} />
      {confirmation ? <Notice kind="success">{confirmation}</Notice> : null}

      <div className="grid cols-2 mt-4">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="skill-search">Search the skill catalogue</label>
          <input
            id="skill-search"
            type="search"
            value={term}
            placeholder="e.g. JavaScript, databases, testing"
            onChange={(e) => setTerm(e.target.value)}
          />
          <p className="hint">Type at least two characters.</p>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="new-level">Your level</label>
          <select
            id="new-level"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((l) => (
              <option key={l} value={l}>
                {l} — {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        {debounced.length < 2 ? (
          <p className="muted small" style={{ margin: 0 }}>
            Start typing to search standardised skills.
          </p>
        ) : search.status === 'loading' ? (
          <LoadingState label="Searching skills…" />
        ) : search.status === 'error' ? (
          <Notice kind="error">
            We couldn&apos;t search skills right now.{' '}
            <button type="button" className="btn small" onClick={search.retry}>
              Try Again
            </button>
          </Notice>
        ) : (search.data || []).length === 0 ? (
          <p className="muted small" style={{ margin: 0 }}>
            No skills match “{debounced}”. Try a broader word.
          </p>
        ) : (
          <ul className="clean">
            {search.data.map((skill) => (
              <li key={skill._id} className="row between">
                <span>
                  <strong>{skill.name}</strong>
                  <span className="muted small"> · {skill.category}</span>
                </span>
                {owned.has(String(skill._id)) ? (
                  <span className="badge neutral">Already added</span>
                ) : (
                  <button
                    type="button"
                    className="btn small"
                    disabled={pending && selected && selected._id === skill._id}
                    onClick={() => add(skill)}
                  >
                    {pending && selected && selected._id === skill._id
                      ? 'Adding…'
                      : 'Add'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ResumePanel({ onImported, existing }) {
  const [file, setFile] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [aiMessage, setAiMessage] = useState('');
  const { pending, error, execute } = useAction();
  const add = useAction();

  const owned = new Set(existing.map((s) => String(s.skillId)));

  async function upload(event) {
    event.preventDefault();
    if (!file) return;
    const result = await execute(() => api.parseResume(file));
    if (result) {
      setSuggestions(result.data.suggestions);
      setAiMessage(result.data.aiMessage || '');
    }
  }

  async function accept(item) {
    await add.execute(() =>
      api.addUserSkill({
        skillId: item.skillId,
        proficiencyLevel: item.proficiencyLevel,
        source: item.source,
        verified: false,
        evidence: item.evidence ? [item.evidence] : [],
      })
    );
    setSuggestions((prev) => prev.filter((s) => s.skillId !== item.skillId));
    onImported();
  }

  return (
    <details className="card">
      <summary style={{ cursor: 'pointer', fontWeight: 650 }}>
        Import skills from a resume (optional)
      </summary>
      <p className="muted small mt-4">
        PDF or DOCX, up to 5 MB. Nothing is saved to your profile automatically —
        you review every suggestion first.
      </p>

      <FieldErrors error={error} />
      {aiMessage ? <Notice kind="warn">{aiMessage}</Notice> : null}

      <form onSubmit={upload} className="row mt-4">
        <div className="field" style={{ marginBottom: 0, flex: '1 1 260px' }}>
          <label htmlFor="resume">Resume file</label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>
        <button type="submit" className="btn" disabled={!file || pending}>
          {pending ? 'Reading your resume…' : 'Find skills'}
        </button>
      </form>

      {suggestions ? (
        suggestions.length === 0 ? (
          <p className="muted small mt-4">
            We didn&apos;t find any catalogue skills in that file. You can still add
            skills manually above.
          </p>
        ) : (
          <div className="mt-4">
            <h3>Review suggested skills</h3>
            <FieldErrors error={add.error} />
            <ul className="clean">
              {suggestions.map((item) => (
                <li key={item.skillId} className="row between">
                  <span>
                    <strong>{item.name}</strong>
                    <span className="muted small">
                      {' '}
                      · suggested level {item.proficiencyLevel}
                    </span>
                  </span>
                  {owned.has(String(item.skillId)) ? (
                    <span className="badge neutral">Already added</span>
                  ) : (
                    <button
                      type="button"
                      className="btn small"
                      disabled={add.pending}
                      onClick={() => accept(item)}
                    >
                      Add for review
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </details>
  );
}
