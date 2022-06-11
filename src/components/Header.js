import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { graphql, StaticQuery } from 'gatsby';
import { MdSearch, MdLightMode, MdDarkMode, MdMoreVert, MdClose } from 'react-icons/md';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useMedia } from 'react-use';
import { screen, HEADER_HEIGHT } from '../constants';
import useEventListener from '../hooks/useEventListener';
import { CustomLink, Search, Blind, ThemeToggler } from '.';

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

  padding: 0px 10px;
`;

const themeIcon = css`
  ${icon}

  .dark-inline-block {
    display: none;
  }
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
  list-style: none;
  padding: 0;
  margin: 0;

  & + & {
    margin-top: 10px;
  }
`;

const dimmed = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(2px);
  z-index: 100;
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
  const [openSearch, setOpenSearch] = useState(false);
  const [overHeight, setOverHeight] = useState(false);
  const [fixHeader, setFixHeader] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const prevScroll = useRef();
  const $moreMenu = useRef();
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);
  const isPc = useMedia(`(min-width: ${screen.small}px)`, false);
  const [isMounted, setIsMounted] = useState(false);

  const handleClick = (e) => {
    if (showMoreMenu && !$moreMenu.current?.contains(e.target)) {
      setShowMoreMenu(false);
    }
  };

  const handleScroll = () => {
    const isOverHeight = window.scrollY > HEADER_HEIGHT;
    setOverHeight(isOverHeight);
    setFixHeader(prevScroll.current > window.scrollY);
    prevScroll.current = window.scrollY;
  };

  useEventListener('scroll', handleScroll, { passive: true });
  useEventListener('click', handleClick);

  useEffect(() => {
    setIsMounted(true);
    handleScroll();
  }, []);

  useEffect(() => {
    if (showMoreMenu && $moreMenu.current) {
      const $target = $moreMenu.current;

      disableBodyScroll($target);

      return () => {
        enableBodyScroll($target);
      };
    }
  }, [showMoreMenu]);

  useEffect(() => {
    isPc && setShowMoreMenu(false);
  }, [isPc]);

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
                <Blind>검색</Blind>
                <MdSearch />
              </button>
              <ThemeToggler>
                {({ theme, toggleTheme }) => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  return (
                    <button css={themeIcon} onClick={() => toggleTheme(nextTheme)}>
                      {isMounted && <Blind>{nextTheme}로 변경</Blind>}
                      <MdLightMode className="dark-inline-block" />
                      <MdDarkMode className="dark-hidden" />
                    </button>
                  );
                }}
              </ThemeToggler>
              <div css={moreMenuWrapper}>
                <button
                  id="moremenu_button"
                  css={icon}
                  onClick={() => setShowMoreMenu(true)}
                  aria-haspopup={true}
                  aria-controls="navigation_moremenu"
                  aria-expanded={showMoreMenu}
                >
                  <Blind>네비게이션</Blind>
                  <MdMoreVert />
                </button>
                {showMoreMenu && (
                  <>
                    <div css={dimmed} />
                    <ul
                      id="navigation_moremenu"
                      css={moreMenu}
                      ref={$moreMenu}
                      aria-labelledby="moremenu_button"
                    >
                      <button css={moreMenuClose} onClick={() => setShowMoreMenu(false)}>
                        <Blind>닫기</Blind>
                        <MdClose />
                      </button>
                      {Menus.map(({ label, to }, i) => (
                        <li key={to} css={moreMenuItem}>
                          <CustomLink role="menuitem" to={to} css={link}>
                            {label}
                          </CustomLink>
                        </li>
                      ))}
                    </ul>
                  </>
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
