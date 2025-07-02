import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id_here';

/**
 * Spotify SDKのインスタンスを作成する
 */
export function createSpotifySDK(accessToken: string): SpotifyApi {
  return SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: '',
  });
}
