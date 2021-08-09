import React from 'react';
import { css } from '@emotion/react';
import { screen } from '../constants';

const content = css`
  margin-top: 2rem;
  font-size: 1.05rem;
  @media screen and (max-width: ${screen.small}) {
    font-size: 0.9rem;
  }
`;

const Content = ({ children, ...props }) => (
  <div css={content} {...props}>
    {children}
  </div>
);

export default Content;
