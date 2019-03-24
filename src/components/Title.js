import React from "react";
import { css } from "@emotion/core";

const header = css`
  position: relative;
  word-break: keep-all;
`;
const mainHeader = css`
  color: #fefefe;
`;
const subHeader = css`
  color: white;
  padding: 5px 0;
  text-align: center;
`;
const Title = ({ h1, h2, body, children }) => (
  <div css={header}>
    {h1 && <h1 css={mainHeader}>{h1}</h1>}
    {h2 && (
      <h2 css={subHeader}>
        <span>{h2}</span>
      </h2>
    )}
    {body && <p>{body}</p>}
    {children}
  </div>
);

export default Title;
