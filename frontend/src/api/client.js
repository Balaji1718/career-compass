/**
 * Single API client. Every request is same-origin (one Express server),
 * and credentials are sent so the HTTP-only session cookie travels with it.
 * No authentication token is ever kept in localStorage.
 */

export class ApiError extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details || [];
  }
}

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';
const OFFLINE_MESSAGE =
  'You appear to be offline. Check your connection and try again.';

async function request(path, { method = 'GET', body, signal, isForm } = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError(OFFLINE_MESSAGE, 'OFFLINE', 0);
  }

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    throw new ApiError(OFFLINE_MESSAGE, 'NETWORK_ERROR', 0);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_err) {
    payload = null;
  }

  if (!response.ok || !payload || payload.success !== true) {
    const error = (payload && payload.error) || {};
    throw new ApiError(
      error.message || GENERIC_MESSAGE,
      error.code || 'UNKNOWN',
      response.status,
      error.details
    );
  }

  return { data: payload.data, meta: payload.meta };
}

function qs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const str = search.toString();
  return str ? `?${str}` : '';
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: (signal) => request('/auth/me', { signal }),

  // profile
  getProfile: (signal) => request('/profile', { signal }),
  updateProfile: (body) => request('/profile', { method: 'PUT', body }),

  // skills catalogue
  listSkills: (params, signal) => request(`/skills${qs(params)}`, { signal }),
  skillCategories: (signal) => request('/skills/categories', { signal }),

  // user skills
  listUserSkills: (signal) => request('/user-skills', { signal }),
  addUserSkill: (body) => request('/user-skills', { method: 'POST', body }),
  updateUserSkill: (id, body) => request(`/user-skills/${id}`, { method: 'PUT', body }),
  deleteUserSkill: (id) => request(`/user-skills/${id}`, { method: 'DELETE' }),

  // careers
  listCareers: (params, signal) => request(`/careers${qs(params)}`, { signal }),
  careerCategories: (signal) => request('/careers/categories', { signal }),
  getCareer: (id, signal) => request(`/careers/${id}`, { signal }),

  // analyses
  createAnalysis: (careerId) => request('/analyses', { method: 'POST', body: { careerId } }),
  listAnalyses: (params, signal) => request(`/analyses${qs(params)}`, { signal }),
  getAnalysis: (id, signal) => request(`/analyses/${id}`, { signal }),

  // recommendations
  recommendations: (params, signal) =>
    request(`/recommendations/careers${qs(params)}`, { signal }),

  // roadmaps
  createRoadmap: (body) => request('/roadmaps', { method: 'POST', body }),
  listRoadmaps: (params, signal) => request(`/roadmaps${qs(params)}`, { signal }),
  getRoadmap: (id, signal) => request(`/roadmaps/${id}`, { signal }),
  updateRoadmap: (id, body) => request(`/roadmaps/${id}`, { method: 'PUT', body }),

  // learning resources
  listLearningResources: (params, signal) =>
    request(`/learning-resources${qs(params)}`, { signal }),

  // dashboard
  dashboard: (signal) => request('/dashboard', { signal }),

  // resume (optional feature)
  parseResume: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return request('/resume/parse', { method: 'POST', body: form, isForm: true });
  },
};
