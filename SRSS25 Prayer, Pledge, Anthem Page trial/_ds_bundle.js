/* @ds-bundle: {"format":4,"namespace":"SRSS25DesignSystem_f05209","components":[{"name":"ArrowLink","sourcePath":"components/actions/ArrowLink.jsx"},{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Crest","sourcePath":"components/brand/Crest.jsx"},{"name":"JubileeMark","sourcePath":"components/brand/JubileeMark.jsx"},{"name":"Wordmark","sourcePath":"components/brand/Wordmark.jsx"},{"name":"AudienceLink","sourcePath":"components/content/AudienceLink.jsx"},{"name":"Eyebrow","sourcePath":"components/content/Eyebrow.jsx"},{"name":"PillarCard","sourcePath":"components/content/PillarCard.jsx"},{"name":"PullQuote","sourcePath":"components/content/PullQuote.jsx"},{"name":"SectionHeading","sourcePath":"components/content/SectionHeading.jsx"},{"name":"StatBlock","sourcePath":"components/content/StatBlock.jsx"},{"name":"StoryCard","sourcePath":"components/content/StoryCard.jsx"},{"name":"ValueSpectrum","sourcePath":"components/content/ValueSpectrum.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Notice","sourcePath":"components/feedback/Notice.jsx"},{"name":"Tag","sourcePath":"components/feedback/Tag.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"ICONS","sourcePath":"components/icons/Icon.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"SiteFooter","sourcePath":"components/navigation/SiteFooter.jsx"},{"name":"SiteHeader","sourcePath":"components/navigation/SiteHeader.jsx"},{"name":"UpdatesTicker","sourcePath":"components/navigation/UpdatesTicker.jsx"}],"sourceHashes":{"components/actions/ArrowLink.jsx":"62b11b635992","components/actions/Button.jsx":"9cba43031fc5","components/actions/IconButton.jsx":"38a354db4ba1","components/brand/Crest.jsx":"dc783325dac1","components/brand/JubileeMark.jsx":"fb47da064f86","components/brand/Wordmark.jsx":"1294c3ebdd3d","components/content/AudienceLink.jsx":"c96e281b4638","components/content/Eyebrow.jsx":"0b3f12ef75fc","components/content/PillarCard.jsx":"3251d2898095","components/content/PullQuote.jsx":"db222bf2a45e","components/content/SectionHeading.jsx":"48c531230ca6","components/content/StatBlock.jsx":"d55aff504cc1","components/content/StoryCard.jsx":"a5627e50bbe4","components/content/ValueSpectrum.jsx":"e98c3a9702f2","components/feedback/Badge.jsx":"1870b566dc1b","components/feedback/Notice.jsx":"983ae1c3e0e5","components/feedback/Tag.jsx":"440d6ad99402","components/forms/Checkbox.jsx":"5c7f555e3109","components/forms/Input.jsx":"3d2db42133eb","components/forms/Select.jsx":"6816426898cf","components/icons/Icon.jsx":"a8aaf6f84f71","components/navigation/Breadcrumbs.jsx":"27d4f44541d0","components/navigation/SiteFooter.jsx":"44be4b1df3f5","components/navigation/SiteHeader.jsx":"8347ce4dc9b4","components/navigation/UpdatesTicker.jsx":"ecb1f608cd4d","ui_kits/srss_website/AdmissionsScreen.jsx":"624c4fd5d5ee","ui_kits/srss_website/HomeScreen.jsx":"924e585e9dd8","ui_kits/srss_website/JubileeScreen.jsx":"18eca8552f29","ui_kits/srss_website/Shell.jsx":"981181141031","ui_kits/srss_website/SongsPrayersScreen.jsx":"ba24d066b051","ui_kits/srss_website/StoriesScreen.jsx":"ff611509264c","ui_kits/srss_website/ValuesScreen.jsx":"c2d43c06851f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SRSS25DesignSystem_f05209 = window.SRSS25DesignSystem_f05209 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Crest.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Crest — the official Sekolah Rendah Sathya Sai seal, optionally locked up
 * with the school name and bilingual tagline. Never redraw or recolour it.
 */
function Crest({
  size = 64,
  lockup = 'full',
  tone = 'onNavy',
  src = 'assets/logo-srss-crest.png',
  style,
  ...rest
}) {
  const onNavy = tone === 'onNavy';
  const name = onNavy ? 'var(--white)' : 'var(--navy-950)';
  const tag = onNavy ? 'var(--gold-300)' : 'var(--gold-600)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      flex: '0 0 auto',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "Sekolah Rendah Sathya Sai crest",
    style: {
      width: size,
      height: size,
      flex: '0 0 auto',
      objectFit: 'contain'
    }
  }), lockup !== 'mark' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap',
      font: `var(--fw-semibold) ${size >= 56 ? '21px' : '17px'}/1.12 var(--font-display)`,
      letterSpacing: 'var(--ls-caps-serif)',
      textTransform: 'uppercase',
      color: name
    }
  }, "Sekolah Rendah Sathya Sai"), /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap',
      font: `var(--fw-regular) ${size >= 56 ? '17px' : '14px'}/1.12 var(--font-display)`,
      letterSpacing: 'var(--ls-caps-serif)',
      textTransform: 'uppercase',
      color: name,
      opacity: 0.92
    }
  }, "Kuala Lumpur, Malaysia"), lockup === 'full' && /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap',
      font: 'var(--fw-medium) var(--text-body-sm)/1.2 var(--font-body)',
      color: tag,
      marginTop: '4px'
    }
  }, "Human Excellence\xA0\xA0\xB7\xA0\xA0Kecemerlangan Insan")));
}
Object.assign(__ds_scope, { Crest });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Crest.jsx", error: String((e && e.message) || e) }); }

// components/brand/JubileeMark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * JubileeMark — the SRSS25 Silver Jubilee emblem (six-petal bloom, silver 25).
 * Pair with the "25 Years of Human Excellence" line for jubilee surfaces.
 */
