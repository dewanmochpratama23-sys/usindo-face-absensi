// API Client for USINDO Face Recognition Attendance System
const API_BASE = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('usindo_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('usindo_token', token);
    } else {
      localStorage.removeItem('usindo_token');
    }
  },

  getUser() {
    const raw = localStorage.getItem('usindo_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('usindo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('usindo_user');
    }
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // Auto logout on invalid token
      this.setToken(null);
      this.setUser(null);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `HTTP Error ${res.status}`);
    }
    return data;
  },

  // Auth endpoints
  async login(identifier, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async registerStudent(studentData) {
    return await this.request('/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  },

  async getMe() {
    const data = await this.request('/auth/me');
    if (data.user) {
      this.setUser(data.user);
    }
    return data.user;
  },

  // 1. Pendaftaran Wajah (Enrollment)
  async enrollFace(embeddings, identifier = '') {
    return await this.request('/enrollment', {
      method: 'POST',
      body: JSON.stringify({ embeddings, identifier })
    });
  },

  async resetEnrollment(identifier = '') {
    return await this.request('/enrollment/reset', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },

  // 2. Absensi Harian (Recognition)
  async verifyAttendance(payload) {
    return await this.request('/attendance/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Schedules
  async getSchedules() {
    const data = await this.request('/schedules');
    return data.schedules || [];
  },

  async toggleSchedule(scheduleId, isOpen) {
    return await this.request('/schedules/toggle', {
      method: 'POST',
      body: JSON.stringify({ scheduleId, isOpen })
    });
  },

  // 3. Monitoring & Pelaporan
  async getRecapReport(courseId = '') {
    const query = courseId ? `?courseId=${courseId}` : '';
    return await this.request(`/reports/recap${query}`);
  },

  async getAuditLogs() {
    const data = await this.request('/audit-logs');
    return data.logs || [];
  },

  async getAttendances(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await this.request(`/attendances${query ? '?' + query : ''}`);
    return data.attendances || [];
  },

  async getStudents() {
    const data = await this.request('/students');
    return data.students || [];
  },

  async createStudent(studentData) {
    return await this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  async deleteStudent(identifier) {
    return await this.request(`/students/${identifier}`, {
      method: 'DELETE'
    });
  },

  async deleteAttendance(attendanceId) {
    return await this.request(`/attendances/${attendanceId}`, {
      method: 'DELETE'
    });
  },

  async clearAttendances(params = {}) {
    return await this.request('/attendances', {
      method: 'DELETE',
      body: JSON.stringify(params)
    });
  },

  async resetAllEnrollments() {
    return await this.request('/enrollment/reset-all', {
      method: 'POST'
    });
  },

  // Download Excel URL
  getExcelExportUrl(courseId = '') {
    const token = this.getToken();
    return `${API_BASE}/reports/export/excel?courseId=${courseId}&token=${token}`;
  }
};
