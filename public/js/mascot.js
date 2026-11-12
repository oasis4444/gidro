// Gidro, le petit lémurien mascotte (dessin SVG original)
export function mascot(mood = 'idle', size = 120) {
  const mouth = {
    idle: '<path d="M52 76 Q60 82 68 76" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    happy: '<path d="M49 74 Q60 90 71 74 Z" fill="#c0392b" stroke="#2d3436" stroke-width="2.5" stroke-linejoin="round"/><path d="M54 81 Q60 86 66 81" fill="#ff7675"/>',
    sad: '<path d="M52 81 Q60 74 68 81" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    wow: '<ellipse cx="60" cy="79" rx="5" ry="6" fill="#2d3436"/>',
  }[mood] || '';
  const brows = mood === 'sad'
    ? '<path d="M38 38 L52 42" stroke="#2d3436" stroke-width="3" stroke-linecap="round"/><path d="M82 38 L68 42" stroke="#2d3436" stroke-width="3" stroke-linecap="round"/>'
    : '';
  const tears = mood === 'sad' ? '<path d="M40 62 q-3 6 0 8 q3 -2 0 -8z" fill="#74b9ff"/>' : '';
  return `<svg class="mascot mascot-${mood}" width="${size}" height="${size * 1.17}" viewBox="0 0 120 140" aria-hidden="true">
  <g class="m-tail"><path d="M84 112 C118 110 118 70 104 52 C96 40 104 26 114 22" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M84 112 C118 110 118 70 104 52 C96 40 104 26 114 22" stroke="#2d3436" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="9 9"/></g>
  <ellipse cx="60" cy="108" rx="28" ry="26" fill="#9aa5b1"/>
  <ellipse cx="60" cy="114" rx="17" ry="17" fill="#e8ecef"/>
  <ellipse class="m-arm-l" cx="34" cy="104" rx="7" ry="13" fill="#8a96a3" transform="rotate(20 34 104)"/>
  <ellipse class="m-arm-r" cx="86" cy="104" rx="7" ry="13" fill="#8a96a3" transform="rotate(-20 86 104)"/>
  <ellipse cx="46" cy="132" rx="10" ry="6" fill="#7b8794"/><ellipse cx="74" cy="132" rx="10" ry="6" fill="#7b8794"/>
  <g class="m-head">
    <path d="M26 30 L34 6 L46 26 Z" fill="#7b8794"/><path d="M94 30 L86 6 L74 26 Z" fill="#7b8794"/>
    <path d="M31 25 L35 13 L41 24 Z" fill="#f8c4c4"/><path d="M89 25 L85 13 L79 24 Z" fill="#f8c4c4"/>
    <circle cx="60" cy="54" r="34" fill="#9aa5b1"/>
    <ellipse cx="60" cy="66" rx="25" ry="21" fill="#fff"/>
    <ellipse cx="45" cy="51" rx="12" ry="13" fill="#2d3436"/><ellipse cx="75" cy="51" rx="12" ry="13" fill="#2d3436"/>
    <g class="m-eyes"><circle cx="45" cy="51" r="8.5" fill="#ffb020"/><circle cx="75" cy="51" r="8.5" fill="#ffb020"/>
    <circle cx="46" cy="52" r="4.5" fill="#1e272e"/><circle cx="76" cy="52" r="4.5" fill="#1e272e"/>
    <circle cx="48" cy="49" r="1.8" fill="#fff"/><circle cx="78" cy="49" r="1.8" fill="#fff"/></g>
    ${brows}
    <path d="M55 64 L65 64 L60 70 Z" fill="#2d3436" stroke="#2d3436" stroke-width="2" stroke-linejoin="round"/>
    ${mouth}${tears}
    <ellipse cx="38" cy="70" rx="5" ry="3" fill="#ffb3b3" opacity=".6"/><ellipse cx="82" cy="70" rx="5" ry="3" fill="#ffb3b3" opacity=".6"/>
  </g></svg>`;
}
