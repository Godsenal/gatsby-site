import React from "react";
import { graphql } from "gatsby";
import { css } from "@emotion/core";
import {
  CustomLink,
  Title,
  Layout,
  PostList,
  ProjectList
} from "../components";
import "../styles/global.css";

const linkContainer = css`
  width: 100%;
  margin: 2rem 0;
  text-align: center;
`;
const link = css`
  color: #fac351;
`;
export default ({ data }) => {
  const { edges: postEdges } = data.posts;
  const { edges: projectEdges } = data.projects;
  return (
    <Layout>
      <Title h1="Godsenal's site" body="Welcome!" />
      <CustomLink to="/blog">
        <Title h2="Blogs" />
      </CustomLink>
      <PostList edges={postEdges} />
      <div css={linkContainer}>
        <CustomLink css={link} to="/blog">
          » Read more on blog posts
        </CustomLink>
      </div>
      <CustomLink to="/project">
        <Title h2="Projects" />
      </CustomLink>
      <ProjectList edges={projectEdges} />
      <div css={linkContainer}>
        <CustomLink css={link} to="/project">
          » Read more on projects
        </CustomLink>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query {
    posts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 3
    ) {
      edges {
        node {
          excerpt
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
    projects: allProjectsJson(sort: { order: DESC, fields: date }, limit: 9) {
      edges {
        node {
          title
          description
          date
          website
          git
          stacks
        }
      }
    }
  }
`;
