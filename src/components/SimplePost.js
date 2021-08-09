import React from 'react';
import { css } from '@emotion/react';
import { CustomLink } from '.';

const container = css`
  width: 100%;
  display: flex;
  align-items: center;
`;

const dateWrapper = css`
  flex-basis: 40%;
`;
const titleWrapper = css`
  flex: 1;
`;

const SimplePost = ({ frontmatter, fields }) => {
  const { title, date } = frontmatter;
  const { slug } = fields;

  return (
    <CustomLink to={slug}>
      <div css={container}>
        <div css={dateWrapper}>{date}</div>
        <div css={titleWrapper}>{title}</div>
      </div>
    </CustomLink>
  );
};

export default SimplePost;
