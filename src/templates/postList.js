import React from "react";
import { graphql } from "gatsby";
import { css } from "@emotion/core";
import { CustomLink, Title, Layout, PostList } from "../components";

const action = css`
  width: 100%;
  display: flex;
  justify-content: center;

  margin-bottom: 5rem;
`;

const Template = ({ data, pageContext }) => {
  const { edges } = data.allMarkdownRemark;
  const { previous, next } = pageContext;
  return (
    <Layout>
      <Title h1="Blog" />
      <PostList edges={edges} />
      <div css={action}>
        {previous && <CustomLink to={previous}>Previous</CustomLink>}
        {next && <CustomLink to={next}>Next</CustomLink>}
      </div>
    </Layout>
  );
};

export default Template;

export const query = graphql`
  query postListQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
            date
            banner
          }
        }
      }
    }
  }
`;
