import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // INFO: グローバルに公開することを見越して多言語対応していたが、Spotify APIを本番運用できないことが発覚したので、日本限定に変更しました
  const locale = 'ja';
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
