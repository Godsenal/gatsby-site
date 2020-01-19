import React from 'react';
import { graphql } from 'gatsby';
import { css } from '@emotion/core';
import { HEAD, CustomLink, Title, Layout, PostList } from '../components';

const action = css`
  width: 100%;
  display: flex;
  justify-content: center;

  margin-bottom: 5rem;

  & a:last-child {
    margin-left: 10px;
  }
`;

const Template = ({ data, pageContext, location }) => {
  const { edges } = data.allMarkdownRemark;
  const { previous, next } = pageContext;
  return (
    <Layout>
      <HEAD pathname={location.pathname} />
      <Title h2="Blog" />
      <PostList edges={edges} />
      <div css={action}>
        {previous && <CustomLink to={previous}>이전</CustomLink>}
        {next && <CustomLink to={next}>다음</CustomLink>}
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
          excerpt(truncate: true)
          timeToRead
          frontmatter {
            title
            date
            banner
            tags
            categories
          }
        }
      }
    }
  }
`;
