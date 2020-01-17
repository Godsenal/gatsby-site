import React from "react";
import { css } from "@emotion/core";
import { StaticQuery, graphql } from "gatsby";
import { useTheme } from "../theme";

const query = graphql`
  {
    site {
      siteMetadata {
        profile {
          email
          github
        }
      }
    }
  }
`;
const container = primaryColor => css`
  margin: 3rem 0;
  padding: 10px;
  padding-right: 30px;
  border-right: 5px solid ${primaryColor};
  text-align: right;
`;
const text = css`
  font-size: 16px;
  margin: 0;
`;
const link = css`
  font-size: 16px;
  margin-right: 10px;

  &:hover {
    text-decoration: underline;
  }
`;
const Profile = () => {
  const { theme } = useTheme();

  return (
    <StaticQuery
      query={query}
      render={data => {
        const { email, github } = data.site.siteMetadata.profile;
        return (
          <div css={container(theme.primaryColor)}>
            <span>Godsenal</span>
            <p css={text}>
              안녕하세요. 개발 공부 중인 학생입니다.
              <br />
              개발하고 공부하며 배우는 내용들을 정리하고 있습니다.
              <br />
              의견, 조언 감사합니다.
            </p>
            <a css={link} href={email}>
              » Mail
            </a>
            <a css={link} href={github}>
              » Github
            </a>
          </div>
        );
      }}
    />
  );
};

export default Profile;
