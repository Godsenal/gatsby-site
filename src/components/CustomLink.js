import React from 'react';
import { Link } from 'gatsby';
import { css } from '@emotion/react';

const link = css`
  text-decoration: none;
`;

const CustomLink = ({ children, ...props }) => (
  <Link css={link} {...props}>
    {children}
  </Link>
);

export default CustomLink;
