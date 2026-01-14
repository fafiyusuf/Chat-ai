const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Token management
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// API helper with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const accessToken = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    }
    
    // Refresh failed, clear tokens
    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// Auth API
export const authApi = {
  async register(email: string, password: string, displayName: string, username?: string) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, username }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async logout() {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  async getProfile() {
    const response = await fetchWithAuth('/api/auth/me');
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },
};

// Users API
export const usersApi = {
  async getAll() {
    const response = await fetchWithAuth('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async search(query: string) {
    const response = await fetchWithAuth(`/api/users/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
  },

  async getById(id: string) {
    const response = await fetchWithAuth(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async updateProfile(data: { displayName?: string; username?: string; avatarUrl?: string }) {
    const response = await fetchWithAuth('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async updateStatus(status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY') {
    const response = await fetchWithAuth('/api/users/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },
};

// Chat API
export const chatApi = {
  async getSessions() {
    const response = await fetchWithAuth('/api/chat/sessions');
    if (!response.ok) throw new Error('Failed to fetch chat sessions');
    return response.json();
  },

  async createSession(participantIds: string[], name?: string) {
    // Backend expects participantId (singular) for 1:1 chats
    const participantId = participantIds[0];
    const response = await fetchWithAuth('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ participantId, name }),
    });
    if (!response.ok) throw new Error('Failed to create chat session');
    return response.json();
  },

  async getMessages(sessionId: string, cursor?: string, limit = 50) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);
    
    const response = await fetchWithAuth(`/api/chat/sessions/${sessionId}/messages?${params}`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async sendMessage(sessionId: string, content: string, type = 'TEXT') {
    const response = await fetchWithAuth(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async deleteSession(sessionId: string) {
    const response = await fetchWithAuth(`/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete session');
    return response.json();
  },
};

// AI Chat API
export const aiApi = {
  async getSessions() {
    const response = await fetchWithAuth('/api/ai/sessions');
    if (!response.ok) throw new Error('Failed to fetch AI sessions');
    return response.json();
  },

  async createSession(title?: string) {
    const response = await fetchWithAuth('/api/ai/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create AI session');
    return response.json();
  },

  async getMessages(sessionId: string) {
    const response = await fetchWithAuth(`/api/ai/sessions/${sessionId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch AI messages');
    return response.json();
  },

  async sendMessage(sessionId: string, content: string) {
    const response = await fetchWithAuth(`/api/ai/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to send AI message');
    return response.json();
  },

  async deleteSession(sessionId: string) {
    const response = await fetchWithAuth(`/api/ai/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete AI session');
    return response.json();
  },
};

export { API_URL };
