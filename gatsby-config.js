module.exports = {
  siteMetadata: {
    title: "Godsenal",
    description:
      "안녕하세요. 이태희입니다. 공부하며 배우는 것들을 작성 중입니다.",
    url: "https://godsenal.com",
    favicon: "/images/favicon.ico",
    image: "/images/deadpool.jpg",
    repository: "",
    profile: {
      email: "mailto:tmqps78@gmail.com",
      github: "https://github.com/Godsenal"
    }
  },
  plugins: [
    `gatsby-plugin-emotion`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`
      }
    },
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false
            }
          }
        ]
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `post`,
        path: `${__dirname}/src/pages/`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projects`,
        path: `${__dirname}/src/projects/`
      }
    }
  ]
};
