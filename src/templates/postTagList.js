import React from "react";
import { graphql } from "gatsby";
import { Title, Layout, PostList } from "../components";

const Template = ({ data, pageContext }) => {
  const { edges } = data.allMarkdownRemark;
  const { tag } = pageContext;
  return (
    <Layout>
      <Title h1="Blog" body={`tag: ${tag}`} />
      <PostList edges={edges} />
    </Layout>
  );
};

export default Template;

export const query = graphql`
  query postTagList($tag: String!) {
    allMarkdownRemark(filter: { frontmatter: { tags: { eq: $tag } } }) {
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
            tags
          }
        }
      }
    }
  }
`;
