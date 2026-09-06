// ============================================================
// ICONS — petites icônes SVG en ligne (trait fin, cohérentes)
// ============================================================
const stroke = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  home: `<svg viewBox="0 0 24 24" ${stroke}><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>`,
  user: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1.4-3.8 4.4-5.6 7.5-5.6s6.1 1.8 7.5 5.6"/></svg>`,
  users: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="9" cy="8" r="3"/><path d="M2.5 19c1.1-3 3.4-4.6 6.5-4.6s5.4 1.6 6.5 4.6"/><circle cx="17" cy="8.5" r="2.4"/><path d="M15.8 14.6c2.4.4 4 1.9 4.9 4.4"/></svg>`,
  package: `<svg viewBox="0 0 24 24" ${stroke}><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>`,
  coins: `<svg viewBox="0 0 24 24" ${stroke}><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v10c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M15 10.2c2.9.3 6 1.5 6 3.3v4c0 1.7-2.7 3-6 3-1.4 0-2.7-.2-3.8-.7"/></svg>`,
  more: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>`,
  ruler: `<svg viewBox="0 0 24 24" ${stroke}><rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-8 12 12)"/><path d="M6.6 9.4l.7 2M10.3 8.8l.7 2M14 8.2l.7 2M17.7 7.6l.7 2"/></svg>`,
  image: `<svg viewBox="0 0 24 24" ${stroke}><rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5.5-5.5a2 2 0 0 0-2.8 0L3 19"/></svg>`,
  shopping: `<svg viewBox="0 0 24 24" ${stroke}><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" ${stroke}><path d="M12 5v14M5 12h14"/></svg>`,
  search: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" ${stroke}><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" ${stroke}><path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20z"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" ${stroke}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/></svg>`,
  back: `<svg viewBox="0 0 24 24" ${stroke}><path d="M15 19l-7-7 7-7"/></svg>`,
  close: `<svg viewBox="0 0 24 24" ${stroke}><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" ${stroke}><path d="M9 6l6 6-6 6"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9c.5.4 1 .7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.3.9 2-3.4-2-1.5z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" ${stroke}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" ${stroke}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/></svg>`,
};
