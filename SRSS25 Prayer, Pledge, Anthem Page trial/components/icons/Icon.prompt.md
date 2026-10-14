One-line: inline SVG glyph that tints with \`currentColor\` — SRSS's only icon primitive.

\`\`\`jsx
<Icon name="arrow-right" size={20} />
<Icon name="search" size={22} style={{ color: 'var(--gold-300)' }} />
\`\`\`

Geometry is **inlined** into \`Icon.jsx\` from the SVG sources kept in
\`assets/icons/\` — no network request, no cross-origin mask problem, and the
glyph inherits the colour of the text beside it.

Outline glyphs are Lucide (2px round stroke); the four brand glyphs
(instagram, facebook, youtube, whatsapp) are Simple Icons and render filled.

Available slugs: \`arrow-right\`, \`arrow-up-right\`, \`book-open\`, \`calendar\`, \`check\`, \`chevron-down\`, \`chevron-left\`, \`chevron-right\`, \`circle-alert\`, \`circle-check\`, \`clock\`, \`download\`, \`external-link\`, \`facebook\`, \`file-text\`, \`flag\`, \`globe\`, \`graduation-cap\`, \`hand-heart\`, \`heart-handshake\`, \`info\`, \`instagram\`, \`languages\`, \`mail\`, \`map-pin\`, \`menu\`, \`minus\`, \`moon\`, \`music\`, \`pause\`, \`phone\`, \`play\`, \`plus\`, \`printer\`, \`quote\`, \`search\`, \`sparkles\`, \`star\`, \`sun\`, \`triangle-alert\`, \`users\`, \`utensils\`, \`volume-2\`, \`whatsapp\`, \`x\`, \`youtube\`.

To add a glyph: drop its SVG into \`assets/icons/\` and add an entry to the
\`ICONS\` map. Never hand-roll icon paths, and never use emoji as an icon.
