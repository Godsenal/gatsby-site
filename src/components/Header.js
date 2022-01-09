import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { graphql, StaticQuery } from 'gatsby';
import { ThemeToggler } from 'gatsby-plugin-dark-mode';
import { MdSearch, MdLightMode, MdDarkMode, MdMoreVert, MdClose } from 'react-icons/md';
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

  svg {
    vertical-align: middle;
  }
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
  visibility: hidden;

  @media screen and (min-width: ${screen.small}px) {
    visibility: visible;
    justify-content: flex-end;
  }
`;
const icon = css`
  border: none;
  outline: none;
  cursor: pointer;
  vertical-align: middle;
`;
const link = css`
  margin-right: 20px;
`;

const moreMenuWrapper = css`
  position: relative;

  @media screen and (min-width: ${screen.small}px) {
    display: none;
  }
`;

const moreMenu = css`
  position: absolute;
  top: 0;
  right: 0;
  background: var(--secondary);
  padding: 10px 20px;
  z-index: 150;
  border-radius: 10px;
  box-shadow: inset 0 1px 0 0 rgb(255 255 255 / 5%);

  @media screen and (min-width: ${screen.small}px) {
    display: none;
  }
`;

const moreMenuClose = css`
  ${icon}

  position: absolute;
  top: 5px;
  right: 5px;
`;

const moreMenuItem = css`
  & + & {
    margin-top: 10px;
  }
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
  backgroundColor: 'var(--bg)',
  boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 8px',
};

const Menus = [
  {
    label: 'Blog',
    to: '/blog',
  },
  {
    label: 'Categories',
    to: '/categories',
  },
  {
    label: 'Tags',
    to: '/tags',
  },
  {
    label: 'About',
    to: '/about',
  },
];

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [overHeight, setOverHeight] = useState(false);
  const [fixHeader, setFixHeader] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const prevScroll = useRef();
  const $moreMenu = useRef();
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);

  const handleClick = (e) => {
    if (showMoreMenu && !$moreMenu.current?.contains(e.target)) {
      setShowMoreMenu(false);
    }
  };

  const handleScroll = () => {
    const isOverHeight = window.scrollY > HEADER_HEIGHT;
    setShowMoreMenu(false);
    setOverHeight(isOverHeight);
    setFixHeader(prevScroll.current > window.scrollY);
    prevScroll.current = window.scrollY;
  };

  useEventListener('scroll', handleScroll, { passive: true });
  useEventListener('click', handleClick);

  useEffect(() => {
    setMounted(true);
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
                {Menus.map(({ label, to }) => (
                  <CustomLink key={to} to={to} css={link}>
                    {label}
                  </CustomLink>
                ))}
              </div>
              <button css={icon} onClick={handleOpenSearch}>
                <MdSearch />
              </button>
              {mounted && (
                <ThemeToggler>
                  {({ theme, toggleTheme }) => (
                    <button
                      css={icon}
                      onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
                    </button>
                  )}
                </ThemeToggler>
              )}
              <div css={moreMenuWrapper}>
                <button css={icon} onClick={() => setShowMoreMenu(true)}>
                  <MdMoreVert />
                </button>
                {showMoreMenu && (
                  <div css={moreMenu} ref={$moreMenu}>
                    <button css={moreMenuClose} onClick={() => setShowMoreMenu(false)}>
                      <MdClose />
                    </button>
                    {Menus.map(({ label, to }, i) => (
                      <div key={to} css={moreMenuItem}>
                        <CustomLink to={to} css={link}>
                          {label}
                        </CustomLink>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
