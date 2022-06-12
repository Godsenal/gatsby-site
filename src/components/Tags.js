import React from 'react';
import { css } from '@emotion/react';
import { CustomLink } from '.';

const container = css`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  text-align: left;
`;
const tagItem = css`
  box-sizing: border-box;
  border: 1px solid var(--stroke);
  background-color: var(--bg-mid);
  padding: 0.125rem 0.25rem;
  margin: 5px 10px 5px 0px;
  margin-right: 10px !important;
  font-weight: 500;
`;

const Tags = ({ tags, tagsCount, ...props }) => (
  <div css={container}>
    {tags &&
      tags.map((tag) => (
        <CustomLink key={tag} css={tagItem} to={`/tags/${tag}`} {...props}>
          # {tag} {tagsCount && tagsCount[tag]}
        </CustomLink>
      ))}
  </div>
);

export default Tags;
