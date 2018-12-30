import React from "react";
import { css } from "@emotion/core";
import { Header } from ".";

const main = css`
  width: 100%;
`;
const header = css`
  width: 100%;
`;
const body = css`
  width: 54%;
  margin: auto;
  margin-top: 5%;

  @media screen and (max-width: 760px) {
    width: 95%;
  }

  font-size: 18px;
`;

const Layout = ({ children }) => (
  <div css={main}>
    <div css={header}>
      <Header />
    </div>
    <div css={body}>{children}</div>
  </div>
);

export default Layout;
