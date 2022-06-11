import React from 'react';
import { graphql } from 'gatsby';
import { Title, Layout, PostList } from '../components';

const Template = ({ data, pageContext }) => {
  const { edges } = data.allMarkdownRemark;
  const { category } = pageContext;
  return (
    <Layout>
      <Title h2={`category: ${category}`} />
      <PostList edges={edges} simple />
    </Layout>
  );
};

export default Template;

export const query = graphql`
  query postCategoryList($category: String!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { frontmatter: { categories: { eq: $category } } }
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
            tags
            categories
          }
        }
      }
    }
  }
`;
