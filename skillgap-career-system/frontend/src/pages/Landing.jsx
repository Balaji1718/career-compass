import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="stack">
      <section className="card pad-lg" aria-labelledby="hero-title">
        <p className="badge moderate">Skill gap analysis for students</p>
        <h1 id="hero-title" style={{ marginTop: 12 }}>
          See exactly how your skills line up with real careers.
        </h1>
        <p className="muted" style={{ maxWidth: '62ch', fontSize: '1.05rem' }}>
          SkillBridge compares the skills you already have against the standardised
          requirements of real occupations, scores the match with a transparent
          formula, and turns the gaps into a learning roadmap you can follow.
        </p>
        <div className="row mt-4">
          <Link className="btn" to={isAuthenticated ? '/dashboard' : '/register'}>
            {isAuthenticated ? 'Go to your dashboard' : 'Get started free'}
          </Link>
          {!isAuthenticated ? (
            <Link className="btn secondary" to="/login">
              I already have an account
            </Link>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <div className="grid cols-4 steps">
          <article className="card">
            <h3>Record your skills</h3>
            <p className="muted small">
              Search a standardised skill catalogue and rate yourself from Beginner
              to Expert.
            </p>
          </article>
          <article className="card">
            <h3>Pick a career</h3>
            <p className="muted small">
              Browse occupations with their required and preferred skills, drawn from
              the ESCO classification.
            </p>
          </article>
          <article className="card">
            <h3>Get your gap report</h3>
            <p className="muted small">
              Matched, weak and missing skills, plus a weighted match score
              calculated by a fixed formula.
            </p>
          </article>
          <article className="card">
            <h3>Follow a roadmap</h3>
            <p className="muted small">
              Stages ordered by importance and gap size, with free learning resources
              and project ideas.
            </p>
          </article>
        </div>
      </section>

      <section className="grid cols-2" aria-labelledby="concepts-title">
        <h2 id="concepts-title" className="sr-only" style={{ display: 'none' }}>
          Key concepts
        </h2>
        <article className="card">
          <h3>What a skill gap actually is</h3>
          <p className="muted">
            Every career lists the skills it needs and the minimum level expected.
            A gap is the distance between that level and yours. A skill you have
            at Advanced when Intermediate is required is not a gap; a skill you
            have never recorded is a full gap.
          </p>
          <ul className="bullets muted small">
            <li>
              <strong>Matched</strong> — you meet or exceed the required level.
            </li>
            <li>
              <strong>Weak</strong> — you have the skill but below the required level.
            </li>
            <li>
              <strong>Missing</strong> — the skill is not in your profile at all.
            </li>
          </ul>
        </article>
        <article className="card">
          <h3>Scores you can check yourself</h3>
          <p className="muted">
            Your match score is a weighted average of per-skill matches, where each
            requirement is weighted by its importance. The same inputs always
            produce the same score, and every analysis records the algorithm
            version used.
          </p>
          <p className="muted small">
            AI is used only to explain results and to phrase your roadmap. It never
            decides a score or a ranking, and the platform stays fully usable when
            AI is unavailable.
          </p>
        </article>
      </section>
    </div>
  );
}
