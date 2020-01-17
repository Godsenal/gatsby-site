import React from "react";
import { css } from "@emotion/core";
import {
  Avatar,
  CustomLink,
  HEAD,
  Title,
  Layout,
  PostList
  // ProjectList
} from "../components";
import { screen } from "../constants";

const mainTitle = css`
  margin-bottom: 100px;
`;
const avatarImg = css`
  float: right;
  @media screen and (max-width: ${screen.small}px) {
    width: 64px;
    height: 64px;
    float: initial;
  }
`;
const linkContainer = css`
  width: 100%;
  margin: 2rem 0;
  text-align: center;
`;

export default ({ data }) => {
  const { edges: postEdges } = data.posts;
  // const { edges: projectEdges } = data.projects;
  return (
    <Layout>
      <HEAD />
      <Avatar css={avatarImg} />
      <div css={mainTitle}>
        <h1>Godsenal's site</h1>
        <p>
          안녕하세요. 이태희입니다. <br />
          공부하며 배우는 것들을 작성 중입니다.
        </p>
      </div>
      <CustomLink to="/blog">
        <Title h2="Blogs" />
      </CustomLink>
      <PostList edges={postEdges} />
      <div css={linkContainer}>
        <CustomLink to="/blog">» 모든 글 보기</CustomLink>
      </div>

      {/* <CustomLink to="/project">
        <Title h2="Projects" />
      </CustomLink>
      <ProjectList edges={projectEdges} />
      <div css={linkContainer}>
        <CustomLink to="/project">» Read more on projects</CustomLink>
      </div> */}
    </Layout>
  );
};

export const query = graphql`
  query {
    posts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 5
    ) {
      edges {
        node {
          excerpt(truncate: true)
          timeToRead
          fields {
            slug
          }
          frontmatter {
            title
            date
          }
        }
      }
    }
  }
`;
// project 잠시 제외
// projects: allProjectsJson(sort: { order: DESC, fields: date }, limit: 9) {
//   edges {
//     node {
//       title
//       description
//       date
//       website
//       git
//       stacks
//     }
//   }
// }
