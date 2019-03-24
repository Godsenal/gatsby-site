import React from "react";
import { graphql } from "gatsby";
import { Avatar, HEAD, Title, Layout, Profile, Content } from "../components";

export default ({ data, location }) => {
  const { repository } = data.site.siteMetadata;
  return (
    <Layout>
      <HEAD pathname={location.pathname} />
      <Title h2="About" />
      <Content>
        <p style={{ textAlign: "center" }}>
          안녕하세요. Godsenal 입니다.
          <br />
          열심히 공부하고 개발하며 얻는 것들을 이 사이트에 정리하고 있습니다.
          <br />
          주로 javasript, typescript, react, nodejs, graphql과 관련된
          내용들입니다.
          <br />이 사이트는 <a href="https://www.gatsbyjs.org/">Gatsby</a>를
          통해 만들었으며, 코드는 <a href={repository}>여기</a>서 보실 수
          있습니다.
        </p>
        <Profile />
      </Content>
    </Layout>
  );
};

export const query = graphql`
  {
    site {
      siteMetadata {
        title
        repository
      }
    }
  }
`;
