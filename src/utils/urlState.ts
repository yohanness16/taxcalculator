/**
 * URL State Serialization & Shareable Hash Links
 */

export function serializeTaxParams(params: {
  country?: string;
  gross?: number;
  freq?: string;
}): string {
  const parts: string[] = [];
  if (params.country) parts.push(`country=${encodeURIComponent(params.country)}`);
  if (params.gross !== undefined) parts.push(`gross=${params.gross}`);
  if (params.freq) parts.push(`freq=${encodeURIComponent(params.freq)}`);
  return parts.join('&');
}

export function parseTaxParamsFromURL(): {
  country?: string;
  gross?: number;
  freq?: string;
} {
  if (typeof window === 'undefined') return {};

  const hash = window.location.hash.replace(/^#/, '');
  const search = window.location.search.replace(/^\?/, '');
  const queryString = hash || search;

  const urlParams = new URLSearchParams(queryString);
  const country = urlParams.get('country') || undefined;
  const grossRaw = urlParams.get('gross');
  const gross = grossRaw ? Number(grossRaw) : undefined;
  const freq = urlParams.get('freq') || undefined;

  return { country, gross: !isNaN(gross!) ? gross : undefined, freq };
}
