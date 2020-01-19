import React, { Component } from "react";
import { css } from "@emotion/core";
import { graphql, StaticQuery } from "gatsby";
import { screen } from "../constants";
import { CustomLink, Search } from ".";

const header = css`
  width: 90%;
  margin: auto;
  padding: 20px 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
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
`;
const icon = css`
  border: none;
  outline: none;
  cursor: pointer;
`;
const link = css`
  margin-right: 20px;
`;
const headerOrFooter = css`
  @media screen and (max-width: ${screen.small}px) {
    position: fixed;
    width: 100%;
    height: 2rem;
    bottom: 0;
    left: 0;
    box-shadow: 0px -5px 20px rgba(0, 0, 0, 0.3);
    background-color: #fefefe;

    z-index: 99;

    display: flex;
    justify-content: space-around;
    align-items: center;

    font-size: 16px;

    a {
      margin-right: 0;
    }
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
class Header extends Component {
  state = {
    openSearch: false
  };
  handleOpenSearch = () => {
    this.setState({
      openSearch: true
    });
  };
  handleCloseSearch = () => {
    this.setState({
      openSearch: false
    });
  };
  renderLinks = () => (
    <>
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
    </>
  );
  render() {
    const { openSearch } = this.state;
    return (
      <StaticQuery
        query={query}
        render={data => {
          const { siteMetadata } = data.site;
          const { title } = siteMetadata;

          return (
            <div css={header}>
              <div css={logo}>
                <CustomLink to="/" css={link}>
                  {title}
                </CustomLink>
              </div>
              <div css={menu}>
                <div css={headerOrFooter}>{this.renderLinks()}</div>
                <div />
              </div>
              <button css={icon} onClick={this.handleOpenSearch}>
                <span role="img">🔍</span>
              </button>
              <Search open={openSearch} handleClose={this.handleCloseSearch} />
            </div>
          );
        }}
      />
    );
  }
}

export default Header;
