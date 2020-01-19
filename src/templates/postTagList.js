import React from 'react';
import { graphql } from 'gatsby';
import { Title, Layout, PostList } from '../components';

const Template = ({ data, pageContext }) => {
  const { edges } = data.allMarkdownRemark;
  const { tag } = pageContext;
  return (
    <Layout>
      <Title h2={`tag: ${tag}`} />
      <PostList edges={edges} simple />
    </Layout>
  );
};

export default Template;

export const query = graphql`
  query postTagList($tag: String!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { frontmatter: { tags: { eq: $tag } } }
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
