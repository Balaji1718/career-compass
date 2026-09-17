import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAsync, useAction } from '../hooks/useAsync.js';
import AsyncBoundary from '../components/AsyncBoundary.jsx';
import { FieldErrors, Notice } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EXPERIENCE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'entry', label: 'Entry Level (0-1 yrs)' },
  { value: 'junior', label: 'Junior (1-3 yrs)' },
  { value: 'mid', label: 'Mid Level (3-5 yrs)' },
  { value: 'senior', label: 'Senior (5-8 yrs)' },
  { value: 'lead', label: 'Lead / Principal (8+ yrs)' },
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const profileQuery = useAsync((signal) => api.getProfile(signal).then((r) => r.data), []);
  const { pending, error, success, execute, setSuccess } = useAction();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    experienceLevel: 'student',
    yearsOfExperience: 0,
    interests: '',
    preferredDomains: '',
    careerGoal: '',
    bio: '',
    education: [],
  });

  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data.profile || {};
      const u = profileQuery.data.user || user || {};
      setForm({
        name: u.name || '',
        phone: p.phone || '',
        location: p.location || '',
        experienceLevel: p.experienceLevel || 'student',
        yearsOfExperience: p.yearsOfExperience || 0,
        interests: Array.isArray(p.interests) ? p.interests.join(', ') : '',
        preferredDomains: Array.isArray(p.preferredDomains) ? p.preferredDomains.join(', ') : '',
        careerGoal: p.careerGoal || '',
        bio: p.bio || '',
        education: Array.isArray(p.education) && p.education.length > 0 ? p.education : [
          { degree: '', field: '', institution: '', graduationYear: '' }
        ],
      });
    }
  }, [profileQuery.data, user]);

  const handleEducationChange = (index, field, value) => {
    const next = [...form.education];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, education: next });
  };

  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { degree: '', field: '', institution: '', graduationYear: '' }],
    });
  };

  const removeEducation = (index) => {
    const next = form.education.filter((_, i) => i !== index);
    setForm({ ...form, education: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      experienceLevel: form.experienceLevel,
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      careerGoal: form.careerGoal.trim(),
      bio: form.bio.trim(),
      interests: form.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      preferredDomains: form.preferredDomains
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      education: form.education
        .filter((edu) => edu.degree || edu.institution)
        .map((edu) => ({
          degree: (edu.degree || '').trim(),
          field: (edu.field || '').trim(),
          institution: (edu.institution || '').trim(),
          graduationYear: edu.graduationYear ? Number(edu.graduationYear) : undefined,
        })),
    };

    const res = await execute(() => api.updateProfile(payload));
    if (res) {
      if (refreshUser) refreshUser();
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1>User Profile</h1>
        <p>Keep your background and preferences updated for accurate career recommendations.</p>
      </div>

      <AsyncBoundary
        status={profileQuery.status}
        error={profileQuery.error}
        onRetry={profileQuery.retry}
        loadingLabel="Loading your profile…"
      >
        <form className="stack" onSubmit={handleSubmit}>
          {success ? (
            <Notice kind="success">Profile updated successfully!</Notice>
          ) : null}
          <FieldErrors error={error} />

          {/* Personal Info */}
          <section className="card">
            <h2>Personal Information</h2>
            <div className="grid cols-2">
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. San Francisco, CA / London, UK"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="yearsOfExperience">Years of Experience</label>
                <input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="60"
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="careerGoal">Primary Career Goal</label>
                <input
                  id="careerGoal"
                  type="text"
                  placeholder="e.g. Become a Senior Full-Stack Engineer"
                  value={form.careerGoal}
                  onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="bio">Professional Bio</label>
              <textarea
                id="bio"
                rows="3"
                placeholder="Brief summary of your passions, skills, and goals..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </section>

          {/* Interests & Domains */}
          <section className="card">
            <h2>Interests & Target Domains</h2>
            <div className="grid cols-2">
              <div className="field">
                <label htmlFor="interests">Interests (comma separated)</label>
                <input
                  id="interests"
                  type="text"
                  placeholder="e.g. Open Source, Cloud Architecture, Generative AI"
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="preferredDomains">Preferred Domains (comma separated)</label>
                <input
                  id="preferredDomains"
                  type="text"
                  placeholder="e.g. FinTech, Healthcare, Web3, SaaS"
                  value={form.preferredDomains}
                  onChange={(e) => setForm({ ...form, preferredDomains: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Education Records */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Education</h2>
              <button type="button" className="btn secondary small" onClick={addEducation}>
                + Add Education
              </button>
            </div>

            {form.education.length === 0 ? (
              <p className="muted small">No education records added yet.</p>
            ) : (
              <div className="stack">
                {form.education.map((edu, idx) => (
                  <div key={idx} className="card pad-md" style={{ background: 'var(--c-surface-alt)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="small muted">Education Record #{idx + 1}</span>
                      <button
                        type="button"
                        className="btn small"
                        style={{ padding: '2px 8px', fontSize: '0.8rem', color: 'var(--c-danger)' }}
                        onClick={() => removeEducation(idx)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid cols-2">
                      <div className="field" style={{ marginBottom: 8 }}>
                        <label>Degree</label>
                        <input
                          type="text"
                          placeholder="e.g. Bachelor of Science"
                          value={edu.degree || ''}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <label>Field of Study</label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={edu.field || ''}
                          onChange={(e) => handleEducationChange(idx, 'field', e.target.value)}
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Institution / University</label>
                        <input
                          type="text"
                          placeholder="e.g. Stanford University"
                          value={edu.institution || ''}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Graduation Year</label>
                        <input
                          type="number"
                          min="1950"
                          max="2100"
                          placeholder="e.g. 2024"
                          value={edu.graduationYear || ''}
                          onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="submit" className="btn" disabled={pending}>
              {pending ? 'Saving Changes…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </AsyncBoundary>
    </div>
  );
}
