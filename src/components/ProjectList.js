import React from "react";
import { css } from "@emotion/core";
import { Project } from ".";

const container = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, 240px);
  gap: 15px;
`;

const item = css``;

const ProjectList = ({ edges }) => {
  return (
    <div css={container}>
      {edges.map((edge, i) => {
        return (
          <div css={item}>
            <Project key={edge.node.title} {...edge.node} />
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;
