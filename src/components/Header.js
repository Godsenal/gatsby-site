import React from "react";
import { css } from "@emotion/core";
import { graphql, StaticQuery, Link } from "gatsby";

const header = css`
  padding: 10px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
`;
const logo = css`
  flex: 0;
  cursor: pointer;
  h5 {
    margin: 0;
  }
`;
const menu = css`
  flex: 1;
  text-align: right;
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
const Header = () => {
  return (
    <StaticQuery
      query={query}
      render={data => {
        const { siteMetadata } = data.site;
        const { title } = siteMetadata;

        return (
          <div css={header}>
            <div css={logo}>
              <Link to="/" css={link}>
                {title}
              </Link>
            </div>
            <div css={menu}>
              <Link to="/blog" css={link}>
                Blog
              </Link>
              <Link to="/project" css={link}>
                Project
              </Link>
              <Link to="/tags" css={link}>
                Tags
              </Link>
              <Link to="/about" css={link}>
                About
              </Link>
            </div>
          </div>
        );
      }}
    />
  );
};

export default Header;
