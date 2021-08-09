import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { graphql, StaticQuery } from 'gatsby';
import { screen, HEADER_HEIGHT } from '../constants';
import useEventListener from '../hooks/useEventListener';
import { CustomLink, Search } from '.';

const header = css`
  width: 90%;
  height: ${HEADER_HEIGHT}px;
  margin: auto;
  padding: 20px 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  transition: margin-top 0.3s ease-in;
`;
const logo = css`
  flex: 0;
  font-size: 1.3rem;
  font-weight: 400;
  cursor: pointer;
  h5 {
    margin: 0;
  }
`;
const menu = css`
  flex: 1;
  text-align: right;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;

  @media screen and (min-width: ${screen.small}px) {
    justify-content: flex-end;
  }
`;
const icon = css`
  border: none;
  outline: none;
  cursor: pointer;
`;
const link = css`
  margin-right: 20px;
`;
const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

const fixedStyle = {
  position: 'fixed',
  width: '100%',
  top: 0,
  left: 0,
  padding: '0 5% 0 5%',
  zIndex: 10,
  backgroundColor: 'white',
  boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 8px',
};

const Header = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [overHeight, setOverHeight] = useState(false);
  const [fixHeader, setFixHeader] = useState(false);
  const prevScroll = useRef();
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);

  const handleScroll = () => {
    const isOverHeight = window.scrollY > HEADER_HEIGHT;
    setOverHeight(isOverHeight);
    setFixHeader(prevScroll.current > window.scrollY);
    prevScroll.current = window.scrollY;
  };

  useEventListener('scroll', handleScroll, { passive: true });

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <>
      <StaticQuery
        query={query}
        render={(data) => {
          const { siteMetadata } = data.site;
          const { title } = siteMetadata;

          return (
            <div
              css={header}
              style={
                overHeight
                  ? { ...fixedStyle, marginTop: fixHeader ? 0 : -HEADER_HEIGHT }
                  : undefined
              }
            >
              <div css={logo}>
                <CustomLink to="/" css={link}>
                  {title}
                </CustomLink>
              </div>
              <div css={menu}>
                <CustomLink to="/blog" css={link}>
                  Blog
                </CustomLink>
                {/* <CustomLink to="/project" css={link}>
                Project
              </CustomLink> */}
                <CustomLink to="/categories" css={link}>
                  Categories
                </CustomLink>
                <CustomLink to="/tags" css={link}>
                  Tags
                </CustomLink>
                <CustomLink to="/about" css={link}>
                  About
                </CustomLink>
              </div>
              <button css={icon} onClick={handleOpenSearch}>
                <span role="img" aria-label="search">
                  🔍
                </span>
              </button>
              <Search open={openSearch} handleClose={handleCloseSearch} />
            </div>
          );
        }}
      />
      {overHeight && <div style={{ ...fixedStyle, position: 'relative', height: HEADER_HEIGHT }} />}
    </>
  );
};

export default Header;
