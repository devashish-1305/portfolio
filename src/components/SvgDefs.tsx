/** Shared SVG symbols (football, tennis ball, Barça stripes) referenced via <use href="#..."> across the page. */
export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <clipPath id="ballclip"><circle cx="20" cy="20" r="18.6" /></clipPath>
        <symbol id="ball" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18.6" style={{ fill: 'var(--skin,#F4F4EE)' }} stroke="#101410" strokeWidth="1.6" />
          <g clipPath="url(#ballclip)" fill="#101410">
            <polygon points="20,12.6 27.1,17.7 24.4,26 15.6,26 12.9,17.7" />
            <polygon points="20,-2 25,1.5 23,6.5 17,6.5 15,1.5" />
            <polygon points="37,10 42,14 40,20 34.5,19.5 33,14" />
            <polygon points="33,33 37,37.5 33,42 28,40 28.5,34.5" />
            <polygon points="7,33 11.5,34.5 12,40 7,42 3,37.5" />
            <polygon points="3,10 7,14 5.5,19.5 0,20 -2,14" />
          </g>
          <g stroke="#101410" strokeWidth="1.3" fill="none" clipPath="url(#ballclip)">
            <path d="M20 12.6V6.5M27.1 17.7L33 14M24.4 26L28.5 34.5M15.6 26L11.5 34.5M12.9 17.7L7 14" />
          </g>
        </symbol>
        <symbol id="tball" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#D9F04A" stroke="#7d8d1c" strokeWidth="1.2" />
          <path d="M4 12 Q20 20 4 30 M36 10 Q20 20 36 30" fill="none" stroke="#fff" strokeWidth="2.4" />
        </symbol>
        <pattern id="stripes" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="8" height="10" fill="#1F52B5" /><rect x="8" width="8" height="10" fill="#B3123F" /></pattern>
      </defs>
    </svg>
  );
}