function JubileeMark({
  size = 96,
  lockup = 'mark',
  tone = 'onNavy',
  src = 'assets/logo-srss25-jubilee.png',
  style,
  ...rest
}) {
  const onNavy = tone === 'onNavy';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "SRSS25 Silver Jubilee emblem",
    style: {
      width: size,
      height: size,
      objectFit: 'contain'
    }
  }), lockup === 'stacked' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow)/1 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)'
    }
  }, "Silver Jubilee \xB7 2027"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-display-sm)/1.05 var(--font-display)',
      color: onNavy ? 'var(--white)' : 'var(--navy-800)'
    }
  }, "25 Years of", /*#__PURE__*/React.createElement("br", null), "Human Excellence")));
}
Object.assign(__ds_scope, { JubileeMark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/JubileeMark.jsx", error: String((e && e.message) || e) }); }

// components/brand/Wordmark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Wordmark — type-only SRSS lockup for tight spaces where the crest
 * cannot be reproduced legibly (favicons, small footers, single-colour print).
 */
function Wordmark({
  variant = 'srss25',
  tone = 'onNavy',
  size = 34,
  style,
  ...rest
}) {
  const onNavy = tone === 'onNavy';
  const ink = onNavy ? 'var(--white)' : 'var(--navy-800)';
  const accent = onNavy ? 'var(--gold-300)' : 'var(--gold-600)';
  if (variant === 'srss25') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        font: `var(--fw-bold) ${size}px/1 var(--font-display)`,
        letterSpacing: '0.01em',
        color: ink,
        ...style
      }
    }, rest), "SRSS", /*#__PURE__*/React.createElement("span", {
      style: {
        color: accent
      }
    }, "25"));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '2px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) ${size}px/1.05 var(--font-display)`,
      letterSpacing: 'var(--ls-caps-serif)',
      textTransform: 'uppercase',
      color: ink
    }
  }, "Sekolah Rendah Sathya Sai"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) ${Math.round(size * 0.4)}px/1.2 var(--font-body)`,
      color: accent
    }
  }, "Human Excellence \xB7 Kecemerlangan Insan"));
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/content/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Eyebrow — uppercase, wide-tracked kicker that sits above every SRSS heading. */
function Eyebrow({
  children,
  tone = 'gold',
  size = 'md',
  style,
  ...rest
}) {
  const tones = {
    gold: 'var(--gold-300)',
    goldInk: 'var(--gold-600)',
    onNavy: 'rgba(255,255,255,.62)',
    navy: 'var(--navy-500)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'block',
      font: `var(--fw-semibold) ${size === 'sm' ? 'var(--text-eyebrow-sm)' : 'var(--text-eyebrow)'}/1.3 var(--font-body)`,
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: tones[tone] || tones.gold,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/content/PillarCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PillarCard — one of three or four value propositions shown in a row,
 * separated by vertical hairlines rather than boxed in cards.
 */
function PillarCard({
  title,
  body,
  align = 'center',
  tone = 'light',
  divider = true,
  style,
  ...rest
}) {
  const onNavy = tone === 'navy';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      textAlign: align,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      padding: '0 var(--space-8)',
      borderLeft: divider ? `var(--stroke-hairline) solid ${onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}` : 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-h3)/var(--lh-heading) var(--font-display)',
      color: onNavy ? 'var(--white)' : 'var(--navy-800)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '34ch',
      font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-body)' : 'var(--text-muted)'
    }
  }, body));
}
Object.assign(__ds_scope, { PillarCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PillarCard.jsx", error: String((e && e.message) || e) }); }

// components/content/PullQuote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** PullQuote — Swami or community quotation, italic serif with a gold rule. */
function PullQuote({
  children,
  attribution,
  tone = 'navy',
  align = 'left',
  size = 'md',
  style,
  ...rest
}) {
  const onNavy = tone === 'navy';
  const s = size === 'lg' ? 'var(--text-display-sm)' : size === 'sm' ? 'var(--text-h3)' : 'var(--text-h1)';
  return /*#__PURE__*/React.createElement("figure", _extends({
    style: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      textAlign: align,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      borderLeft: align === 'left' ? 'var(--stroke-rule) solid var(--gold-500)' : 'none',
      paddingLeft: align === 'left' ? 'var(--space-8)' : 0,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      maxWidth: '34ch',
      fontStyle: 'italic',
      font: `italic var(--fw-regular) ${s}/var(--lh-heading) var(--font-display)`,
      color: onNavy ? 'var(--white)' : 'var(--navy-800)'
    }
  }, children), attribution && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow)/1.3 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)'
    }
  }, attribution));
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** SectionHeading — eyebrow + serif display heading + optional standfirst. */
function SectionHeading({
  eyebrow,
  title,
  accent,
  standfirst,
  align = 'left',
  tone = 'light',
  size = 'md',
  maxWidth,
  style,
  ...rest
}) {
  const onNavy = tone === 'navy';
  const sizes = {
    sm: 'var(--text-display-sm)',
    md: 'var(--text-display-md)',
    lg: 'var(--text-display-lg)',
    xl: 'var(--text-display-xl)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      textAlign: align,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      maxWidth,
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, {
    tone: onNavy ? 'gold' : 'goldInk'
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: `var(--fw-semibold) ${sizes[size] || sizes.md}/var(--lh-display) var(--font-display)`,
      letterSpacing: 'var(--ls-display)',
      color: onNavy ? 'var(--white)' : 'var(--navy-800)'
    }
  }, title, accent && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)'
    }
  }, accent))), standfirst && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '60ch',
      font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-body)' : 'var(--text-body)'
    }
  }, standfirst));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/content/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** StatBlock — a large serif figure with a Poppins label. Used in jubilee bands. */
function StatBlock({
  value,
  label,
  sublabel,
  tone = 'navy',
  align = 'left',
  metal,
  style,
  ...rest
}) {
  const onNavy = tone === 'navy';
  const figure = metal ? {
    background: metal === 'silver' ? 'var(--gradient-silver-foil)' : 'var(--gradient-gold-foil)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  } : {
    color: onNavy ? 'var(--white)' : 'var(--navy-800)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      textAlign: align,
      alignItems: align === 'center' ? 'center' : 'flex-start',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-bold) var(--text-display-lg)/1 var(--font-display)',
      letterSpacing: 'var(--ls-display)',
      ...figure
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow)/1.3 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)'
    }
  }, label), sublabel && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-snug) var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
    }
  }, sublabel));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/content/ValueSpectrum.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VALUES = [{
  en: 'Truth',
  ms: 'Kebenaran',
  color: 'var(--value-truth)'
}, {
  en: 'Right Conduct',
  ms: 'Kesucian',
  color: 'var(--value-conduct)'
}, {
  en: 'Peace',
  ms: 'Keamanan',
  color: 'var(--value-peace)'
}, {
  en: 'Love',
  ms: 'Cinta',
  color: 'var(--value-love)'
}, {
  en: 'Non-Violence',
  ms: 'Tanpa Kekerasan',
  color: 'var(--value-nonviolence)'
}];

/**
 * ValueSpectrum — the five Human Values in their crest colours. Renders as a
 * labelled row, a bare colour rule, or a stacked list.
 */
function ValueSpectrum({
  variant = 'row',
  tone = 'navy',
  bilingual = true,
  height = 6,
  style,
  ...rest
}) {
  const onNavy = tone === 'navy';
  if (variant === 'rule') {
    return /*#__PURE__*/React.createElement("div", _extends({
      role: "presentation",
      style: {
        height,
        background: 'var(--gradient-values-spectrum)',
        ...style
      }
    }, rest));
  }
  const stacked = variant === 'stack';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gridTemplateColumns: stacked ? '1fr' : `repeat(${VALUES.length}, 1fr)`,
      gap: stacked ? 'var(--space-4)' : 'var(--space-5)',
      ...style
    }
  }, rest), VALUES.map(v => /*#__PURE__*/React.createElement("div", {
    key: v.en,
    style: {
      display: 'flex',
      flexDirection: stacked ? 'row' : 'column',
      alignItems: stacked ? 'center' : 'flex-start',
      gap: stacked ? 'var(--space-4)' : 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: stacked ? 14 : '100%',
      height: stacked ? 14 : height,
      background: v.color,
      borderRadius: stacked ? 'var(--radius-pill)' : 0,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-body-sm)/1.3 var(--font-body)',
      color: onNavy ? 'var(--white)' : 'var(--navy-800)'
    }
  }, v.en), bilingual && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-caption)/1.3 var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
    }
  }, v.ms)))));
}
Object.assign(__ds_scope, { ValueSpectrum });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ValueSpectrum.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Badge — small status pill. Values tones use the crest colours. */
function Badge({
  children,
  tone = 'gold',
  style,
  ...rest
}) {
  const tones = {
    gold: {
      bg: 'var(--gold-100)',
      fg: 'var(--gold-700)',
      bd: 'var(--gold-200)'
    },
    navy: {
      bg: 'var(--navy-800)',
      fg: 'var(--white)',
      bd: 'var(--navy-800)'
    },
    onNavy: {
      bg: 'rgba(217,179,65,.16)',
      fg: 'var(--gold-300)',
      bd: 'rgba(217,179,65,.42)'
    },
    silver: {
      bg: 'var(--silver-200)',
      fg: 'var(--navy-700)',
      bd: 'var(--silver-400)'
    },
    success: {
      bg: '#E7F2EB',
      fg: '#0A5C30',
      bd: '#BCDCC8'
    },
    warning: {
      bg: '#FBF0DC',
      fg: '#8A5A0F',
      bd: '#EFD6A8'
    },
    danger: {
      bg: '#FBE9E9',
      fg: '#8E1820',
      bd: '#EFC4C6'
    }
  };
  const c = tones[tone] || tones.gold;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 11px',
      font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1.2 var(--font-body)',
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      color: c.fg,
      background: c.bg,
      border: `1px solid ${c.bd}`,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Tag — filterable topic chip (story categories, year groups). */
function Tag({
  children,
  active = false,
  tone = 'light',
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const onNavy = tone === 'navy';
  const bg = active ? onNavy ? 'var(--gold-400)' : 'var(--navy-800)' : hover ? onNavy ? 'rgba(255,255,255,.08)' : 'var(--cream-100)' : 'transparent';
  const fg = active ? onNavy ? 'var(--navy-800)' : 'var(--white)' : onNavy ? 'var(--white)' : 'var(--navy-700)';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      padding: '8px 16px',
      font: 'var(--fw-medium) var(--text-body-sm)/1.2 var(--font-body)',
      color: fg,
      background: bg,
      border: `1px solid ${active ? 'transparent' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Input — labelled text field. Hairline box, 4px radius, gold focus ring. */
function Input({
  label,
  hint,
  error,
  tone = 'light',
  required = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const onNavy = tone === 'navy';
  const fid = id || `in-${label ? label.toLowerCase().replace(/\W+/g, '-') : 'field'}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1.3 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: onNavy ? 'var(--gold-300)' : 'var(--navy-600)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--value-truth)'
    }
  }, " *")), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      font: 'var(--fw-regular) var(--text-body-md)/1.4 var(--font-body)',
      color: onNavy ? 'var(--white)' : 'var(--ink-900)',
      background: onNavy ? 'var(--surface-inset-navy)' : 'var(--white)',
      padding: '13px 15px',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${error ? 'var(--status-danger)' : focus ? 'var(--gold-400)' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
      boxShadow: focus ? '0 0 0 3px rgba(217,179,65,.25)' : 'none',
      outline: 'none',
      transition: 'var(--transition-control)'
    }
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)',
      color: error ? 'var(--status-danger)' : onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Icon geometry, inlined from the SVG sources kept in assets/icons/.
   Outline glyphs (k:'stroke') are Lucide (lucide-icons/lucide@main).
   Brand glyphs (k:'fill') are Simple Icons (simple-icons/simple-icons@develop).
   Inlined rather than linked so the glyph inherits currentColor with no network
   request and no cross-origin CSS-mask restriction. */
const ICONS = {
  "arrow-right": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path>"
  },
  "arrow-up-right": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M7 7h10v10\"></path><path d=\"M7 17 17 7\"></path>"
  },
  "book-open": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M12 5v16\"></path><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\"></path>"
  },
  "calendar": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M8 2v3\"></path><path d=\"M16 2v3\"></path><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M3 9h18\"></path>"
  },
  "check": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M20 6 9 17l-5-5\"></path>"
  },
  "chevron-down": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m6 9 6 6 6-6\"></path>"
  },
  "chevron-left": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m15 18-6-6 6-6\"></path>"
  },
  "chevron-right": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m9 18 6-6-6-6\"></path>"
  },
  "circle-alert": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line>"
  },
  "circle-check": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m16 9-5.5 5.5L8 12\"></path>"
  },
  "clock": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 6v6l4 2\"></path>"
  },
  "download": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M12 15V3\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m7 10 5 5 5-5\"></path>"
  },
  "external-link": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>"
  },
  "facebook": {
    "v": "0 0 24 24",
    "k": "fill",
    "d": "<path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"></path>"
  },
  "file-text": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>"
  },
  "flag": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\"></path>"
  },
  "globe": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"></path><path d=\"M2 12h20\"></path>"
  },
  "graduation-cap": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z\"></path><path d=\"M22 10v6\"></path><path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\"></path>"
  },
  "hand-heart": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16\"></path><path d=\"m14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95\"></path><path d=\"m2 15 6 6\"></path><path d=\"m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91\"></path>"
  },
  "heart-handshake": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762\"></path>"
  },
  "info": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>"
  },
  "instagram": {
    "v": "0 0 24 24",
    "k": "fill",
    "d": "<path d=\"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077\"></path>"
  },
  "languages": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m5 8 6 6\"></path><path d=\"m4 14 6-6 2-3\"></path><path d=\"M2 5h12\"></path><path d=\"M7 2h1\"></path><path d=\"m22 22-5-10-5 10\"></path><path d=\"M14 18h6\"></path>"
  },
  "mail": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"></path><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"></rect>"
  },
  "map-pin": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>"
  },
  "menu": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M4 5h16\"></path><path d=\"M4 12h16\"></path><path d=\"M4 19h16\"></path>"
  },
  "minus": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M5 12h14\"></path>"
  },
  "moon": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\"></path>"
  },
  "music": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M9 18V5l12-2v13\"></path><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><circle cx=\"18\" cy=\"16\" r=\"3\"></circle>"
  },
  "pause": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"></rect><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"></rect>"
  },
  "phone": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"></path>"
  },
  "play": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"></path>"
  },
  "plus": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path>"
  },
  "printer": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\"></path><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\"></rect>"
  },
  "quote": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"></path><path d=\"M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"></path>"
  },
  "search": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m21 21-4.34-4.34\"></path><circle cx=\"11\" cy=\"11\" r=\"8\"></circle>"
  },
  "sparkles": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"></path><path d=\"M20 2v4\"></path><path d=\"M22 4h-4\"></path><circle cx=\"4\" cy=\"20\" r=\"2\"></circle>"
  },
  "star": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"></path>"
  },
  "sun": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"m4.93 4.93 1.41 1.41\"></path><path d=\"m17.66 17.66 1.41 1.41\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"m6.34 17.66-1.41 1.41\"></path><path d=\"m19.07 4.93-1.41 1.41\"></path>"
  },
  "triangle-alert": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>"
  },
  "users": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"></path><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle>"
  },
  "utensils": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"></path><path d=\"M7 2v20\"></path><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\"></path>"
  },
  "volume-2": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"></path><path d=\"M16 9a5 5 0 0 1 0 6\"></path><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"></path>"
  },
  "whatsapp": {
    "v": "0 0 24 24",
    "k": "fill",
    "d": "<path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z\"></path>"
  },
  "x": {
    "v": "0 0 24 24",
    "k": "stroke",
    "d": "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>"
  },
  "youtube": {
    "v": "0 0 24 24",
    "k": "fill",
    "d": "<path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"></path>"
  }
};

/**
 * Icon — inline SVG glyph that inherits currentColor, so it tints with the text
 * beside it. SRSS ships no icon set of its own; see readme.md → ICONOGRAPHY.
 */
function Icon({
  name = 'arrow-right',
  size = 20,
  style,
  ...rest
}) {
  const g = ICONS[name];
  if (!g) return null;
  const paint = g.k === 'fill' ? {
    fill: 'currentColor',
    stroke: 'none'
  } : {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  return /*#__PURE__*/React.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-icon": name,
    viewBox: g.v,
    width: size,
    height: size
  }, paint, {
    style: {
      display: 'inline-block',
      flex: '0 0 auto',
      verticalAlign: 'middle',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: g.d
    }
  }, rest));
}
Object.assign(__ds_scope, { ICONS, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/ArrowLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** ArrowLink — the SRSS text CTA: label, arrow, gold rule that grows on hover. */
function ArrowLink({
  children,
  href = '#',
  tone = 'navy',
  size = 'md',
  icon = 'arrow-right',
  underline = true,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const tones = {
    navy: {
      color: 'var(--navy-800)',
      rule: 'var(--gold-500)'
    },
    onNavy: {
      color: 'var(--white)',
      rule: 'var(--gold-400)'
    },
    gold: {
      color: 'var(--gold-300)',
      rule: 'var(--gold-400)'
    }
  };
  const c = tones[tone] || tones.navy;
  const font = size === 'sm' ? 'var(--text-body-sm)' : 'var(--text-body-md)';
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '6px',
      textDecoration: 'none',
      color: c.color,
      width: 'fit-content',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      font: `var(--fw-semibold) ${font}/1.3 var(--font-body)`
    }
  }, children, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 16 : 18,
    style: {
      transform: hover ? 'translateX(4px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-out)'
    }
  })), underline && /*#__PURE__*/React.createElement("span", {
    style: {
      height: 'var(--stroke-underline)',
      background: c.rule,
      width: hover ? '100%' : '72%',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { ArrowLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/ArrowLink.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const SIZES = {
  sm: {
    pad: '10px 18px',
    font: 'var(--text-body-sm)',
    icon: 16
  },
  md: {
    pad: '15px 26px',
    font: 'var(--text-body-md)',
    icon: 18
  },
  lg: {
    pad: '18px 32px',
    font: 'var(--text-body-lg)',
    icon: 20
  }
};

/** Button — SRSS's primary action. Gold fill on navy, squared corners. */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'end',
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const skins = {
    primary: {
      background: press ? 'var(--action-primary-bg-active)' : hover ? 'var(--action-primary-bg-hover)' : 'var(--action-primary-bg)',
      color: 'var(--action-primary-fg)',
      border: '1px solid transparent',
      boxShadow: hover && !press ? 'var(--shadow-gold)' : 'var(--shadow-none)'
    },
    outline: {
      background: hover ? 'rgba(217,179,65,.12)' : 'transparent',
      color: 'var(--action-secondary-fg)',
      border: '1px solid var(--action-secondary-border)'
    },
    'outline-ink': {
      background: hover ? 'var(--cream-100)' : 'transparent',
      color: 'var(--navy-700)',
      border: '1px solid var(--navy-700)'
    },
    ghost: {
      background: hover ? 'var(--cream-100)' : 'transparent',
      color: 'var(--action-quiet-fg)',
      border: '1px solid transparent'
    },
    solid: {
      background: press ? 'var(--navy-900)' : hover ? 'var(--navy-700)' : 'var(--navy-800)',
      color: 'var(--white)',
      border: '1px solid transparent'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      padding: s.pad,
      font: `var(--fw-semibold) ${s.font}/1 var(--font-body)`,
      letterSpacing: '0.01em',
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.42 : 1,
      transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
      transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-out)',
      ...(skins[variant] || skins.primary),
      ...style
    }
  }, rest), icon && iconPosition === 'start' && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }), children, icon && iconPosition === 'end' && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon,
    style: {
      transform: hover ? 'translateX(3px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** IconButton — square or circular glyph-only control (search, menu, social). */
function IconButton({
  icon = 'search',
  label,
  shape = 'square',
  tone = 'onNavy',
  size = 44,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const tones = {
    onNavy: {
      color: 'var(--white)',
      bg: hover ? 'rgba(255,255,255,.10)' : 'transparent',
      border: 'transparent'
    },
    onNavyRing: {
      color: 'var(--white)',
      bg: hover ? 'rgba(255,255,255,.10)' : 'transparent',
      border: 'var(--border-hairline-navy)'
    },
    gold: {
      color: hover ? 'var(--gold-200)' : 'var(--gold-300)',
      bg: 'transparent',
      border: 'transparent'
    },
    ink: {
      color: 'var(--navy-700)',
      bg: hover ? 'var(--cream-100)' : 'transparent',
      border: 'transparent'
    }
  };
  const c = tones[tone] || tones.onNavy;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label || icon,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: shape === 'circle' ? 'var(--radius-pill)' : 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.42 : 1,
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.48)
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/content/AudienceLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** AudienceLink — one cell of the "For Parents / Students / Teachers / Community" row. */
function AudienceLink({
  title,
  body,
  href = '#',
  tone = 'light',
  divider = true,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const onNavy = tone === 'navy';
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-5)',
      padding: 'var(--space-6) var(--space-8)',
      textDecoration: 'none',
      borderLeft: divider ? `var(--stroke-hairline) solid ${onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}` : 'none',
      background: hover ? onNavy ? 'rgba(255,255,255,.04)' : 'var(--cream-100)' : 'transparent',
      transition: 'background-color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-h4)/1.25 var(--font-display)',
      color: onNavy ? 'var(--white)' : 'var(--navy-800)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.4 var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
    }
  }, body)), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 20,
    style: {
      color: onNavy ? 'var(--gold-300)' : 'var(--navy-600)',
      transform: hover ? 'translateX(3px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { AudienceLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/AudienceLink.jsx", error: String((e && e.message) || e) }); }

// components/content/StoryCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * StoryCard — full-bleed photograph with a navy foot gradient and type laid
 * directly over the image. The SRSS news / reflection unit.
 */
function StoryCard({
  image,
  kicker,
  title,
  body,
  cta = 'Read the story',
  href = '#',
  height = 380,
  size = 'md',
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const titleSize = size === 'lg' ? 'var(--text-display-md)' : size === 'sm' ? 'var(--text-h3)' : 'var(--text-display-sm)';
  return /*#__PURE__*/React.createElement("article", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      overflow: 'hidden',
      height,
      background: 'var(--navy-900)',
      borderRadius: 'var(--radius-none)',
      ...style
    }
  }, rest), image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover ? 'scale(var(--image-zoom))' : 'scale(1)',
      transition: 'transform var(--dur-slow) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--gradient-photo-foot)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      gap: 'var(--space-4)',
      padding: 'var(--space-8)'
    }
  }, kicker && /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, {
    tone: "gold"
  }, kicker), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      maxWidth: '22ch',
      font: `var(--fw-semibold) ${titleSize}/var(--lh-display) var(--font-display)`,
      letterSpacing: 'var(--ls-display)',
      color: 'var(--white)'
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '48ch',
      font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-snug) var(--font-body)',
      color: 'var(--text-on-navy-body)'
    }
  }, body), cta && /*#__PURE__*/React.createElement(__ds_scope.ArrowLink, {
    tone: "onNavy",
    size: "sm",
    icon: "arrow-up-right",
    href: href,
    underline: false,
    style: {
      marginTop: 'var(--space-1)'
    }
  }, cta)));
}
Object.assign(__ds_scope, { StoryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StoryCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Notice.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: {
    icon: 'info',
    accent: 'var(--value-peace)',
    bg: '#EEF3FB'
  },
  gold: {
    icon: 'sparkles',
    accent: 'var(--gold-600)',
    bg: 'var(--gold-100)'
  },
  success: {
    icon: 'check-circle',
    accent: 'var(--status-success)',
    bg: '#E7F2EB'
  },
  warning: {
    icon: 'alert-triangle',
    accent: 'var(--status-warning)',
    bg: '#FBF0DC'
  },
  danger: {
    icon: 'alert-circle',
    accent: 'var(--status-danger)',
    bg: '#FBE9E9'
  }
};

/** Notice — inline message band. Top gold/colour rule, no left-border stripe. */
function Notice({
  title,
  children,
  tone = 'info',
  style,
  ...rest
}) {
  const c = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      background: c.bg,
      borderTop: `var(--stroke-rule) solid ${c.accent}`,
      padding: 'var(--space-5) var(--space-6)',
      display: 'flex',
      gap: 'var(--space-4)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: c.accent,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: c.icon,
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-body-md)/1.4 var(--font-body)',
      color: 'var(--navy-800)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)',
      color: 'var(--ink-700)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Notice });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Notice.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Checkbox — 20px square with a gold checked fill. */
function Checkbox({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  tone = 'light',
  disabled = false,
  style,
  ...rest
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked === undefined ? internal : checked;
  const onNavy = tone === 'navy';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (checked === undefined) setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 20,
      height: 20,
      flex: '0 0 auto',
      marginTop: 2,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-sm)',
      background: on ? 'var(--gold-400)' : onNavy ? 'var(--surface-inset-navy)' : 'var(--white)',
      border: `1px solid ${on ? 'var(--gold-400)' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
      color: 'var(--navy-800)',
      transition: 'var(--transition-control)'
    }
  }, on && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      color: onNavy ? 'var(--white)' : 'var(--ink-800)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/** Select — native select styled to match Input, with a chevron affordance. */
function Select({
  label,
  hint,
  options = [],
  tone = 'light',
  required = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const onNavy = tone === 'navy';
  const fid = id || `sel-${label ? label.toLowerCase().replace(/\W+/g, '-') : 'field'}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1.3 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: onNavy ? 'var(--gold-300)' : 'var(--navy-600)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--value-truth)'
    }
  }, " *")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      appearance: 'none',
      font: 'var(--fw-regular) var(--text-body-md)/1.4 var(--font-body)',
      color: onNavy ? 'var(--white)' : 'var(--ink-900)',
      background: onNavy ? 'var(--surface-inset-navy)' : 'var(--white)',
      padding: '13px 42px 13px 15px',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${focus ? 'var(--gold-400)' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
      boxShadow: focus ? '0 0 0 3px rgba(217,179,65,.25)' : 'none',
      outline: 'none',
      transition: 'var(--transition-control)'
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value || o,
    value: o.value || o
  }, o.label || o))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 18,
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      color: onNavy ? 'var(--gold-300)' : 'var(--navy-500)',
      pointerEvents: 'none'
    }
  })), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)',
      color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Breadcrumbs — interior-page trail. Current page is not a link. */
function Breadcrumbs({
  items = [],
  tone = 'light',
  style,
  ...rest
}) {
  const onNavy = tone === 'navy';
  return /*#__PURE__*/React.createElement("nav", _extends({
    "aria-label": "Breadcrumb",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      flexWrap: 'wrap',
      ...style
    }
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: (it.label || it) + i
    }, last ? /*#__PURE__*/React.createElement("span", {
      "aria-current": "page",
      style: {
        font: 'var(--fw-semibold) var(--text-body-sm)/1.4 var(--font-body)',
        color: onNavy ? 'var(--white)' : 'var(--navy-800)'
      }
    }, it.label || it) : /*#__PURE__*/React.createElement("a", {
      href: it.href || '#',
      style: {
        textDecoration: 'none',
        font: 'var(--fw-regular) var(--text-body-sm)/1.4 var(--font-body)',
        color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)'
      }
    }, it.label || it), !last && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        color: onNavy ? 'rgba(255,255,255,.4)' : 'var(--ink-300)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteFooter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const H = {
  font: 'var(--fw-semibold) var(--text-eyebrow)/1 var(--font-body)',
  letterSpacing: 'var(--ls-eyebrow)',
  textTransform: 'uppercase',
  color: 'var(--gold-300)',
  marginBottom: 'var(--space-2)'
};

/** SiteFooter — navy footer: crest blurb, contact table, link columns, socials. */
function SiteFooter({
  blurb = 'A values-based primary school in Kuala Lumpur nurturing academic excellence, strong character and compassionate leadership since 2002.',
  contact = [['Address', 'Sekolah Rendah Sathya Sai, Kuala Lumpur, Malaysia'], ['Phone', '+603 — school office'], ['Email', 'info@srss.edu.my']],
  columns = [{
    title: 'Explore',
    links: ['About SRSS', 'Learning', 'School Life', 'Human Values', 'Silver Jubilee']
  }, {
    title: 'For families',
    links: ['Admissions & Visits', 'Parent Hub', 'Term calendar', 'Uniform & supplies', 'Contact us']
  }],
  socials = ['mail', 'facebook', 'instagram', 'youtube'],
  crestSrc = 'assets/logo-srss-crest.png',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("footer", _extends({
    style: {
      background: 'var(--navy-900)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.ValueSpectrum, {
    variant: "rule",
    height: 4
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr 1fr',
      gap: 'var(--space-16)',
      padding: 'var(--space-16) var(--space-8) var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Crest, {
    size: 56,
    lockup: "name",
    tone: "onNavy",
    src: crestSrc
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '44ch',
      font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)',
      color: 'var(--text-on-navy-body)'
    }
  }, blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: H
  }, "Contact"), contact.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 92,
      flex: '0 0 auto',
      font: 'var(--fw-semibold) var(--text-caption)/1.5 var(--font-body)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--gold-300)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      color: 'var(--text-on-navy-body)'
    }
  }, v))))), columns.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.title,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: H
  }, col.title), col.links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      textDecoration: 'none',
      font: 'var(--fw-regular) var(--text-body-sm)/1.9 var(--font-body)',
      color: 'var(--text-on-navy-body)'
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-8)',
      padding: 'var(--space-6) var(--space-8)',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)',
      color: 'var(--text-on-navy-muted)'
    }
  }, "\xA9 ", new Date().getFullYear(), " Sekolah Rendah Sathya Sai, Kuala Lumpur \xB7 Human Excellence \xB7 Kecemerlangan Insan"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, socials.map(s => /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    key: s,
    icon: s,
    label: s,
    shape: "circle",
    tone: "onNavyRing",
    size: 44
  })))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * SiteHeader — the SRSS masthead: crest lockup left, nav right,
 * search / Parent Hub / gold-outlined Admissions button.
 *
 * The bar is a single no-wrap row, so it tightens itself as the nav grows:
 * past five items it drops the tagline, shrinks the crest and closes the gaps
 * rather than letting the lockup wrap and spill over the ticker above.
 */
function SiteHeader({
  nav = ['About', 'Learning', 'School Life', 'Values', 'Community'],
  active,
  onNavigate,
  crestSrc = 'assets/logo-srss-crest.png',
  ctaLabel = 'Admissions & Visits',
  denseCtaLabel = 'Admissions',
  onCta,
  compact = false,
  style,
  ...rest
}) {
  const [hovered, setHovered] = useState(null);
  const dense = compact || nav.length > 5;
  const navFont = dense ? '15px' : 'var(--text-body-md)';
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: dense ? 'var(--space-6)' : 'var(--space-10)',
      minHeight: compact ? 76 : 'var(--header-h)',
      padding: '0 var(--space-8)',
      background: 'var(--navy-800)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Crest, {
    size: dense ? 48 : 60,
    lockup: dense ? 'name' : 'full',
    tone: "onNavy",
    src: crestSrc
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: dense ? 'var(--space-4)' : 'var(--space-8)',
      marginLeft: 'auto'
    }
  }, nav.map(item => {
    const on = hovered === item || active === item;
    return /*#__PURE__*/React.createElement("a", {
      key: item,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNavigate && onNavigate(item);
      },
      onMouseEnter: () => setHovered(item),
      onMouseLeave: () => setHovered(null),
      style: {
        textDecoration: 'none',
        paddingBottom: '5px',
        whiteSpace: 'nowrap',
        font: `var(--fw-medium) ${navFont}/1 var(--font-body)`,
        color: on ? 'var(--gold-300)' : 'var(--white)',
        borderBottom: `var(--stroke-underline) solid ${active === item ? 'var(--gold-400)' : 'transparent'}`,
        transition: 'var(--transition-control)'
      }
    }, item);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: dense ? 'var(--space-4)' : 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "search",
    label: "Search",
    tone: "onNavy",
    size: 44
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 26,
      flex: '0 0 auto',
      background: 'var(--border-hairline-navy)'
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      font: `var(--fw-medium) ${navFont}/1 var(--font-body)`,
      color: 'var(--white)'
    }
  }, "Parent Hub"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: dense ? 'sm' : 'md',
    onClick: onCta,
    style: {
      whiteSpace: 'nowrap'
    }
  }, dense ? denseCtaLabel : ctaLabel)));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/UpdatesTicker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
/**
 * UpdatesTicker — the thin navy strip above the masthead carrying one dated
 * announcement at a time, with a pause control and a "View all" link.
 */
function UpdatesTicker({
  label = 'Updates',
  date,
  message,
  linkLabel = 'View all updates',
  href = '#',
  paused = false,
  onTogglePause,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      height: 'var(--ticker-h)',
      padding: '0 var(--space-8)',
      background: 'var(--navy-900)',
      borderBottom: 'var(--stroke-hairline) solid rgba(255,255,255,.08)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--gold-300)'
    }
  }, label), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": paused ? 'Resume updates' : 'Pause updates',
    onClick: onTogglePause,
    style: {
      display: 'inline-flex',
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      color: 'var(--white)',
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: paused ? 'play' : 'pause',
    size: 13
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-4)',
      minWidth: 0,
      flex: 1
    }
  }, date && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) var(--text-body-sm)/1 var(--font-body)',
      color: 'var(--white)',
      whiteSpace: 'nowrap'
    }
  }, date), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1 var(--font-body)',
      color: 'var(--text-on-navy-body)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, message)), /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      font: 'var(--fw-semibold) var(--text-body-sm)/1 var(--font-body)',
      color: hover ? 'var(--gold-200)' : 'var(--gold-300)'
    }
  }, linkLabel, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 15
  })));
}
Object.assign(__ds_scope, { UpdatesTicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/UpdatesTicker.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/AdmissionsScreen.jsx
try { (() => {
const Band = window.Band;
const {
  SectionHeading,
  Input,
  Select,
  Checkbox,
  Button,
  Notice,
  Breadcrumbs,
  Eyebrow,
  StatBlock,
  ValueSpectrum,
  PillarCard
} = window.SRSS25DesignSystem_f05209;
function AdmissionsScreen() {
  const [sent, setSent] = React.useState(false);
  const [tour, setTour] = React.useState(true);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--navy-800)',
      padding: 'var(--space-8) var(--space-8) var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    tone: "navy",
    items: [{
      label: 'Home',
      href: '#'
    }, 'Admissions & Visits']
  }), /*#__PURE__*/React.createElement(SectionHeading, {
    tone: "navy",
    eyebrow: "Admissions \xB7 Intake 2027",
    title: "Come and see",
    accent: "an ordinary school day",
    standfirst: "The best way to understand SRSS is to stand in a corridor at 7.30am. Arrange a visit and we will show you the school as it actually runs.",
    size: "lg",
    maxWidth: 760
  }))), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "rule",
    height: 5
  }), /*#__PURE__*/React.createElement(Band, {
    tone: "cream"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)',
      gap: 'var(--space-20)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Notice, {
    tone: "gold",
    title: "Applications for the 2027 intake are open"
  }, "Online registration closes 15 August 2026. Onsite registration is not available \u2014 please apply early so we can plan properly."), /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "What happens next",
    title: "Three steps, no mystery",
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))'
    }
  }, /*#__PURE__*/React.createElement(PillarCard, {
    divider: false,
    align: "left",
    title: "1 \xB7 Visit",
    body: "A 90-minute weekday visit: assembly, two classrooms, and time with a teacher."
  }), /*#__PURE__*/React.createElement(PillarCard, {
    align: "left",
    title: "2 \xB7 Conversation",
    body: "A relaxed meeting with the school leadership about your child and your hopes."
  }), /*#__PURE__*/React.createElement(PillarCard, {
    align: "left",
    title: "3 \xB7 Offer",
    body: "Written outcome within two weeks, with a clear place and start date."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-16)',
      paddingTop: 'var(--space-6)',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    tone: "light",
    value: "90",
    label: "Minutes",
    sublabel: "Typical school visit"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    tone: "light",
    value: "2",
    label: "Weeks",
    sublabel: "To a written outcome"
  }))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      background: 'var(--white)',
      boxShadow: 'var(--shadow-md)',
      padding: 'var(--space-10)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "goldInk"
  }, "Arrange a visit"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 var(--space-2)',
      font: 'var(--fw-semibold) var(--text-h2)/1.2 var(--font-display)',
      color: 'var(--navy-800)'
    }
  }, "Request a school visit"), sent ? /*#__PURE__*/React.createElement(Notice, {
    tone: "success",
    title: "Request received"
  }, "Thank you. The school office will confirm your visit within two working days.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    label: "Child's full name",
    required: true,
    placeholder: "As per birth certificate"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Year of entry",
    required: true,
    options: ['2027', '2028', '2029']
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Preferred day",
    options: ['Tuesday', 'Thursday']
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Parent or guardian",
    required: true,
    placeholder: "Full name"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
    hint: "We reply within two working days."
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: tour,
    onChange: e => setTour(e.target.checked),
    label: "I would like a guided campus tour",
    description: "Tours run Tuesdays and Thursdays, 9 \u2013 11am."
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    icon: "arrow-right",
    fullWidth: true,
    style: {
      marginTop: 'var(--space-2)'
    }
  }, "Request a visit"))))));
}
Object.assign(window, {
  AdmissionsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/AdmissionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/HomeScreen.jsx
try { (() => {
const Band = window.Band;
const {
  SectionHeading,
  PillarCard,
  StoryCard,
  AudienceLink,
  Button,
  ArrowLink,
  Eyebrow,
  ValueSpectrum,
  PullQuote,
  StatBlock,
  Badge
} = window.SRSS25DesignSystem_f05209;
function Hero({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: 560,
      background: 'var(--navy-800)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.ASSETS + 'photo-student-rukun.png',
    alt: "",
    style: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: '62%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--gradient-hero-scrim)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-20) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 620,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Sekolah Rendah Sathya Sai \xB7 Since 2002"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-display-xl)/var(--lh-display) var(--font-display)',
      letterSpacing: 'var(--ls-display)',
      color: 'var(--white)'
    }
  }, "The End of", /*#__PURE__*/React.createElement("br", null), "Education is", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--gradient-gold-foil)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, "Character")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '52ch',
      font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)',
      color: 'var(--text-on-navy-body)'
    }
  }, "At ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--white)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, "Sekolah Rendah Sathya Sai"), ", education is the journey of drawing out the best within every child. By harmonising the Head, Heart and Hands, we cultivate learners who excel academically, live by universal human values, and become thoughtful leaders committed to making the world a better place."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-10)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "arrow-right",
    onClick: () => onNavigate('About')
  }, "Explore SRSS"), /*#__PURE__*/React.createElement(ArrowLink, {
    tone: "onNavy",
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('Admissions');
    }
  }, "Arrange a visit")))));
}
function HomeScreen({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "rule",
    height: 5
  }), /*#__PURE__*/React.createElement(Band, {
    tone: "cream"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "center",
    title: "A school for the mind, heart and character",
    size: "md",
    style: {
      margin: '0 auto var(--space-16)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))'
    }
  }, /*#__PURE__*/React.createElement(PillarCard, {
    divider: false,
    title: "Academic confidence",
    body: "Rigorous, engaging learning that builds knowledge, curiosity and the confidence to think independently."
  }), /*#__PURE__*/React.createElement(PillarCard, {
    title: "Human values in action",
    body: "Daily practice of respect, honesty and responsibility that shapes good decisions and strong character."
  }), /*#__PURE__*/React.createElement(PillarCard, {
    title: "Compassionate leadership",
    body: "Empathy, service and teamwork that inspire every child to lead with purpose and care for others."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))'
    }
  }, /*#__PURE__*/React.createElement(StoryCard, {
    image: window.ASSETS + 'photo-assembly-singing.png',
    kicker: "Assembly",
    title: "Every morning begins in one voice",
    cta: null,
    height: 320,
    size: "sm"
  }), /*#__PURE__*/React.createElement(StoryCard, {
    image: window.ASSETS + 'photo-assembly-meditate.png',
    kicker: "Silent sitting",
    title: "Two minutes that shape the whole day",
    cta: null,
    height: 320,
    size: "sm"
  }), /*#__PURE__*/React.createElement(StoryCard, {
    image: window.ASSETS + 'photo-meditate-assembly.png',
    kicker: "Classroom",
    title: "Learning that starts with attention",
    cta: null,
    height: 320,
    size: "sm"
  })), /*#__PURE__*/React.createElement(Band, {
    tone: "cream-alt",
    pad: "0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,minmax(0,1fr))'
    }
  }, /*#__PURE__*/React.createElement(AudienceLink, {
    divider: false,
    title: "For Parents",
    body: "Information, resources and support"
  }), /*#__PURE__*/React.createElement(AudienceLink, {
    title: "For Students",
    body: "Learning support and opportunities"
  }), /*#__PURE__*/React.createElement(AudienceLink, {
    title: "For Teachers",
    body: "Professional growth and collaboration"
  }), /*#__PURE__*/React.createElement(AudienceLink, {
    title: "For Community",
    body: "Volunteer, partner and connect"
  }))), /*#__PURE__*/React.createElement(Band, {
    tone: "navy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      gap: 'var(--space-20)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "onNavy"
  }, "Silver Jubilee \xB7 2027"), /*#__PURE__*/React.createElement(SectionHeading, {
    tone: "navy",
    title: "Twenty-five years of",
    accent: "Human Excellence",
    standfirst: "In 2027 SRSS marks its 25th year. One school, five values, and a quarter-century of children who left here knowing who they are.",
    size: "md"
  }), /*#__PURE__*/React.createElement(Button, {
    icon: "arrow-right",
    onClick: () => onNavigate('Jubilee')
  }, "Explore SRSS25")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-12) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "25",
    label: "Years",
    sublabel: "2002 \u2013 2027",
    metal: "silver"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "5",
    label: "Human values",
    sublabel: "Taught daily, lived daily"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "1",
    label: "Campus",
    sublabel: "Kuala Lumpur, Malaysia"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "\u221E",
    label: "Alumni stories",
    sublabel: "Still being written"
  })))), /*#__PURE__*/React.createElement(Band, {
    tone: "cream"
  }, /*#__PURE__*/React.createElement(PullQuote, {
    align: "center",
    tone: "light",
    size: "lg",
    attribution: "Bhagawan Sri Sathya Sai Baba"
  }, "The end of education is character.")));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/JubileeScreen.jsx
try { (() => {
const Band = window.Band;
const {
  JubileeMark,
  SectionHeading,
  StatBlock,
  Eyebrow,
  Badge,
  Button,
  ArrowLink,
  ValueSpectrum,
  Breadcrumbs,
  PullQuote
} = window.SRSS25DesignSystem_f05209;
const TIMELINE = [['2002', 'SRSS opens in Kuala Lumpur', 'The first intake of pupils begins a values-based primary education built on the Head, Heart and Hands.'], ['2009', 'The five values enter the daily timetable', 'Silent sitting and value reflection become fixed points of every school day, not occasional assemblies.'], ['2016', 'Community service becomes a school habit', 'Every year group adopts an ongoing service commitment beyond the school gate.'], ['2023', 'Alumni network formalised', 'Two decades of former pupils reconnect as mentors, speakers and visiting teachers.'], ['2027', '25 Years of Human Excellence', 'The Silver Jubilee year: a celebration of a quarter-century of character, and a commitment to the next.']];
function JubileeScreen({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--gradient-navy-depth)',
      padding: 'var(--space-8) var(--space-8) var(--space-24)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-12)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    tone: "navy",
    items: [{
      label: 'Home',
      href: '#'
    }, 'Silver Jubilee']
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr)',
      gap: 'var(--space-16)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.ASSETS + 'logo-srss25-jubilee.png',
    alt: "SRSS25 Silver Jubilee emblem",
    style: {
      width: 260,
      height: 260,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "onNavy"
  }, "Silver Jubilee \xB7 2027"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--fw-bold) var(--text-display-xl)/1.02 var(--font-display)',
      letterSpacing: 'var(--ls-display)',
      color: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--gradient-silver-foil)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, "25 Years"), /*#__PURE__*/React.createElement("br", null), "of Human Excellence"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '54ch',
      font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)',
      color: 'var(--text-on-navy-body)'
    }
  }, "Sekolah Rendah Sathya Sai opened its doors in 2002. In 2027 we mark twenty-five years of drawing out the best within every child \u2014 and invite every family, teacher and alumnus who built it to celebrate with us."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-10)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "arrow-right",
    onClick: () => onNavigate('Admissions')
  }, "Register your interest"), /*#__PURE__*/React.createElement(ArrowLink, {
    tone: "onNavy",
    icon: "download"
  }, "Download the jubilee brief")))))), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "rule",
    height: 6
  }), /*#__PURE__*/React.createElement(Band, {
    tone: "cream-alt",
    pad: "var(--space-16) var(--space-8)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    tone: "light",
    value: "25",
    label: "Years",
    sublabel: "2002 \u2013 2027"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    tone: "light",
    value: "5",
    label: "Human values",
    sublabel: "At the centre of every day"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    tone: "light",
    value: "1",
    label: "Campus",
    sublabel: "Kuala Lumpur, Malaysia"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    tone: "light",
    value: "2027",
    label: "Jubilee year",
    sublabel: "Celebrations across the year"
  }))), /*#__PURE__*/React.createElement(Band, {
    tone: "cream"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "A quarter-century",
    title: "How SRSS grew",
    maxWidth: 640,
    style: {
      marginBottom: 'var(--space-12)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, TIMELINE.map(([year, title, body], i) => /*#__PURE__*/React.createElement("div", {
    key: year,
    style: {
      display: 'grid',
      gridTemplateColumns: '150px minmax(0,1fr)',
      gap: 'var(--space-10)',
      padding: 'var(--space-8) 0',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-bold) var(--text-display-sm)/1 var(--font-display)',
      color: i === TIMELINE.length - 1 ? 'var(--gold-600)' : 'var(--navy-800)'
    }
  }, year), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-h3)/1.25 var(--font-display)',
      color: 'var(--navy-800)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '68ch',
      font: 'var(--fw-regular) var(--text-body-md)/var(--lh-body) var(--font-body)',
      color: 'var(--text-body)'
    }
  }, body)))))), /*#__PURE__*/React.createElement(Band, {
    tone: "navy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-20)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PullQuote, {
    tone: "navy",
    attribution: "SRSS25 committee"
  }, "A school is twenty-five years of children, not twenty-five years of buildings."), /*#__PURE__*/React.createElement(JubileeMark, {
    size: 150,
    lockup: "stacked",
    tone: "onNavy",
    src: window.ASSETS + 'logo-srss25-jubilee.png'
  }))));
}
Object.assign(window, {
  JubileeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/JubileeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/Shell.jsx
try { (() => {
const {
  UpdatesTicker,
  SiteHeader,
  SiteFooter
} = window.SRSS25DesignSystem_f05209;
const CREST = '../../assets/logo-srss-crest.png';
const UPDATES = [{
  date: '20 Jul 2026',
  message: 'Discover school life, upcoming dates and the latest news from the SRSS community.'
}, {
  date: '15 Jul 2026',
  message: 'SRSS Primary Science Week 2026 runs from 21 – 25 July. Parents are welcome to visit our Open Classroom sessions.'
}, {
  date: '02 Jul 2026',
  message: 'Silver Jubilee planning begins — the SRSS25 committee invites alumni to register their interest.'
}];
function Shell({
  active,
  onNavigate,
  children
}) {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI(n => (n + 1) % UPDATES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);
  const u = UPDATES[i];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--navy-800)',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(UpdatesTicker, {
    date: u.date,
    message: u.message,
    paused: paused,
    onTogglePause: () => setPaused(p => !p)
  }), /*#__PURE__*/React.createElement(SiteHeader, {
    nav: ['About', 'Learning', 'School Life', 'Values', 'Resources', 'Community'],
    active: active,
    onNavigate: onNavigate,
    crestSrc: CREST,
    onCta: () => onNavigate('Admissions')
  }), /*#__PURE__*/React.createElement("main", null, children), /*#__PURE__*/React.createElement(SiteFooter, {
    crestSrc: CREST
  }));
}
const Band = ({
  tone = 'cream',
  pad = 'var(--space-24) var(--space-8)',
  children,
  style
}) => /*#__PURE__*/React.createElement("section", {
  style: {
    background: tone === 'cream' ? 'var(--cream-50)' : tone === 'cream-alt' ? 'var(--cream-100)' : 'var(--navy-800)',
    padding: pad,
    ...style
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto'
  }
}, children));
Object.assign(window, {
  Shell,
  Band,
  CREST,
  ASSETS: '../../assets/'
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/SongsPrayersScreen.jsx
try { (() => {
const Band = window.Band;
const {
  SectionHeading,
  Eyebrow,
  Breadcrumbs,
  ValueSpectrum,
  Button,
  ArrowLink,
  Icon,
  Badge,
  Notice,
  PullQuote,
  Tag
} = window.SRSS25DesignSystem_f05209;

/* ---------------------------------------------------------------- data ---- */

const ORDER = [{
  id: 'silent-sitting',
  icon: 'sparkles',
  label: 'Silent Sitting',
  note: 'Two minutes of stillness'
}, {
  id: 'negaraku',
  icon: 'flag',
  label: 'Negaraku',
  note: 'The national anthem'
}, {
  id: 'anthem',
  icon: 'music',
  label: 'SRSS Anthem',
  note: 'Keunggulan insan'
}, {
  id: 'rukun-negara',
  icon: 'book-open',
  label: 'Rukun Negara',
  note: 'Five national principles'
}, {
  id: 'pledge',
  icon: 'hand-heart',
  label: 'School Pledge',
  note: 'Right hand on heart'
}, {
  id: 'prayers',
  icon: 'sun',
  label: 'Prayers',
  note: 'Morning, lunch and closing'
}];
const ANTHEM = [{
  ms: ['SRSS kami hormatimu', 'Kerana ajaran luhurmu', 'SRSS kami berikrar', 'Keunggulan insan tujuan kami'],
  en: ['SRSS, we honour you', 'for the noble teaching you give.', 'SRSS, we make this promise —', 'human excellence is our aim.'],
  ta: ['எஸ்ஆர்எஸ்எஸ், உன்னை வணங்குகிறோம்', 'உன் உயர்ந்த போதனைகளுக்காக', 'எஸ்ஆர்எஸ்எஸ், நாங்கள் உறுதி கூறுகிறோம்', 'மனித மேன்மையே எங்கள் இலக்கு'],
  zh: ['SRSS,我们向你致敬', '因为你崇高的教诲', 'SRSS,我们立下誓言', '人格的卓越是我们的目标'],
  ph: ['es-ar-es-es · KA-mi hor-MA-ti-mu', 'ke-RA-na a-JA-ran lu-HUR-mu', 'es-ar-es-es · KA-mi be-RIK-rar', 'ke-UNG-gu-lan IN-san TU-ju-an KA-mi']
}, {
  ms: ['Kebenaran, keadilan seruanmu', 'Aman dan sayang sifat ketuhanan', 'Keramahan rukun keemasan', 'Keunggulan insan tujuan kami'],
  en: ['Truth and justice are your call,', 'peace and love, the nature of the Divine.', 'Kindness is our golden rule —', 'human excellence is our aim.'],
  ta: ['உண்மையும் நீதியும் உன் அழைப்பு', 'அமைதியும் அன்பும் தெய்வத் தன்மை', 'கருணையே எங்கள் பொன்னான நெறி', 'மனித மேன்மையே எங்கள் இலக்கு'],
  zh: ['真理与正义是你的召唤', '和平与慈爱是神性的本质', '仁善是我们的黄金准则', '人格的卓越是我们的目标'],
  ph: ['ke-be-NA-ran, ke-a-DI-lan se-RU-an-mu', 'A-man dan SA-yang si-FAT ke-tu-HA-nan', 'ke-RA-ma-han RU-kun ke-e-MA-san', 'ke-UNG-gu-lan IN-san TU-ju-an KA-mi']
}, {
  ms: ['Kami bertutur benar', 'Berjalan menurut keadilan', 'Mematuhi cita-cita negara', 'Kami akan menyebarkan kasih sayang.', 'Menghormati', 'SRSS', 'selamanya'],
  en: ['We will speak what is true', 'and walk the path of justice.', 'We will hold to the hopes of our nation', 'and carry love wherever we go —', 'honouring', 'SRSS', 'always.'],
  ta: ['நாங்கள் உண்மையே பேசுவோம்', 'நீதியின் வழியில் நடப்போம்', 'நாட்டின் இலக்குகளைப் போற்றுவோம்', 'அன்பை எங்கும் பரப்புவோம்', 'போற்றுகிறோம்', 'எஸ்ஆர்எஸ்எஸ்', 'என்றென்றும்'],
  zh: ['我们说真实的话', '走在正义的路上', '秉持国家的理想', '把爱传播到各处', '敬爱', 'SRSS', '永远'],
  ph: ['KA-mi ber-TU-tur be-NAR', 'ber-JA-lan me-NU-rut ke-a-DI-lan', 'me-ma-TU-hi CHI-ta-CHI-ta ne-GA-ra', 'KA-mi A-kan me-nye-BAR-kan KA-sih SA-yang', 'meng-hor-MA-ti', 'es-ar-es-es', 'se-la-MA-nya']
}];
const ANTHEM_GLOSSES = [{
  id: 'en',
  label: 'English',
  note: 'An unofficial reading for meaning, not a singing translation.'
}, {
  id: 'ta',
  label: 'தமிழ்',
  note: 'Tamil reading for meaning — pending review by the language panel.'
}, {
  id: 'zh',
  label: '中文',
  note: 'Mandarin reading for meaning — pending review by the language panel.'
}, {
  id: 'ph',
  label: 'Pronunciation',
  note: 'Syllable guide for singing; capitals mark the stressed syllable.'
}];
const NEGARAKU = ['Negaraku', 'Tanah tumpahnya darah ku', 'Rakyat hidup bersatu dan maju', 'Rahmat bahagia Tuhan kurniakan', 'Raja kita selamat bertakhta', 'Rahmat bahagia Tuhan kurniakan', 'Raja kita selamat bertakhta'];
const RUKUN = [['Kepercayaan kepada Tuhan', 'Belief in God', 'var(--value-truth)'], ['Kesetiaan kepada Raja dan Negara', 'Loyalty to King and Country', 'var(--value-conduct)'], ['Keluhuran Perlembagaan', 'Upholding the Constitution', 'var(--value-peace)'], ['Kedaulatan Undang-Undang', 'Rule of Law', 'var(--value-love)'], ['Kesopanan dan Kesusilaan', 'Courtesy and Morality', 'var(--value-nonviolence)']];
const PLEDGE_OPENING = ['We are the children of Sathya Sai,', 'striving to be ideal Sai students,', 'shaped by Devotion, Duty and Discipline,', 'guided by Discrimination and Determination.'];
const PLEDGE_VALUES = [{
  value: 'Truth',
  ms: 'Kebenaran',
  color: 'var(--value-truth)',
  lines: ['to be honest in my work, clear in my words,', 'and true to myself, even when no one is watching.']
}, {
  value: 'Right Conduct',
  ms: 'Kesucian',
  color: 'var(--value-conduct)',
  lead: 'follow',
  lines: ['to respect the rules, own my actions,', 'and do my duty with a willing heart.']
}, {
  value: 'Peace',
  ms: 'Keamanan',
  color: 'var(--value-peace)',
  lead: 'cultivate',
  lines: ['to keep a calm mind, master my feelings,', 'and make my classroom a place of harmony.']
}, {
  value: 'Love',
  ms: 'Cinta',
  color: 'var(--value-love)',
  lead: 'practise',
  lines: ['to be kind, to encourage others,', 'and to help everyone grow with confidence.']
}, {
  value: 'Non-Violence',
  ms: 'Tanpa Kekerasan',
  color: 'var(--value-nonviolence)',
  lead: 'live',
  lines: ['to solve problems by talking, not hurting,', 'and to choose gentle words and caring actions.']
}];
const PLEDGE_CLOSING = ['I will love and respect my parents, teachers and elders in all circumstances.', 'I will use my senses wisely, serve society and protect my country.', 'I will bring a good name to my family, my school and to Swami,', 'and let Love flow in all I think, say and do.'];
const PRAYERS = [{
  id: 'morning',
  icon: 'sun',
  tab: 'Morning',
  title: 'Universal Prayer',
  when: 'Morning assembly',
  stanzas: [['Dear God, as this new day begins,', 'be the light that shines within.'], ['Be in my mind, and make my thinking clear.', 'Be in my eyes, and let me see the good in all.', 'Be in my ears, and let me listen with care.', 'Be in my mouth, and let my words be true and kind.', 'Be in my hands, and let them help and serve.', 'Be in my feet, and guide me on the right path.', 'Be in my heart, and let me love all.'], ['Make me a light for someone today.']]
}, {
  id: 'lunch',
  icon: 'utensils',
  tab: 'Lunchtime',
  title: 'Food Prayer',
  when: 'Before the midday meal',
  stanzas: [['Thank You, God, for this food,', 'for sun and rain that made it grow,', "for farmers' hands and cooks' kind care,", 'for all the love that brought it here.'], ['Thank you dear parents, teachers, and uncles and aunties', 'who have prepared this food for us today.', 'Thank you, God, for the food.'], ['I offer this food to You with gratitude.', 'May it give me strength to learn, to serve, and to love.', 'May all beings everywhere have enough to eat.']]
}, {
  id: 'closing',
  icon: 'moon',
  tab: 'Closing',
  title: 'Peace Prayer',
  when: 'End of the school day',
  stanzas: [['For the lessons I have learnt today,', 'for friends who shared my work and play,', 'for teachers who have shown the way,', 'thank You, God, for this day.'], ['Let there be Peace in my heart,', 'Peace in my home,', 'Peace in my country,', 'and Peace in all the world.'], ['Let there be Joy in my heart,', 'Joy in my home,', 'Joy in my country,', 'and Joy in all the world.'], ['Let there be Love in my heart,', 'Love in my home,', 'Love in my country,', 'and Love in all the world.']]
}, {
  id: 'surrender',
  icon: 'hand-heart',
  tab: 'Dedication',
  title: 'Prayer of Surrender',
  when: 'Closing dedication',
  stanzas: [['O Lord, take my love,', 'and let it flow in full devotion to You.'], ['O Lord, take my hands,', 'and let them work tirelessly for You.'], ['O Lord, take my mind and thoughts,', 'and keep them in tune with You.'], ['O Lord, take my soul,', 'and let it merge as one with You.'], ['O Lord, take my everything,', 'and make me Your instrument of Love.']]
}];

/* ------------------------------------------------------------ fragments ---- */

const RULE = {
  height: 2,
  background: 'var(--gold-500)',
  width: 56
};

/** Every panel opens the same way: full-bleed photo, one-sided navy scrim, copy over it. */
function PanelHero({
  id,
  image,
  alt,
  objectPosition = '50% 40%',
  side = 'left',
  eyebrow,
  title,
  subtitle,
  standfirst,
  minHeight = 520,
  children
}) {
  const scrim = side === 'left' ? 'linear-gradient(90deg,rgba(6,15,38,.95) 0%,rgba(6,15,38,.88) 40%,rgba(6,15,38,.35) 78%,rgba(6,15,38,.15) 100%)' : 'linear-gradient(270deg,rgba(6,15,38,.95) 0%,rgba(6,15,38,.88) 40%,rgba(6,15,38,.35) 78%,rgba(6,15,38,.15) 100%)';
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      position: 'relative',
      minHeight,
      overflow: 'hidden',
      background: 'var(--navy-900)',
      scrollMarginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.ASSETS + image,
    alt: alt,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: scrim
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-20) var(--space-8)',
      display: 'flex',
      justifyContent: side === 'left' ? 'flex-start' : 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-display-md)/var(--lh-display) var(--font-display)',
      letterSpacing: 'var(--ls-display)',
      color: 'var(--white)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-h3)/1.3 var(--font-display)',
      background: 'var(--gradient-gold-foil)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, subtitle), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '48ch',
      font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)',
      color: 'var(--text-on-navy-body)',
      textWrap: 'pretty'
    }
  }, standfirst), children)));
}
function SectionShell({
  id,
  eyebrow,
  title,
  accent,
  standfirst,
  tone = 'cream',
  children,
  pad
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      background: tone === 'navy' ? 'var(--navy-800)' : tone === 'cream-alt' ? 'var(--cream-100)' : 'var(--cream-50)',
      padding: pad || 'var(--space-24) var(--space-8)',
      scrollMarginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    tone: tone === 'navy' ? 'navy' : 'light',
    eyebrow: eyebrow,
    title: title,
    accent: accent,
    standfirst: standfirst,
    size: "md",
    maxWidth: 760,
    style: {
      marginBottom: 'var(--space-12)'
    }
  }), children));
}
function Verse({
  lines,
  tone = 'light',
  size = 'md',
  italic = false,
  align = 'left'
}) {
  const f = size === 'lg' ? 'var(--text-h2)' : size === 'sm' ? 'var(--text-body-lg)' : 'var(--text-h3)';
  return /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: align,
      font: `${italic ? 'italic ' : ''}var(--fw-regular) ${f}/1.62 var(--font-display)`,
      color: tone === 'navy' ? 'var(--white)' : 'var(--navy-800)'
    }
  }, lines.map((l, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, l, i < lines.length - 1 && /*#__PURE__*/React.createElement("br", null))));
}
const RAIL_GRADIENTS = ['linear-gradient(150deg,#F4D27A 0%,#E0A93B 46%,#A9740A 100%)', 'linear-gradient(150deg,#6A1F74 0%,#9B3FA8 48%,#D9BCE4 100%)', 'linear-gradient(150deg,#04264F 0%,#0F4B85 52%,#6FA3CC 100%)', 'linear-gradient(150deg,#96062C 0%,#D1204E 48%,#F491A8 100%)', 'linear-gradient(150deg,#0A5236 0%,#12885A 52%,#63D3A4 100%)'];
function OrderRail({
  active,
  onSelect
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": "Assembly order",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6,minmax(0,1fr))',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)'
    }
  }, ORDER.map((s, i) => {
    const on = active === s.id;
    const hot = on || hover === s.id;
    const grad = RAIL_GRADIENTS[i % RAIL_GRADIENTS.length];
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      type: "button",
      role: "tab",
      "aria-selected": on,
      "aria-controls": `panel-${s.id}`,
      onClick: () => onSelect(s.id),
      onMouseEnter: () => setHover(s.id),
      onMouseLeave: () => setHover(null),
      style: {
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-6) var(--space-5)',
        border: 0,
        borderLeft: i === 0 ? 'none' : 'var(--stroke-hairline) solid var(--border-hairline-navy)',
        borderTop: `var(--stroke-rule) solid ${on ? 'var(--gold-400)' : 'transparent'}`,
        borderBottom: `var(--stroke-rule) solid ${on ? 'var(--gold-400)' : 'transparent'}`,
        backgroundColor: 'transparent',
        backgroundImage: on ? `linear-gradient(rgba(6,15,38,.42),rgba(6,15,38,.42)), ${grad}` : hot ? 'linear-gradient(rgba(255,255,255,.07),rgba(255,255,255,.07))' : 'none',
        transition: 'var(--transition-control)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        color: on ? 'var(--gold-200)' : hot ? 'var(--gold-200)' : 'var(--gold-300)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 18
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1 var(--font-body)',
        letterSpacing: 'var(--ls-eyebrow)'
      }
    }, String(i + 1).padStart(2, '0'))), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-semibold) var(--text-h4)/1.25 var(--font-display)',
        color: 'var(--white)'
      }
    }, s.label), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-regular) var(--text-caption)/1.45 var(--font-body)',
        color: on ? 'rgba(255,255,255,.92)' : 'var(--text-on-navy-body)'
      }
    }, s.note));
  }));
}

/* -------------------------------------------------------------- screens ---- */

function SilentSitting() {
  return /*#__PURE__*/React.createElement(PanelHero, {
    id: "silent-sitting",
    image: "photo-meditate-closeup.png",
    alt: "SRSS pupils seated cross-legged with eyes closed during silent sitting",
    objectPosition: "50% 35%",
    eyebrow: "01 \xB7 The loudest lesson is silence",
    title: "Silent Sitting",
    standfirst: "The first five minutes in SRSS are probably the hardest and most important part of our morning. Eyes closed, hands resting, breathing slow, the whole school sits still. Before the mind can learn, it must first be quiet."
  });
}
function Negaraku() {
  const [playing, setPlaying] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PanelHero, {
    id: "negaraku",
    image: "photo-flag-malaysia-hoist.png",
    alt: "An SRSS pupil raising the Jalur Gemilang at morning assembly while the school stands to attention",
    objectPosition: "70% 40%",
    eyebrow: "02 \xB7 Standing to attention",
    title: "Negaraku",
    standfirst: "Our first lesson in duty isn't taught in a textbook \u2014 it is practised every morning at 7:30. Chin up, standing tall, the whole school sings the national anthem as the Jalur Gemilang is raised."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: playing ? 'pause' : 'play',
    iconPosition: "start",
    onClick: () => setPlaying(p => !p)
  }, playing ? 'Stop the recording' : 'Listen to Negaraku'), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      color: 'var(--text-on-navy-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "volume-2",
    size: 16,
    style: {
      color: 'var(--gold-300)'
    }
  }), "Audio only \u2014 sing along for classroom practice."), playing && /*#__PURE__*/React.createElement("iframe", {
    src: "https://www.youtube-nocookie.com/embed/t44hyUvRe8Y?autoplay=1&controls=0",
    title: "Negaraku \u2014 the national anthem of Malaysia",
    allow: "autoplay; encrypted-media",
    style: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0,
      border: 0,
      pointerEvents: 'none'
    }
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-50)',
      padding: 'var(--space-20) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: RULE
  }), /*#__PURE__*/React.createElement(Verse, {
    lines: NEGARAKU,
    size: "lg"
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, "PATRIOTISM | NEGARAKU"))));
}
function Anthem() {
  const [gloss, setGloss] = React.useState('en');
  const [show, setShow] = React.useState(true);
  const active = ANTHEM_GLOSSES.find(g => g.id === gloss);
  const hairline = 'var(--stroke-hairline) solid var(--border-hairline-navy)';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PanelHero, {
    id: "anthem",
    image: "illustration-school-sunset.png",
    alt: "An illustration of Sekolah Rendah Sathya Sai at sunrise",
    objectPosition: "50% 50%",
    side: "right",
    eyebrow: "03 \xB7 The school's own song",
    title: "SRSS Anthem",
    subtitle: "Keunggulan insan tujuan kami",
    standfirst: "Our anthem names the thing we are here for: human excellence. Truth and justice are its call; kindness is its golden rule."
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--gradient-navy-depth)',
      padding: 'var(--space-20) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-12)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-h3)/1.2 var(--font-display)',
      color: 'var(--white)'
    }
  }, "The words, verse by verse"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, ANTHEM_GLOSSES.map(g => /*#__PURE__*/React.createElement(Tag, {
    key: g.id,
    tone: "navy",
    active: show && gloss === g.id,
    onClick: () => {
      setGloss(g.id);
      setShow(true);
    }
  }, g.label))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShow(s => !s),
    style: {
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      color: 'var(--gold-300)',
      font: 'var(--fw-semibold) var(--text-body-sm)/1.4 var(--font-body)'
    }
  }, show ? 'Hide the meaning column' : 'Show the meaning column'))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: hairline
    }
  }, ANTHEM.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: 'var(--space-10) 0',
      borderBottom: i === ANTHEM.length - 1 ? 'none' : hairline,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1 var(--font-body)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--gold-300)'
    }
  }, "Verse ", i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: show ? 'minmax(0,1.35fr) minmax(0,1fr)' : 'minmax(0,1fr)',
      columnGap: 'var(--space-16)',
      rowGap: 'var(--space-3)',
      alignItems: 'baseline'
    }
  }, v.ms.map((line, j) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: j
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-h3)/1.45 var(--font-display)',
      color: 'var(--white)'
    }
  }, line), show && /*#__PURE__*/React.createElement("span", {
    lang: gloss === 'ta' ? 'ta' : gloss === 'zh' ? 'zh' : undefined,
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      fontStyle: gloss === 'en' ? 'italic' : 'normal',
      letterSpacing: gloss === 'ph' ? '0.02em' : 'normal',
      color: 'var(--text-on-navy-muted)'
    }
  }, v[gloss][j]))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-8)',
      font: 'var(--fw-regular) var(--text-body-sm)/1.6 var(--font-body)',
      color: 'var(--text-on-navy-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "languages",
    size: 16,
    style: {
      color: 'var(--gold-300)'
    }
  }), show ? `${active.note} The anthem is always sung in Bahasa Melayu.` : 'The anthem is always sung in Bahasa Melayu.'))));
}
function RukunNegara() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PanelHero, {
    id: "rukun-negara",
    image: "photo-assembly-rows-wide.jpeg",
    alt: "The whole school seated in rows on mats at morning assembly",
    objectPosition: "50% 55%",
    eyebrow: "04 \xB7 Recited together",
    title: "Rukun Negara",
    standfirst: "The five national principles, recited by the whole school after the anthem \u2014 one voice, five hundred children."
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-100)',
      padding: 'var(--space-20) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(PullQuote, {
    align: "left",
    tone: "light",
    size: "sm",
    attribution: "Rukun Negara \xB7 preamble"
  }, "Maka kami, rakyat Malaysia, berikrar akan menumpukan seluruh tenaga dan usaha kami untuk mencapai cita-cita tersebut berdasarkan atas prinsip-prinsip yang berikut"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
      gap: 'var(--space-1)'
    }
  }, RUKUN.map(([ms, en, color], i) => /*#__PURE__*/React.createElement("div", {
    key: ms,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      background: 'var(--white)',
      padding: 'var(--space-6)',
      borderTop: `4px solid ${color}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-bold) var(--text-display-sm)/1 var(--font-display)',
      color
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-h4)/1.3 var(--font-display)',
      color: 'var(--navy-800)',
      textTransform: 'uppercase',
      letterSpacing: '0.02em'
    }
  }, ms), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      color: 'var(--text-muted)',
      marginTop: 'auto'
    }
  }, en)))))));
}
function Pledge() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PanelHero, {
    id: "pledge",
    image: "photo-values-boards.png",
    alt: "SRSS pupils holding framed boards reading Truth, Right Conduct, Peace, Love and Non-violence",
    objectPosition: "70% 50%",
    eyebrow: "05 \xB7 Right hand on heart",
    title: "The SRSS School Pledge",
    standfirst: "Five values, said out loud every morning. The pledge is how a child learns to name what they are practising \u2014 and to promise it in their own voice."
  }, /*#__PURE__*/React.createElement(Verse, {
    tone: "navy",
    size: "sm",
    italic: true,
    lines: PLEDGE_OPENING
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--cream-50)',
      padding: 'var(--space-20) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, PLEDGE_VALUES.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.value,
    style: {
      display: 'grid',
      gridTemplateColumns: '6px 280px minmax(0,1fr)',
      gap: 'var(--space-8)',
      padding: 'var(--space-8) 0',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: p.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.4 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, "I pledge to ", p.lead || 'uphold'), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-h2)/1.12 var(--font-display)',
      color: p.color
    }
  }, p.value), /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "goldInk",
    size: "sm"
  }, p.ms)), /*#__PURE__*/React.createElement(Verse, {
    lines: p.lines,
    size: "md"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
      gap: 'var(--space-16)',
      alignItems: 'center',
      paddingTop: 'var(--space-8)',
      borderTop: 'var(--stroke-rule) solid var(--gold-500)'
    }
  }, /*#__PURE__*/React.createElement(Verse, {
    lines: PLEDGE_CLOSING,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) var(--text-display-sm)/1.1 var(--font-display)',
      background: 'var(--gradient-gold-foil)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, "Love all, Serve all."), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, "The last line of the pledge, and the first rule of the school."))))));
}
function Prayers() {
  const [active, setActive] = React.useState('morning');
  const p = PRAYERS.find(x => x.id === active);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PanelHero, {
    id: "prayers",
    image: "photo-prayer-mic-girl.png",
    alt: "An SRSS pupil with palms joined leading the morning prayer at the microphone",
    objectPosition: "60% 35%",
    side: "right",
    eyebrow: "06 \xB7 Through the day",
    title: "Prayers",
    standfirst: "Four prayers mark the school day \u2014 one to open it, one over lunch, one to close it, and one to dedicate everything in between."
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--navy-800)',
      padding: 'var(--space-20) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '280px minmax(0,1fr)',
      gap: 'var(--space-16)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)'
    }
  }, PRAYERS.map(x => {
    const on = x.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: x.id,
      type: "button",
      onClick: () => setActive(x.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        textAlign: 'left',
        padding: 'var(--space-5) var(--space-5)',
        cursor: 'pointer',
        background: on ? 'rgba(255,255,255,.07)' : 'transparent',
        border: 0,
        borderBottom: 'var(--stroke-hairline) solid var(--border-hairline-navy)',
        borderLeft: `var(--stroke-rule) solid ${on ? 'var(--gold-400)' : 'transparent'}`,
        transition: 'var(--transition-control)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: x.icon,
      size: 20,
      style: {
        color: on ? 'var(--gold-300)' : 'rgba(255,255,255,.55)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-semibold) var(--text-body-md)/1.2 var(--font-body)',
        color: on ? 'var(--white)' : 'var(--text-on-navy-body)'
      }
    }, x.tab), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-regular) var(--text-caption)/1.3 var(--font-body)',
        color: 'var(--text-on-navy-muted)'
      }
    }, x.title)));
  }), /*#__PURE__*/React.createElement("img", {
    src: window.ASSETS + 'photo-flag-crest.png',
    alt: "The SRSS crest at the centre of the school flag",
    style: {
      width: '100%',
      aspectRatio: '4 / 3',
      objectFit: 'cover',
      marginTop: 'var(--space-8)'
    }
  })), /*#__PURE__*/React.createElement("article", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, p.when), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-h1)/1.15 var(--font-display)',
      color: 'var(--white)'
    }
  }, p.title), /*#__PURE__*/React.createElement("span", {
    style: {
      ...RULE,
      background: 'var(--gold-400)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-7)'
    }
  }, p.stanzas.map((s, i) => /*#__PURE__*/React.createElement(Verse, {
    key: i,
    tone: "navy",
    lines: s,
    size: "md"
  }))), p.coda && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      paddingTop: 'var(--space-6)',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'italic var(--fw-regular) var(--text-h3)/1.4 var(--font-display)',
      color: 'var(--gold-300)'
    }
  }, p.coda), p.gloss && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)',
      color: 'var(--text-on-navy-muted)'
    }
  }, p.gloss))))));
}

