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
    console.log('setTokens: Storing tokens, accessToken length:', accessToken?.length, 'refreshToken length:', refreshToken?.length)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    console.log('clearTokens: Removing all tokens')
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// API helper with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let accessToken = getAccessToken();
  
  console.log('fetchWithAuth:', url, 'hasAccessToken:', !!accessToken, 'hasRefreshToken:', !!getRefreshToken())
  
  // If no access token but we have refresh token, try to refresh first
  if (!accessToken && getRefreshToken()) {
    console.log('fetchWithAuth: No access token, attempting refresh...')
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = getAccessToken();
      console.log('fetchWithAuth: Refresh successful, got new access token')
    } else {
      console.log('fetchWithAuth: Refresh failed')
    }
  }
  
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

  console.log('fetchWithAuth:', url, 'response status:', response.status)

  // If unauthorized, try to refresh token
  if (response.status === 401 && getRefreshToken()) {
    console.log('fetchWithAuth: Got 401, attempting token refresh...');
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      console.log('fetchWithAuth: Refresh successful, retrying request...');
      (headers as Record<string, string>)['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });
      console.log('fetchWithAuth: Retry response status:', response.status);
    } else {
      console.log('fetchWithAuth: Refresh failed on 401 retry');
    }
  }

  return response;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    console.log('refreshAccessToken: Attempting refresh, hasToken:', !!refreshToken)
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    console.log('refreshAccessToken: Response status:', response.status)

    if (response.ok) {
      const data = await response.json();
      console.log('refreshAccessToken: Got new access token')
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    }
    
    // Refresh failed, clear tokens
    console.log('refreshAccessToken: Failed, clearing tokens')
    clearTokens();
    return false;
  } catch (err) {
    console.error('refreshAccessToken: Error:', err)
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
    const response = await fetchWithAuth(`/api/users?search=${encodeURIComponent(query)}`);
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

  async getSessionMedia(sessionId: string) {
    const response = await fetchWithAuth(`/api/chat/sessions/${sessionId}/media`);
    if (!response.ok) throw new Error('Failed to fetch session media');
    return response.json();
  },

  async getSessionLinks(sessionId: string) {
    const response = await fetchWithAuth(`/api/chat/sessions/${sessionId}/links`);
    if (!response.ok) throw new Error('Failed to fetch session links');
    return response.json();
  },

  async getSessionDocs(sessionId: string) {
    const response = await fetchWithAuth(`/api/chat/sessions/${sessionId}/docs`);
    if (!response.ok) throw new Error('Failed to fetch session documents');
    return response.json();
  },

  async uploadFile(sessionId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/chat/sessions/${sessionId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
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
