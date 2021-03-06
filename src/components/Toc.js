import React, { useEffect, useState } from 'react';
import { css } from '@emotion/core';
import { HEADER_HEIGHT, screen } from '../constants';
import useEventListener from '../hooks/useEventListener';

const wrapper = css`
  @media screen and (max-width: ${screen.medium}px) {
    display: none;
  }
  position: absolute;
  top: 110px;
  left: 110%;
`;
const toc = (scrolled) => css`
  ${scrolled &&
  `
    position: fixed;
    top: ${HEADER_HEIGHT + 50}px;  
  `}
  width: 220px;
  font-size: 0.8rem;
  ul,
  li {
    list-style-type: none;
  }
`;

const SCROLL_Y = 150;

const Toc = ({ tableOfContents }) => {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
    setScrolled(window.scrollY > SCROLL_Y);
  };
  useEventListener('scroll', handleScroll, { passive: true });

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <div css={wrapper}>
      <div css={toc(scrolled)} dangerouslySetInnerHTML={{ __html: tableOfContents }} />
    </div>
  );
};

export default Toc;
