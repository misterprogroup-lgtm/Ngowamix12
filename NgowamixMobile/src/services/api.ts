const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Cookie'] = `ngowamix_session=${this.token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: data,
    });
  }

  // Catalog
  async getAlbums(page = 1, limit = 20) {
    return this.request<{ albums: any[]; pagination: any }>(`/albums?page=${page}&limit=${limit}`);
  }

  async getAlbum(id: string) {
    return this.request<{ album: any }>(`/albums/${id}`);
  }

  async getTracks(albumId: string) {
    return this.request<{ tracks: any[] }>(`/tracks?albumId=${albumId}`);
  }

  async getArtists(page = 1, limit = 20) {
    return this.request<{ artists: any[]; pagination: any }>(`/artists?page=${page}&limit=${limit}`);
  }

  async getArtist(slug: string) {
    return this.request<{ artist: any }>(`/artists/${slug}`);
  }

  // Livestream
  async getLivestreams() {
    return this.request<{ streams: any[] }>('/livestream');
  }

  async getLivestream(id: string) {
    return this.request<{ stream: any }>(`/livestream/${id}`);
  }

  // Chat
  async getChatRooms() {
    return this.request<{ rooms: any[] }>('/chat/rooms');
  }

  async getMessages(roomId: string) {
    return this.request<{ messages: any[] }>(`/chat/rooms/${roomId}/messages`);
  }

  async sendMessage(roomId: string, content: string) {
    return this.request<{ message: any }>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: { content },
    });
  }

  // Search
  async search(query: string) {
    return this.request<{ results: any[] }>(`/search?q=${encodeURIComponent(query)}`);
  }

  // User
  async getProfile() {
    return this.request<{ user: any }>('/user/profile');
  }

  async getLibrary() {
    return this.request<{ library: any }>('/user/library');
  }

  // Premium
  async getPremiumInfo() {
    return this.request<{ premium: any }>('/premium');
  }

  // Family
  async getFamilyGroup() {
    return this.request<{ group: any | null }>('/family');
  }

  async createFamilyGroup(name: string) {
    return this.request<{ group: any }>('/family', { method: 'POST', body: { name } });
  }

  // Recommendations
  async getRecommendations(type = 'tracks') {
    return this.request<{ tracks?: any[]; artists?: any[] }>(
      `/recommendations?type=${type}&limit=20`
    );
  }

  // Podcasts
  async getPodcasts() {
    return this.request<{ podcasts: any[] }>('/podcasts');
  }

  async getPodcast(id: string) {
    return this.request<{ podcast: any }>(`/podcasts/${id}`);
  }
}

export const api = new ApiService();
export default api;
