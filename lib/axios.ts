import axios from 'axios';

// Axiosのデフォルト設定
const axiosInstance = axios.create({
  timeout: 30000, // 30秒のタイムアウト
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（必要に応じて認証トークンを追加）
axiosInstance.interceptors.request.use(
  (config) => {
    // 開発環境でのリクエストログ
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// レスポンスインターセプター（エラーハンドリング）
axiosInstance.interceptors.response.use(
  (response) => {
    // 開発環境でのレスポンスログ
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[Axios Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // エラーハンドリング
    if (error.response) {
      // サーバーからのエラーレスポンス
      const message = error.response.data?.error || `HTTP ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // ネットワークエラー
      throw new Error('Network error: Unable to reach server');
    } else {
      // その他のエラー
      throw new Error(error.message || 'Unknown error occurred');
    }
  },
);

export default axiosInstance;
