import React from "react";
import { css } from "@emotion/core";

const header = css`
  text-align: center;
  margin-bottom: 3rem;

  word-break: keep-all;
`;

const Title = ({ h1, h2, body, children }) => (
  <div css={header}>
    {h1 && <h1>{h1}</h1>}
    {h2 && <h2>{h2}</h2>}
    {body && <p>{body}</p>}
    {children}
  </div>
);

export default Title;
