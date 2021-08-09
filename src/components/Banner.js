import React from 'react';
import { css } from '@emotion/react';

const bannerBox = (banner) => css`
  background-image: url(${banner});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50%;
  height: 20em;
  margin: 2rem 0;
`;

const Banner = ({ banner }) => <div css={bannerBox(banner)} />;

export default Banner;
