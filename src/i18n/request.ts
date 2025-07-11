import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language')?.split(',');
  const locale = (acceptLanguage && acceptLanguage[0] === 'ja') ? 'ja' : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
