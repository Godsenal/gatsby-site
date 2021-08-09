import React from 'react';
import { Link } from 'gatsby';
import { css } from '@emotion/react';

const link = css`
  text-decoration: none;
`;

export default ({ children, ...props }) => (
  <Link css={link} {...props}>
    {children}
  </Link>
);
