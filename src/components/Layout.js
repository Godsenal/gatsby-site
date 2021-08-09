import React from 'react';
import { css } from '@emotion/react';
import { screen } from '../constants';
import { Header } from '.';

const main = css`
  width: 100%;
`;
const header = css`
  width: 100%;
`;
const body = css`
  position: relative;
  width: 40%;
  min-width: ${screen.small}px;
  margin: auto;
  margin-top: 5%;
  padding-bottom: 2rem;
  @media screen and (max-width: ${screen.small}px) {
    width: 90%;
    min-width: 0px;
  }
  font-size: 1rem;
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
