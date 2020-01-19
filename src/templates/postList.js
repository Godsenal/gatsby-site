import React from 'react';
import { graphql, navigate } from 'gatsby';
import { HEAD, Title, Layout, PostList, Pagination } from '../components';

const Template = ({ data, pageContext, location }) => {
  const { edges } = data.allMarkdownRemark;
  const { currentPage, totalPage } = pageContext;
  const handlePageChange = page => {
    navigate(`/blog/${page}`);
  };
  return (
    <Layout>
      <HEAD pathname={location.pathname} />
      <Title h2="Blog" />
      <PostList edges={edges} />
      <Pagination totalPage={totalPage} currentPage={currentPage} onPageChange={handlePageChange} />
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
