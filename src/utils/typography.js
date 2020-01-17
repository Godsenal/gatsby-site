import Typography from "typography";

const Theme = {
  baseFontSize: 18,
  baseLineHeight: 1.75,
  headerFontFamily: ["Roboto", "Noto Sans KR", "sans-serif"],
  bodyFontFamily: ["Roboto", "Noto Sans KR", "serif"],
  googleFonts: [
    { name: "Open Sans", styles: ["700", "700i"] },
    { name: "Noto Sans KR", styles: ["300", "300", "500", "500"] },
    { name: "Roboto", styles: ["300", "300", "500", "500"] }
  ],
  headerWeight: 500,
  bodyWeight: 300,
  boldWeight: 500,
  includeNormalize: true,
  overrideStyles: () => ({
    code: {
      fontSize: "1em"
    }
  })
};

const typography = new Typography(Theme);
// 개발 모드 hot reload
if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

export default typography;
