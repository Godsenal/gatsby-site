import React from "react";
import { css } from "@emotion/core";

const container = css`
  flex-basis: 30%;
  min-width: 300px;
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.5);
  padding: 1rem;
  margin: 1rem auto;
  height: 100%;
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 3px 40px rgba(0, 0, 0, 0.5);
    transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
  }
  a {
    color: #fac351;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const header = css`
  padding: 0;
`;
const paragrapth = css`
  min-height: 100px;
`;
const info = css`
  font-size: 16px;
  margin: 20px 0;
  text-align: right;
`;
const Project = ({ title, description, date, website, git, stacks }) => (
  <div css={container} href={website}>
    <h4 css={header}>{title}</h4>
    <p css={paragrapth}>{description}</p>
    <div css={info}>
      {stacks && (
        <div>
          {stacks.map((stack, i) => (
            <span key={stack}>
              {stack}
              {i !== stacks.length - 1 && ", "}
            </span>
          ))}
        </div>
      )}
      {website && <a href={website}>» website </a>}
      {git && <a href={git}>» github</a>}
      <div>
        <span>{date}</span>
      </div>
    </div>
  </div>
);

export default Project;
