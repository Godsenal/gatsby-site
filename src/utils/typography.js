import Typography from "typography";

const typography = new Typography({
  baseFontSize: "22px",
  headerWeight: 700,
  headerColor: "#fb7da7",
  headerFontFamily: ["Merriweather", "Noto Sans KR"],
  bodyFontFamily: ["Ubuntu", "Noto Sans KR"],
  bodyColor: "#fefefe",
  googleFonts: [
    {
      name: "Merriweather",
      styles: ["400", "400i", "700", "700i"]
    },
    {
      name: "Noto Sans KR",
      styles: ["400", "400i", "700", "700i"]
    },
    {
      name: "Ubuntu",
      styles: ["400", "400i", "700", "700i"]
    }
  ]
});

export default typography;
