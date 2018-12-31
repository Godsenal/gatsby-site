import React from "react";
import { css } from "@emotion/core";
import { screen } from "../constants";
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
  padding-bottom: 3rem;
  @media screen and (max-width: ${screen.small}px) {
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
