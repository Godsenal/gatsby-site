import Typography from "typography";

const Theme = {
  baseFontSize: 18,
  baseLineHeight: 1.78,
  bodyColor: "#fefefe",
  headerColor: "#fb7da7",
  headerFontFamily: ["Open Sans", "Noto Sans KR", "sans-serif"],
  bodyFontFamily: ["Merriweather", "Noto Sans KR", "serif"],
  googleFonts: [
    { name: "Open Sans", styles: ["700", "700i"] },
    { name: "Noto Sans KR", styles: ["300", "300", "700", "700i"] },
    { name: "Merriweather", styles: ["300", "300", "700", "700i"] }
  ],
  headerWeight: 700,
  bodyWeight: 300,
  boldWeight: 700
};

const typography = new Typography(Theme);
// 개발 모드 hot reload
if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

export default typography;