/* ----------------------------------------------------------------- page ---- */

function SongsPrayersScreen({
  onNavigate
}) {
  const [open, setOpen] = React.useState(ORDER[0].id);
  const PANELS = {
    'silent-sitting': /*#__PURE__*/React.createElement(SilentSitting, null),
    negaraku: /*#__PURE__*/React.createElement(Negaraku, null),
    anthem: /*#__PURE__*/React.createElement(Anthem, null),
    'rukun-negara': /*#__PURE__*/React.createElement(RukunNegara, null),
    pledge: /*#__PURE__*/React.createElement(Pledge, null),
    prayers: /*#__PURE__*/React.createElement(Prayers, null)
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, '@media print{.srss-fold{display:block!important}}@keyframes srssFold{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}'), /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--navy-800)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.ASSETS + 'photo-seated-rows.png',
    alt: "",
    style: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: '52%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--gradient-hero-scrim)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-8) var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    tone: "navy",
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'Resources',
      href: '#'
    }, 'Songs, Pledge & Prayers']
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 780,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)',
      marginTop: 'var(--space-12)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Anthem \xB7 Pledge \xB7 Silence \xB7 Prayer"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-display-lg)/var(--lh-display) var(--font-display)',
      letterSpacing: 'var(--ls-display)',
      color: 'var(--white)'
    }
  }, "Before the", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--gradient-gold-foil)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, "First Bell")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '58ch',
      font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)',
      color: 'var(--text-on-navy-body)',
      textWrap: 'pretty'
    }
  }, "Anthem. Pledge. Silence. Prayer. This is how an SRSS morning begins \u2014 and why it stays with a child for life. Learn them, print them, practise them at home: these are the lines every SRSS child carries forever.")))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--navy-700)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(OrderRail, {
    active: open,
    onSelect: setOpen
  }))), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "rule",
    height: 5
  }), ORDER.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    id: `panel-${s.id}`,
    role: "tabpanel",
    className: "srss-fold",
    "aria-hidden": open !== s.id,
    style: {
      display: open === s.id ? 'block' : 'none',
      animation: open === s.id ? 'srssFold var(--dur-base) var(--ease-out)' : 'none'
    }
  }, PANELS[s.id])), /*#__PURE__*/React.createElement(Band, {
    tone: "cream-alt",
    pad: "var(--space-16) var(--space-8)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      gap: 'var(--space-12)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Notice, {
    tone: "gold",
    title: "For parents and teachers"
  }, "Every text on this page may be printed and used at home or in class. Nothing here is copyrighted to the school \u2014 the anthem is national, the pledge and prayers are ours to share."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    icon: "printer",
    iconPosition: "start",
    onClick: () => window.print()
  }, "Print"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-ink",
    icon: "arrow-right",
    onClick: () => onNavigate && onNavigate('Values')
  }, "The five values")))));
}
Object.assign(window, {
  SongsPrayersScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/SongsPrayersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/StoriesScreen.jsx
try { (() => {
const Band = window.Band;
const {
  SectionHeading,
  StoryCard,
  Tag,
  Breadcrumbs,
  ArrowLink,
  ValueSpectrum,
  Eyebrow,
  Badge
} = window.SRSS25DesignSystem_f05209;
const STORIES = [{
  tag: 'Reflection',
  kicker: 'Reflection · 5 min read',
  title: 'What changes when service becomes a habit?',
  body: 'Pupils reflect on the quiet discipline behind meaningful, sustained community work.',
  image: 'photo-assembly-meditate.png'
}, {
  tag: 'Voices',
  kicker: 'Voices',
  title: 'Malaysian roots. Sai wings.',
  body: 'What our pupils carry from their community into the wider world.',
  image: 'photo-assembly-singing.png'
}, {
  tag: 'Assembly',
  kicker: 'School life',
  title: 'Two minutes of silence, every single morning',
  body: 'Why silent sitting opens the SRSS day — and what it does to a classroom.',
  image: 'photo-meditate-assembly.png'
}, {
  tag: 'Academics',
  kicker: 'Learning · Science Week',
  title: 'A week where every corridor became a laboratory',
  body: 'Open Classroom sessions brought parents into the middle of the experiment.',
  image: 'photo-student-rukun.png'
}];
const PEOPLE = [{
  img: 'portrait-staff-01.png',
  name: 'School leadership',
  role: 'On twenty-five years of character education'
}, {
  img: 'portrait-staff-02.png',
  name: 'SRSS25 committee',
  role: 'On planning the Silver Jubilee year'
}];
function StoriesScreen() {
  const [filter, setFilter] = React.useState('All stories');
  const tags = ['All stories', 'Reflection', 'Voices', 'Assembly', 'Academics'];
  const shown = filter === 'All stories' ? STORIES : STORIES.filter(s => s.tag === filter);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--navy-800)',
      padding: 'var(--space-8) var(--space-8) var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    tone: "navy",
    items: [{
      label: 'Home',
      href: '#'
    }, 'Community', 'Stories']
  }), /*#__PURE__*/React.createElement(SectionHeading, {
    tone: "navy",
    eyebrow: "Community \xB7 Stories",
    title: "School life, in the",
    accent: "words of the school",
    standfirst: "Reflections, voices and reports from the SRSS community \u2014 pupils, teachers, parents and alumni.",
    size: "lg",
    maxWidth: 760
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    tone: "navy",
    active: filter === t,
    onClick: () => setFilter(t)
  }, t))))), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "rule",
    height: 5
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: shown.length > 1 ? '1.4fr 1fr' : '1fr'
    }
  }, shown.map((s, i) => /*#__PURE__*/React.createElement(StoryCard, {
    key: s.title,
    image: window.ASSETS + s.image,
    kicker: s.kicker,
    title: s.title,
    body: s.body,
    height: i === 0 ? 460 : 230,
    size: i === 0 ? 'lg' : 'sm'
  }))), /*#__PURE__*/React.createElement(Band, {
    tone: "cream"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Voices from the school",
    title: "Who you will meet",
    maxWidth: 640,
    style: {
      marginBottom: 'var(--space-12)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
      gap: 'var(--space-12)'
    }
  }, PEOPLE.map(p => /*#__PURE__*/React.createElement("article", {
    key: p.name,
    style: {
      display: 'grid',
      gridTemplateColumns: '160px minmax(0,1fr)',
      gap: 'var(--space-8)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.ASSETS + p.img,
    alt: "",
    style: {
      width: 160,
      height: 190,
      objectFit: 'cover',
      objectPosition: 'top'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "silver"
  }, "Interview"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-h3)/1.25 var(--font-display)',
      color: 'var(--navy-800)'
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, p.role), /*#__PURE__*/React.createElement(ArrowLink, {
    size: "sm",
    icon: "arrow-up-right"
  }, "Read the interview")))))));
}
Object.assign(window, {
  StoriesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/StoriesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/srss_website/ValuesScreen.jsx
try { (() => {
const Band = window.Band;
const {
  SectionHeading,
  ValueSpectrum,
  Breadcrumbs,
  PullQuote,
  Eyebrow,
  StoryCard,
  Button,
  Tag
} = window.SRSS25DesignSystem_f05209;
const DETAIL = [{
  en: 'Truth',
  ms: 'Kebenaran',
  color: 'var(--value-truth)',
  body: 'Pupils learn to say what is so — in their work, with their friends, and about themselves. Honest marking, honest reflection, honest apology.'
}, {
  en: 'Right Conduct',
  ms: 'Kesucian',
  color: 'var(--value-conduct)',
  body: 'Duty done well and quietly: uniform in order, homework on time, the classroom left better than it was found.'
}, {
  en: 'Peace',
  ms: 'Keamanan',
  color: 'var(--value-peace)',
  body: 'Two minutes of silent sitting opens every school day. Stillness is taught as a skill, not a mood.'
}, {
  en: 'Love',
  ms: 'Cinta',
  color: 'var(--value-love)',
  body: 'Care expressed as attention — to a classmate struggling, to a younger pupil lost, to a parent waiting at the gate.'
}, {
  en: 'Non-Violence',
  ms: 'Tanpa Kekerasan',
  color: 'var(--value-nonviolence)',
  body: 'Gentleness in word and hand, extended to people, to animals and to the school\u2019s own grounds.'
}];
function ValuesScreen({
  onNavigate
}) {
  const [filter, setFilter] = React.useState('All values');
  const shown = filter === 'All values' ? DETAIL : DETAIL.filter(d => d.en === filter);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--navy-800)',
      padding: 'var(--space-8) var(--space-8) var(--space-20)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    tone: "navy",
    items: [{
      label: 'Home',
      href: '#'
    }, 'Values']
  }), /*#__PURE__*/React.createElement(SectionHeading, {
    tone: "navy",
    eyebrow: "Kecemerlangan Insan \xB7 Human Excellence",
    title: "Five values, taught",
    accent: "every single day",
    standfirst: "The Human Values are not a subject at SRSS. They are the grammar of the school day \u2014 present in assembly, in marking, in the corridor and at the gate.",
    size: "lg",
    maxWidth: 820
  }), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "row",
    tone: "navy",
    height: 6
  }))), /*#__PURE__*/React.createElement(ValueSpectrum, {
    variant: "rule",
    height: 5
  }), /*#__PURE__*/React.createElement(Band, {
    tone: "cream"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-12)'
    }
  }, ['All values', ...DETAIL.map(d => d.en)].map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    active: filter === t,
    onClick: () => setFilter(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, shown.map(d => /*#__PURE__*/React.createElement("article", {
    key: d.en,
    style: {
      display: 'grid',
      gridTemplateColumns: '6px 240px minmax(0,1fr)',
      gap: 'var(--space-8)',
      padding: 'var(--space-8) 0',
      borderTop: 'var(--stroke-hairline) solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: d.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--fw-semibold) var(--text-h2)/1.15 var(--font-display)',
      color: 'var(--navy-800)'
    }
  }, d.en), /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "goldInk",
    size: "sm"
  }, d.ms)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '62ch',
      font: 'var(--fw-regular) var(--text-body-md)/var(--lh-body) var(--font-body)',
      color: 'var(--text-body)'
    }
  }, d.body))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr'
    }
  }, /*#__PURE__*/React.createElement(StoryCard, {
    image: window.ASSETS + 'photo-assembly-meditate.png',
    kicker: "Reflection \xB7 5 min read",
    title: "What changes when service becomes a habit?",
    body: "Pupils reflect on the quiet discipline behind meaningful, sustained community work.",
    height: 440,
    size: "lg"
  }), /*#__PURE__*/React.createElement(StoryCard, {
    image: window.ASSETS + 'photo-assembly-singing.png',
    kicker: "Voices",
    title: "Malaysian roots. Sai wings.",
    body: "What our pupils carry from their community into the wider world.",
    height: 440
  })), /*#__PURE__*/React.createElement(Band, {
    tone: "navy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 'var(--space-16)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PullQuote, {
    tone: "navy",
    size: "md",
    attribution: "SRSS school motto"
  }, "Head, Heart and Hands, working as one."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "arrow-right",
    onClick: () => onNavigate('Admissions')
  }, "Arrange a visit"))));
}
Object.assign(window, {
  ValuesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/srss_website/ValuesScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ArrowLink = __ds_scope.ArrowLink;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Crest = __ds_scope.Crest;

__ds_ns.JubileeMark = __ds_scope.JubileeMark;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.AudienceLink = __ds_scope.AudienceLink;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.PillarCard = __ds_scope.PillarCard;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.StoryCard = __ds_scope.StoryCard;

__ds_ns.ValueSpectrum = __ds_scope.ValueSpectrum;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Notice = __ds_scope.Notice;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.ICONS = __ds_scope.ICONS;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.UpdatesTicker = __ds_scope.UpdatesTicker;

})();
