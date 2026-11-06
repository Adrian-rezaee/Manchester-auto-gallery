import React from 'react';

/**
 * Manchester Auto Gallery — custom icon set.
 * One consistent 24px grid, 1.6 stroke, round joins, with a soft duotone fill that follows currentColor.
 * Inline paths only (no icon library), so nothing extra is downloaded and every icon inherits the text colour.
 */
type IconProps = React.SVGProps<SVGSVGElement>;

const make = (name: string, body: React.ReactNode): React.FC<IconProps> => {
  const Icon: React.FC<IconProps> = (props) => (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {body}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
};

export const Menu = make('Menu', <><path d="M4 7h16M4 12h10M4 17h16"/></>);
export const X = make('X', <><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></>);
export const ArrowUpRight = make('ArrowUpRight', <><path d="M7 17L17 7M8.5 7H17v8.5"/></>);
export const ArrowRight = make('ArrowRight', <><path d="M4.5 12h15M13.5 6l6 6-6 6"/></>);
export const ChevronDown = make('ChevronDown', <><path d="M6 9.5l6 6 6-6"/></>);
export const ChevronLeft = make('ChevronLeft', <><path d="M14.5 6l-6 6 6 6"/></>);
export const ChevronRight = make('ChevronRight', <><path d="M9.5 6l6 6-6 6"/></>);
export const Sparkles = make('Sparkles', <><path d="M10.5 4c.7 5 2.5 6.8 7.5 7.5-5 .7-6.8 2.5-7.5 7.5C9.8 14 8 12.2 3 11.5 8 10.8 9.8 9 10.5 4z" fill="currentColor" fillOpacity=".15"/><path d="M19 3v4M17 5h4"/><path d="M18.5 17.5v3M17 19h3"/></>);
export const Shield = make('Shield', <><path d="M12 3l7.5 2.8v5.6c0 4.5-3 8.1-7.5 9.6-4.5-1.5-7.5-5.1-7.5-9.6V5.8L12 3z" fill="currentColor" fillOpacity=".15"/></>);
export const ShieldCheck = make('ShieldCheck', <><path d="M12 3l7.5 2.8v5.6c0 4.5-3 8.1-7.5 9.6-4.5-1.5-7.5-5.1-7.5-9.6V5.8L12 3z" fill="currentColor" fillOpacity=".15"/><path d="M8.8 12l2.4 2.4 4.2-4.5"/></>);
export const ShieldAlert = make('ShieldAlert', <><path d="M12 3l7.5 2.8v5.6c0 4.5-3 8.1-7.5 9.6-4.5-1.5-7.5-5.1-7.5-9.6V5.8L12 3z" fill="currentColor" fillOpacity=".15"/><path d="M12 8.2v4.3"/><path d="M12 15.6h.01" strokeWidth="2.2"/></>);
export const Compass = make('Compass', <><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-1.9 5.7-5.7 1.9 1.9-5.7 5.7-1.9z" fill="currentColor" fillOpacity=".15"/></>);
export const Layers = make('Layers', <><path d="M12 3.5l8.5 4.3-8.5 4.3-8.5-4.3L12 3.5z" fill="currentColor" fillOpacity=".15"/><path d="M3.5 12l8.5 4.3 8.5-4.3"/><path d="M3.5 16.2L12 20.5l8.5-4.3"/></>);
export const Award = make('Award', <><circle cx="12" cy="9.5" r="5.5" fill="currentColor" fillOpacity=".15"/><path d="M8.7 13.8L7.5 21l4.5-2.5 4.5 2.5-1.2-7.2"/></>);
export const MapPin = make('MapPin', <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11z" fill="currentColor" fillOpacity=".15"/><circle cx="12" cy="10" r="2.3"/></>);
export const Clock = make('Clock', <><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".15"/><path d="M12 7v5l3.3 2"/></>);
export const MessageCircle = make('MessageCircle', <><path d="M4 12a8 8 0 1 1 3.4 6.5L4 20l1.1-3.6A7.9 7.9 0 0 1 4 12z" fill="currentColor" fillOpacity=".15"/><path d="M9 12h.01M12 12h.01M15 12h.01" strokeWidth="2.2"/></>);
export const Phone = make('Phone', <><path d="M6.2 3.8h2.6l1.5 4-2 1.4a11.5 11.5 0 0 0 5.5 5.5l1.4-2 4 1.5v2.6a2 2 0 0 1-2.1 2C10.6 18.4 5.6 13.4 4.2 5.9a2 2 0 0 1 2-2.1z" fill="currentColor" fillOpacity=".15"/></>);
export const PhoneCall = make('PhoneCall', <><path d="M6.2 3.8h2.6l1.5 4-2 1.4a11.5 11.5 0 0 0 5.5 5.5l1.4-2 4 1.5v2.6a2 2 0 0 1-2.1 2C10.6 18.4 5.6 13.4 4.2 5.9a2 2 0 0 1 2-2.1z" fill="currentColor" fillOpacity=".15"/><path d="M14.5 4.2a6 6 0 0 1 5.3 5.3M14.3 7.7a2.7 2.7 0 0 1 2 2"/></>);
export const Mail = make('Mail', <><rect x="3" y="5.5" width="18" height="13" rx="3" fill="currentColor" fillOpacity=".15"/><path d="M4 8.5l8 5.2 8-5.2"/></>);
export const Lightbulb = make('Lightbulb', <><path d="M12 3.5a6 6 0 0 0-3.7 10.7c.8.6 1.2 1.4 1.2 2.3h5c0-.9.4-1.7 1.2-2.3A6 6 0 0 0 12 3.5z" fill="currentColor" fillOpacity=".15"/><path d="M9.8 19.2h4.4M10.6 21.2h2.8"/></>);
export const MousePointerClick = make('MousePointerClick', <><path d="M9 9l11 4.3-4.7 1.7-1.7 4.7L9 9z" fill="currentColor" fillOpacity=".15"/><path d="M5.3 5.3l1.4 1.4M9 3.5V6M3.5 9H6"/></>);
export const Gauge = make('Gauge', <><path d="M4.3 17.5a8.5 8.5 0 1 1 15.4 0"/><circle cx="12" cy="14" r="2" fill="currentColor" fillOpacity=".15"/><path d="M13.5 12.5l3-3.8"/></>);
export const Zap = make('Zap', <><path d="M13 2.8L5.5 13.2h5.8l-.8 8L18.5 10.8h-5.8l.3-8z" fill="currentColor" fillOpacity=".15"/></>);
export const Flame = make('Flame', <><path d="M12 21c3.9 0 6.5-2.6 6.5-6.2 0-2.7-1.5-4.4-2.9-5.9-.3 1.3-1 2.1-2.1 2.4.4-3.1-1-5.9-3.8-8-.1 3.3-1.4 4.8-2.7 6.4-1.1 1.3-1.9 2.9-1.9 5.1C5.1 18.4 8 21 12 21z" fill="currentColor" fillOpacity=".15"/><path d="M12 17.8c-1 0-1.7-.7-1.7-1.6 0-.7.5-1.2 1.2-1.9.3.5.6.7 1 .8.3-.4.4-.8.3-1.4.6.5 1 1.1 1 1.9 0 1.2-.7 2.2-1.8 2.2z"/></>);
export const CheckCircle2 = make('CheckCircle2', <><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".15"/><path d="M8 12.3l2.8 2.8 5.2-5.6"/></>);
export const Calendar = make('Calendar', <><rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="currentColor" fillOpacity=".15"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14h.01M12 14h.01M15.5 14h.01" strokeWidth="2.2"/></>);
export const User = make('User', <><circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity=".15"/><path d="M4.5 20.5c.6-3.8 3.6-6 7.5-6s6.9 2.2 7.5 6"/></>);
export const Car = make('Car', <><path d="M5.5 17H4a1 1 0 0 1-1-1v-3.4c0-.4.1-.8.3-1.1L5.4 8A2 2 0 0 1 7.2 7h9.6a2 2 0 0 1 1.8 1l2.1 3.5c.2.3.3.7.3 1.1V16a1 1 0 0 1-1 1h-1.5" fill="currentColor" fillOpacity=".15"/><path d="M3.2 11.8h17.6M9.5 17h5"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/></>);
export const Plane = make('Plane', <><path d="M21 3.2c-1-.6-3.2-.3-4.6 1.1L13 7.7 5.3 6.1a1 1 0 0 0-.9.3l-.5.5a.9.9 0 0 0 .1 1.3l5.2 3.7-2.3 2.5H4.5L3.4 15.5l3 2 2 3 1.1-1.1v-2.4l2.5-2.3 3.7 5.2a.9.9 0 0 0 1.3.1l.5-.5a1 1 0 0 0 .3-.9L16.2 11l3.5-3.4c1.4-1.4 1.7-3.6 1.3-4.4z" fill="currentColor" fillOpacity=".15"/></>);
export const FileCheck2 = make('FileCheck2', <><path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8l-5-5z" fill="currentColor" fillOpacity=".15"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M9 14.6l2.2 2.2 3.9-4.2"/></>);
export const Volume2 = make('Volume2', <><path d="M4 9.5v5h3.5l4.5 3.8V5.7L7.5 9.5H4z" fill="currentColor" fillOpacity=".15"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></>);
export const Wind = make('Wind', <><path d="M3.5 9h10.5a2.5 2.5 0 1 0-2.4-3.2M3.5 14h14a2.5 2.5 0 1 1-2.4 3.2M3.5 11.5h7"/></>);
export const Instagram = make('Instagram', <><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01" strokeWidth="2.2"/></>);
export const Youtube = make('Youtube', <><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.2 9.3v5.4l4.6-2.7-4.6-2.7z" fill="currentColor"/></>);
export const Linkedin = make('Linkedin', <><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 10.5V16M8 7.8h.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.6 2.5-2.6s2 1 2 2.6V16"/></>);
