import React from "react";
import { graphql } from "gatsby";
import { Layout, Title, Categories } from "../components";

export default ({ data, pageContext }) => {
  const { categories } = pageContext;
  const categoriesCount = {};
  data.allMarkdownRemark.edges.forEach(post => {
    const currCategories = post.node.frontmatter.categories;
    currCategories &&
      currCategories.forEach(category =>
        categoriesCount[category]
          ? ++categoriesCount[category]
          : (categoriesCount[category] = 1)
      );
  });
  return (
    <Layout>
      <Title h2="Categories" />
      <Categories categories={categories} categoriesCount={categoriesCount} />
    </Layout>
  );
};

export const query = graphql`
  query($categories: [String]) {
    allMarkdownRemark(
      limit: 1000
      filter: { frontmatter: { categories: { in: $categories } } }
    ) {
      totalCount
      edges {
        node {
          frontmatter {
            title
            categories
          }
        }
      }
    }
  }
`;
