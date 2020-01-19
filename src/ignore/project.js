import React from 'react';
import { HEAD, Title, Layout, ProjectList } from '../components';

export default ({ data, location }) => {
  const { edges } = data.allProjectsJson;
  return (
    <Layout>
      <HEAD pathname={location.pathname} />
      <Title h2="Project" />
      <ProjectList edges={edges} />
    </Layout>
  );
};

/* Project markdown file은 frontmatter에 type: "project" 표시할 것! */

// export const query = graphql`
//   query {
//     allProjectsJson(sort: { order: DESC, fields: date }) {
//       edges {
//         node {
//           title
//           description
//           date
//           website
//           git
//           stacks
//         }
//       }
//     }
//   }
// `;
