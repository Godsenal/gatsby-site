import React from 'react';
import { css } from '@emotion/react';

const header = css`
  position: relative;
  word-break: keep-all;
`;
const subHeader = css`
  display: inline-block;
  background: var(--primary);
  color: var(--bg);
  padding: 5px 10px;
`;
const Title = ({ h1, h2, body, children }) => {
  return (
    <div css={header}>
      {h1 && <h1>{h1}</h1>}
      {h2 && (
        <h2 css={subHeader}>
          <span>{h2}</span>
        </h2>
      )}
      {body && <p>{body}</p>}
      {children}
    </div>
  );
};

export default Title;
