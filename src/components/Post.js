import React from 'react';
import { css } from '@emotion/react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { PostInfo, CustomLink } from '.';

const post = css`
  display: block;
  box-sizing: border-box;
  border: none;
  margin-bottom: 3rem;
  min-height: 120px;
  text-decoration: none;
  outline: none;
`;
const excerptText = css`
  font-size: 0.9rem;
`;
// -webkit-backface-visibility: hidden;  to handle flickering on hover
const info = css``;

const Post = ({ frontmatter, fields, excerpt, timeToRead }) => {
  const { slug } = fields;
  const { title, date, banner, tags } = frontmatter;
  const image = getImage(banner);

  return (
    <div css={post}>
      {image && <GatsbyImage image={image} alt={title} />}
      <h3>
        <CustomLink to={slug}>{title}</CustomLink>
      </h3>
      <div css={excerptText} dangerouslySetInnerHTML={{ __html: excerpt }} />
      <div css={info}>
        <PostInfo date={date} timeToRead={timeToRead} tags={tags} />
      </div>
    </div>
  );
};

export default Post;
