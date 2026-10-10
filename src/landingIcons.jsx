export function Arrow({ className = '' }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
export function SmallIcon({ name = 'grid', size = 17 }) {
  const paths = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    home: 'm3 10 9-7 9 7v10h-6v-7H9v7H3z',
    calendar: 'M4 5h16v16H4z M8 2v6m8-6v6M4 11h16',
    compass: 'M16 8 13 13l-5 3 3-5z M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    chart: 'M4 3v18h17M8 16v-5m5 5V7m5 9V4',
    people: 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-3a6 6 0 0 1 12 0v3m2-17a4 4 0 0 1 0 8m2 2a5 5 0 0 1 4 5v2',
    image: 'M3 3h18v18H3z m0 14 6-6 4 4 3-3 5 5 M15 7h.01',
    spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
    chat: 'M3 3h18v14H8l-5 4z',
    clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
    plus: 'M12 4v16M4 12h16', check: 'm5 12 4 4L20 5',
    search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 6 6',
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.grid} /></svg>
}
export function SocialMark({ platform, className = '' }) {
  if (['facebook', 'instagram', 'tiktok', 'meta'].includes(platform)) return <img className={`mk-social-mark ${className}`} src={`/social_logos/${platform}.png`} alt={platform === 'meta' ? 'Meta' : platform[0].toUpperCase() + platform.slice(1)} />
  return <span className={`mk-social-mark mk-social-${platform} ${className}`} aria-label={platform}>{platform === 'linkedin' ? 'in' : platform === 'pinterest' ? 'P' : platform === 'youtube' ? '▶' : platform === 'threads' ? '@' : '𝕏'}</span>
}
