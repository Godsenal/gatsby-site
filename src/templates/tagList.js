import React from 'react';
import { graphql } from 'gatsby';
import { Layout, Title, Tags } from '../components';

const TagList = ({ data, pageContext }) => {
  const { tags } = pageContext;
  const tagsCount = {};
  data.allMarkdownRemark.edges.forEach((post) => {
    const currTags = post.node.frontmatter.tags;
    currTags &&
      currTags.forEach((tag) => (tagsCount[tag] ? ++tagsCount[tag] : (tagsCount[tag] = 1)));
  });
  return (
    <Layout>
      <Title h2="Tags" />
      <Tags tags={tags} tagsCount={tagsCount} />
    </Layout>
  );
};

export const query = graphql`
  query ($tags: [String]) {
    allMarkdownRemark(limit: 1000, filter: { frontmatter: { tags: { in: $tags } } }) {
      totalCount
      edges {
        node {
          frontmatter {
            title
            tags
          }
        }
      }
    }
  }
`;

export default TagList;
