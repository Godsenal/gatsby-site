import React from 'react';
import { css } from '@emotion/react';

const container = css`
  box-sizing: border-box;
  padding: 1rem;
  text-align: center;
`;

const header = css`
  padding: 0;
`;
const paragrapth = css`
  min-height: 100px;
  font-size: 0.9rem;
`;
const info = css`
  font-size: 0.8rem;
`;
const Project = ({ title, description, date, website, git, stacks }) => (
  <div css={container} href={website}>
    <h3 css={header}>{title}</h3>
    <p css={paragrapth}>{description}</p>
    <div css={info}>
      {stacks && (
        <div>
          {stacks.map((stack, i) => (
            <span key={stack}>
              {stack}
              {i !== stacks.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}
      {website && <a href={website}>website</a>}
      {git && <a href={git}> | github</a>}
      <div>
        <span>{date}</span>
      </div>
    </div>
  </div>
);

export default Project;
