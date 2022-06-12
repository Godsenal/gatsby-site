import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { graphql, StaticQuery } from 'gatsby';
import { MdSearch, MdLightMode, MdDarkMode, MdMoreVert, MdClose } from 'react-icons/md';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { useMedia } from 'react-use';
import { screen, HEADER_HEIGHT } from '../constants';
import useEventListener from '../hooks/useEventListener';
import { CustomLink, Search, Blind, ThemeToggler } from '.';
import { layoutWidth } from '../styles/common';

const fixedHeader = (isScrollTop) => css`
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: var(--bg);
  ${!isScrollTop ? 'box-shadow: 0px -2px 10px rgb(0 0 0 / 15%);' : ''}
`;
const header = css`
  ${layoutWidth}
  height: ${HEADER_HEIGHT}px;
  margin: auto;
  padding: 20px 0;
  padding-top: 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
`;
const link = css`
  color: var(--text);
  margin-right: 20px;
`;
const logo = css`
  display: flex;
  margin: 0;

  a {
    color: var(--text);
  }
`;
const menu = css`
  flex: 1;
  font-weight: 700;
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
  color: var(--text);
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

const Menus = [
  {
    label: 'BLOG',
    to: '/blog',
  },
  {
    label: 'CATEGORIES',
    to: '/categories',
  },
  {
    label: 'TAGS',
    to: '/tags',
  },
  {
    label: 'ABOUT',
    to: '/about',
  },
];

const Header = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [isScrollTop, setIsScrollTop] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
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
    setIsScrollTop(window.scrollY <= 0);
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
          return (
            <div css={fixedHeader(isScrollTop)}>
              <div css={header}>
                <h2 css={logo}>
                  <CustomLink to="/" css={link}>
                    {data?.site?.siteMetadata?.title?.toUpperCase()}
                  </CustomLink>
                </h2>
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
            </div>
          );
        }}
      />
      {<div style={{ position: 'relative', height: HEADER_HEIGHT }} />}
    </>
  );
};

export default Header;
