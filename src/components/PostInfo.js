import React from "react";
import { css } from "@emotion/core";
import { Tags } from ".";
const info = css`
  font-size: 0.8rem;
  text-align: right;
  color: #fefefe;
`;
const tagList = css`
  margin-right: 0;
`;
const PostInfo = ({ timeToRead, date, tags }) => (
  <>
    {tags && (
      <div css={info}>
        <Tags tags={tags} css={tagList} />
      </div>
    )}
    <div css={info}>⌛{timeToRead} min read</div>
    <div css={info}>» {date}</div>
  </>
);

export default PostInfo;
