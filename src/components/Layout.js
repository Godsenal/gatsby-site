import React from 'react';
import { css } from '@emotion/react';
import { Header } from '.';
import { layoutWidth } from '../styles/common';

const main = css`
  width: 100%;
`;
const header = css`
  width: 100%;
`;
const body = css`
  position: relative;

  margin: auto;
  margin-top: 5%;
  padding-bottom: 2rem;

  ${layoutWidth}
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
