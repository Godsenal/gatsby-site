import React from "react";
import { css } from "@emotion/core";

const header = css`
  text-align: center;
  margin-bottom: 5rem;

  word-break: keep-all;
`;

const header1 = css`
  color: #fefefe;
`;
const Title = ({ h1, h2, body, children }) => (
  <div css={header}>
    {h1 && <h1 css={header1}>{h1}</h1>}
    {h2 && <h2 css={header1}>{h2}</h2>}
    {body && <p>{body}</p>}
    {children}
  </div>
);

export default Title;
