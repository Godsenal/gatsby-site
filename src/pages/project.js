import React from "react";
import { graphql } from "gatsby";
import { Title, Layout, ProjectList } from "../components";

export default ({ data }) => {
  const { edges } = data.allProjectsJson;
  return (
    <Layout>
      <Title h1="Project" />
      <ProjectList edges={edges} />
    </Layout>
  );
};

/* Project markdown file은 frontmatter에 type: "project" 표시할 것! */

export const query = graphql`
  query {
    allProjectsJson(sort: { order: DESC, fields: date }) {
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
