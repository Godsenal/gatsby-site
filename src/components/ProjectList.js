import React from "react";
import { css } from "@emotion/core";
import { Project } from ".";

const projectList = css`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const ProjectList = ({ edges }) => (
  <div css={projectList}>
    {edges.map(edge => {
      return <Project key={edge.node.title} {...edge.node} />;
    })}
  </div>
);

export default ProjectList;
