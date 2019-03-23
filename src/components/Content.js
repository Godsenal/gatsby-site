import React from "react";
import { css } from "@emotion/core";

const content = css`
  margin-top: 2rem;
  font-size: 1.1rem;
  @media screen and (max-width: 992px) {
    font-size: 0.9rem;
  }
  a {
    color: #fac351;
    &:hover {
      text-decoration: underline;
    }
  }
  strong {
    color: blanchedalmond;
  }
`;

const Content = ({ children, ...props }) => (
  <div css={content} {...props}>
    {children}
  </div>
);

export default Content;
