import React from "react";
import { Link } from "gatsby";
import { css } from "@emotion/core";

const link = css`
  margin-right: 10px;
  transition: opacity 0.3s ease-in-out;
  -webkit-backface-visibility: hidden;
  &:hover {
    opacity: 0.7;
    transition: opacity 0.3s ease-in-out;
  }
`;

export default ({ children, ...props }) => (
  <Link css={link} {...props}>
    {children}
  </Link>
);
