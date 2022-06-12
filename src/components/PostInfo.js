import React from 'react';
import { css } from '@emotion/react';
import { Tags } from '.';
const info = css`
  font-size: 0.8rem;
`;
const tagList = css`
  margin-right: 0;
`;
const PostInfo = ({ timeToRead, date, tags }) => (
  <div>
    {tags && (
      <div css={info}>
        <Tags tags={tags} css={tagList} />
      </div>
    )}
    <div>
      <span css={info}>{date}</span>
      {` · `}
      <span css={info}>{timeToRead} 분</span>
    </div>
  </div>
);

export default PostInfo;
