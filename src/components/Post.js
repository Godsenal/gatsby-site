import React from "react";
import { Link } from "gatsby";
import { css } from "@emotion/core";
import { Banner, PostInfo } from ".";

const post = css`
  display: block;
  box-sizing: border-box;
  border: none;
  margin-bottom: 3rem;
  min-height: 120px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  -webkit-backface-visibility: hidden;
  text-decoration: none;
  outline: none;
  &:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
  }
`;
const excerptText = css`
  font-size: 18px;
`;
// -webkit-backface-visibility: hidden;  to handle flickering on hover
const info = css`
  margin-top: 2rem;
  color: #fefefe;
  text-align: right;
`;

const Post = ({ frontmatter, fields, excerpt, timeToRead }) => {
  const { slug } = fields;
  const { title, date, banner } = frontmatter;
  return (
    <Link css={post} to={slug}>
      {banner && <Banner banner={banner} />}
      <h5>{title}</h5>
      <div css={excerptText} dangerouslySetInnerHTML={{ __html: excerpt }} />
      <div css={info}>
        <PostInfo date={date} timeToRead={timeToRead} />
      </div>
    </Link>
  );
};

export default Post;
