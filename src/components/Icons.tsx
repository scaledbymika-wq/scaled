interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const d = { size: 18, strokeWidth: 1.5 };

function I({ size = d.size, className, strokeWidth = d.strokeWidth, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

// — Navigation & UI —

export function IconSearch(p: IconProps) {
  return <I {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></I>;
}

export function IconPlus(p: IconProps) {
  return <I {...p}><path d="M12 5v14M5 12h14" /></I>;
}

export function IconX(p: IconProps) {
  return <I {...p}><path d="M18 6 6 18M6 6l12 12" /></I>;
}

export function IconChevron(p: IconProps) {
  return <I {...p}><path d="m9 18 6-6-6-6" /></I>;
}

export function IconSettings(p: IconProps) {
  return <I {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </I>;
}

export function IconSun(p: IconProps) {
  return <I {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </I>;
}

export function IconMoon(p: IconProps) {
  return <I {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></I>;
}

export function IconStar(p: IconProps) {
  return <I {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></I>;
}

export function IconStarFilled(p: IconProps) {
  return (
    <svg width={p.size ?? d.size} height={p.size ?? d.size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={p.strokeWidth ?? d.strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function IconTrash(p: IconProps) {
  return <I {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></I>;
}

export function IconRestore(p: IconProps) {
  return <I {...p}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></I>;
}

// — Theme & Layout —

export function IconPage(p: IconProps) {
  return <I {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></I>;
}

export function IconPages(p: IconProps) {
  return <I {...p}><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" /><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" /><polyline points="15 2 15 7 20 7" /></I>;
}

export function IconFolder(p: IconProps) {
  return <I {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></I>;
}

export function IconFolderPlus(p: IconProps) {
  return <I {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></I>;
}

// — Editor Toolbar —

export function IconBold(p: IconProps) {
  return <I {...p}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></I>;
}

export function IconItalic(p: IconProps) {
  return <I {...p}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></I>;
}

export function IconUnderline(p: IconProps) {
  return <I {...p}><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></I>;
}

export function IconStrikethrough(p: IconProps) {
  return <I {...p}><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></I>;
}

export function IconCode(p: IconProps) {
  return <I {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></I>;
}

export function IconHighlight(p: IconProps) {
  return <I {...p}><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></I>;
}

export function IconLink(p: IconProps) {
  return <I {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></I>;
}

// — Block Types —

export function IconText(p: IconProps) {
  return <I {...p}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></I>;
}

export function IconHeading1(p: IconProps) {
  return <I {...p}><path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8" /></I>;
}

export function IconHeading2(p: IconProps) {
  return <I {...p}><path d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" /></I>;
}

export function IconHeading3(p: IconProps) {
  return <I {...p}><path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2M17.5 17.5c1.7 1 3.5 0 3.5-1.5a2 2 0 0 0-2-2" /></I>;
}

export function IconTaskList(p: IconProps) {
  return <I {...p}><rect x="3" y="5" width="6" height="6" rx="1" /><path d="m3.5 8 2 2L9 6" /><line x1="13" y1="8" x2="21" y2="8" /><rect x="3" y="14" width="6" height="6" rx="1" /><line x1="13" y1="17" x2="21" y2="17" /></I>;
}

export function IconBulletList(p: IconProps) {
  return <I {...p}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></I>;
}

export function IconNumberedList(p: IconProps) {
  return <I {...p}><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></I>;
}

export function IconQuote(p: IconProps) {
  return <I {...p}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" /></I>;
}

export function IconDivider(p: IconProps) {
  return <I {...p}><line x1="3" y1="12" x2="21" y2="12" /></I>;
}

export function IconCodeBlock(p: IconProps) {
  return <I {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m9 10-2 2 2 2" /><path d="m15 10 2 2-2 2" /></I>;
}

export function IconImage(p: IconProps) {
  return <I {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></I>;
}

export function IconTable(p: IconProps) {
  return <I {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></I>;
}

export function IconCallout(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></I>;
}

// — Templates —

export function IconMeeting(p: IconProps) {
  return <I {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></I>;
}

export function IconRocket(p: IconProps) {
  return <I {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></I>;
}

export function IconChart(p: IconProps) {
  return <I {...p}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></I>;
}

export function IconJournal(p: IconProps) {
  return <I {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></I>;
}

export function IconTarget(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></I>;
}

export function IconHandshake(p: IconProps) {
  return <I {...p}><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.7a1 1 0 1 0 3-3l-6.12-6.13" /><path d="M3 4h8" /></I>;
}

export function IconLightning(p: IconProps) {
  return <I {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></I>;
}

export function IconSparkle(p: IconProps) {
  return <I {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4M19 17v4M3 5h4M17 19h4" /></I>;
}

export function IconPen(p: IconProps) {
  return <I {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></I>;
}

export function IconPalette(p: IconProps) {
  return <I {...p}><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12" r="0.5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></I>;
}

// — Alignment —

export function IconAlignLeft(p: IconProps) {
  return <I {...p}><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></I>;
}

export function IconAlignCenter(p: IconProps) {
  return <I {...p}><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></I>;
}

export function IconAlignRight(p: IconProps) {
  return <I {...p}><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></I>;
}

// — UI —

export function IconMenu(p: IconProps) {
  return <I {...p}><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="18" x2="20" y2="18" /></I>;
}

export function IconCheck(p: IconProps) {
  return <I {...p}><polyline points="20 6 9 17 4 12" /></I>;
}

export function IconExpand(p: IconProps) {
  return <I {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></I>;
}

export function IconShrink(p: IconProps) {
  return <I {...p}><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></I>;
}

export function IconHabit(p: IconProps) {
  return <I {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></I>;
}

export function IconSidebar(p: IconProps) {
  return <I {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /></I>;
}

// — Board & Planner —

export function IconBoard(p: IconProps) {
  return <I {...p}><rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" /></I>;
}

// — Feature Icons —

export function IconCalendar(p: IconProps) {
  return <I {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></I>;
}

export function IconExport(p: IconProps) {
  return <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></I>;
}

export function IconCopy(p: IconProps) {
  return <I {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></I>;
}

export function IconClock(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></I>;
}

export function IconHash(p: IconProps) {
  return <I {...p}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></I>;
}

export function IconInbox(p: IconProps) {
  return <I {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></I>;
}

export function IconBookmark(p: IconProps) {
  return <I {...p}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></I>;
}

export function IconHeart(p: IconProps) {
  return <I {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></I>;
}

export function IconGlobe(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></I>;
}

export function IconFlag(p: IconProps) {
  return <I {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></I>;
}

export function IconLayers(p: IconProps) {
  return <I {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></I>;
}

export function IconGrid(p: IconProps) {
  return <I {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></I>;
}

export function IconArchive(p: IconProps) {
  return <I {...p}><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" rx="1" /><line x1="10" y1="12" x2="14" y2="12" /></I>;
}

export function IconFeather(p: IconProps) {
  return <I {...p}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></I>;
}

export function IconMusic(p: IconProps) {
  return <I {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></I>;
}

export function IconCamera(p: IconProps) {
  return <I {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></I>;
}

export function IconZap(p: IconProps) {
  return <I {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></I>;
}

export function IconCompass(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></I>;
}

export function IconUsers(p: IconProps) {
  return <I {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></I>;
}

export function IconBriefcase(p: IconProps) {
  return <I {...p}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></I>;
}

export function IconCoffee(p: IconProps) {
  return <I {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></I>;
}

export function IconWind(p: IconProps) {
  return <I {...p}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></I>;
}

// — Brand Mark (Scaled "S" lightning bolt) —

export function ScaledLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13.5 2L4 13h6.5l-1 9L20 11h-6.5l1-9z"
        fill="currentColor"
        fillOpacity="0.85"
      />
    </svg>
  );
}

// — Custom Icon System (replaces emojis) —

export const SCALED_ICON_NAMES = [
  "page", "rocket", "target", "chart", "zap", "sparkle",
  "pen", "palette", "journal", "heart", "flag", "globe",
  "hash", "clock", "bookmark", "layers", "grid", "inbox",
  "archive", "feather", "music", "camera", "compass", "board",
  "users", "briefcase", "coffee", "wind", "star", "code",
] as const;

export type ScaledIconName = (typeof SCALED_ICON_NAMES)[number];

const ICON_MAP: Record<string, (p: IconProps) => React.ReactElement> = {
  page: IconPage, rocket: IconRocket, target: IconTarget, chart: IconChart,
  zap: IconZap, sparkle: IconSparkle, pen: IconPen, palette: IconPalette,
  journal: IconJournal, heart: IconHeart, flag: IconFlag, globe: IconGlobe,
  hash: IconHash, clock: IconClock, bookmark: IconBookmark, layers: IconLayers,
  grid: IconGrid, inbox: IconInbox, archive: IconArchive, feather: IconFeather,
  music: IconMusic, camera: IconCamera, compass: IconCompass, board: IconBoard,
  users: IconUsers, briefcase: IconBriefcase, coffee: IconCoffee, wind: IconWind,
  star: IconStar, code: IconCode,
};

/** Render a custom Scaled icon by name. Returns null if unknown. */
export function renderScaledIcon(iconStr: string, props?: IconProps): React.ReactElement | null {
  // Icon strings stored as "icon:name" to distinguish from emoji
  const name = iconStr.startsWith("icon:") ? iconStr.slice(5) : iconStr;
  const Component = ICON_MAP[name];
  if (Component) return <Component {...(props || {})} />;
  return null;
}

/** Check whether the icon string is a custom Scaled icon. */
export function isScaledIcon(icon: string): boolean {
  if (!icon) return false;
  const name = icon.startsWith("icon:") ? icon.slice(5) : icon;
  return name in ICON_MAP;
}

// — Mood Faces —

export function IconMoodAwful(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></I>;
}

export function IconMoodBad(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><path d="M16 16c-.5-1-1.5-2-4-2s-3.5 1-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></I>;
}

export function IconMoodOkay(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><line x1="8" y1="15" x2="16" y2="15" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></I>;
}

export function IconMoodGood(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><path d="M8 14c.5 1 1.5 2 4 2s3.5-1 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></I>;
}

export function IconMoodGreat(p: IconProps) {
  return <I {...p}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></I>;
}
