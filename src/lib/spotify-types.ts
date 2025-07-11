// Spotify API共通型定義

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: Array<{ url: string; height?: number; width?: number }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

// Recently played API用
export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  playedAt: string;
}

export interface RecentlyPlayedResponse {
  tracks: RecentlyPlayedItem[];
  total: number;
  limit: number;
}

// Persona API用（統一形式）
export interface PersonaTrackItem {
  track: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string };
  };
  played_at: string;
}

export interface PersonaRequest {
  recentTracks: PersonaTrackItem[];
  locale?: string;
}

// Loading状態管理用
export type LoadingState = 'connecting' | 'fetching' | 'analyzing' | 'generating' | 'complete';

export interface LoadingStep {
  key: string;
  weight: number;
  done: boolean;
  label: string;
}

// AI Persona関連の型定義
export interface PersonaData {
  persona: {
    title: string;
    description: string;
  };
  insights: {
    tracksAnalyzed: number;
    uniqueArtists: number;
    uniqueAlbums: number;
    timeDistribution: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    repeatTracks: number;
    diversityScore: number;
  };
}
