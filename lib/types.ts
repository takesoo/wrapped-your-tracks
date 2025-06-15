// Spotify API関連の型定義

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: number;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyRecentlyPlayed {
  track: {
    id: string;
    name: string;
    artists: {
      id: string;
      name: string;
    }[];
  };
  played_at: string;
}

export interface SpotifyUserData {
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  recentlyPlayed: SpotifyRecentlyPlayed[];
}

// AI ペルソナ関連の型定義

export interface MusicInsights {
  topGenres: string[];
  averagePopularity: number;
  diversityScore: number;
  topArtistsCount: number;
  topTracksCount: number;
}

export interface AIPersonaResponse {
  persona: string;
  musicStyle: string;
  insights: MusicInsights;
}

// API レスポンス関連の型定義

export interface APIError {
  error: string;
}

export interface AuthResponse {
  success: boolean;
  redirect?: string;
  error?: string;
}

// フロントエンド用の型定義

export interface UserMusicSummary {
  spotifyData: SpotifyUserData;
  aiPersona: AIPersonaResponse;
  timestamp: string;
}
