const express = require('express');

const router = express.Router();

const palettes = {
  'morning-forms.svg': ['#f1eee8', '#101010', '#d95f2b', '#f1c84b'],
  'quiet-geometry.svg': ['#ded7ca', '#23364f', '#e8a43d', '#f8f5ef'],
  'field-study.svg': ['#e6e0d4', '#6f8f72', '#c74d32', '#111111'],
  'black-sun.svg': ['#101010', '#f1eee8', '#d95f2b', '#a7b9a5']
};

router.get('/:name', (req, res) => {
  const palette = palettes[req.params.name] || palettes['morning-forms.svg'];
  const [bg, ink, accent, soft] = palette;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" role="img" aria-label="Demo artwork">
      <rect width="900" height="1200" fill="${bg}"/>
      <circle cx="258" cy="286" r="152" fill="${accent}"/>
      <rect x="410" y="180" width="270" height="660" rx="18" fill="${ink}"/>
      <circle cx="604" cy="760" r="210" fill="${soft}"/>
      <path d="M148 945 C260 802 396 828 488 925 C594 1038 724 991 802 890 L802 1200 L148 1200 Z" fill="${accent}"/>
      <text x="70" y="103" fill="${ink}" font-family="Helvetica, Arial, sans-serif" font-size="54" font-weight="800" letter-spacing="-3">Rachanatmak</text>
      <text x="72" y="165" fill="${ink}" opacity="0.55" font-family="Helvetica, Arial, sans-serif" font-size="25" letter-spacing="7">DEMO ARTWORK</text>
    </svg>
  `;

  res.type('svg').send(svg);
});

module.exports = router;
