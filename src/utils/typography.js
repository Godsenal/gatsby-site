import Typography from 'typography';

const Theme = {
  baseFontSize: 17,
  baseLineHeight: 1.75,
  headerFontFamily: ['Exo', 'Noto Sans KR', 'sans-serif'],
  bodyFontFamily: ['Yrsa', 'Noto Serif KR', 'serif'],
  googleFonts: [
    { name: 'Exo', styles: ['400', '700'] },
    { name: 'Yrsa', styles: ['400', '700'] },
    { name: 'Noto Sans KR', styles: ['400', '700'] },
    { name: 'Noto Serif KR', styles: ['400', '700'] },
  ],
  headerWeight: 700,
  bodyWeight: 400,
  boldWeight: 700,
  includeNormalize: true,
  overrideStyles: () => ({
    html: {
      // overflowY 를 scroll 로 넣어주고 있어서 body-scroll-lock이 안먹힘
      overflowY: 'initial',
    },
    code: {
      fontSize: '1em',
    },
    h1: {
      fontSize: '3em',
    },
  }),
};

const typography = new Typography(Theme);
// 개발 모드 hot reload
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles();
}

export default typography;
