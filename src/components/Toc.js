import React, { useEffect, useState } from 'react';
import { css } from '@emotion/core';
import { screen } from '../constants';

const wrapper = css`
  @media screen and (max-width: ${screen.medium}px) {
    display: none;
  }
  position: absolute;
  top: 0px;
  left: 110%;
`
const toc = (scrolled) => css`
  ${scrolled && `
    position: fixed;
    top: 40px;  
  `}
  width: 220px;
  font-size: 0.8rem;
  ul, li {
    list-style-type: none;
  }
`

const SCROLL_Y = 110;

const Toc = ({ tableOfContents }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setScrolled(window.scrollY > SCROLL_Y);
    }
    window.addEventListener('scroll', checkScroll, {passive: true});

    return () => {
      window.removeEventListener('scroll', checkScroll);
    }
  }, []);

  return (
    <div css={wrapper}>
      <div css={toc(scrolled)} dangerouslySetInnerHTML={{__html: tableOfContents}} />
    </div>
  );
};

export default Toc;
