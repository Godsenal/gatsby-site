import React from "react";
import { css } from "@emotion/core";
import { useTheme } from "../theme";

const header = css`
  position: relative;
  word-break: keep-all;
`;
const subHeader = theme => css`
  display: inline-block;
  background: ${theme.primaryColor};
  color: ${theme.background};
  padding: 5px 10px;
`;
const Title = ({ h1, h2, body, children }) => {
  const { theme } = useTheme();
  return (
    <div css={header}>
      {h1 && <h1>{h1}</h1>}
      {h2 && (
        <h2 css={subHeader(theme)}>
          <span>{h2}</span>
        </h2>
      )}
      {body && <p>{body}</p>}
      {children}
    </div>
  );
};

export default Title;
