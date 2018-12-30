import React from "react";
import { css } from "@emotion/core";
import { Tags } from ".";
const info = css`
  font-size: 0.7em;
  text-align: right;
  color: #fefefe;
  margin-bottom: 0.5rem;
`;
const tagList = css`
  margin-right: 0;
`;
const PostInfo = ({ timeToRead, date, tags }) => (
  <>
    {tags && (
      <h5 css={info}>
        <Tags tags={tags} css={tagList} />
      </h5>
    )}
    <h5 css={info}>⌛{timeToRead} min read</h5>
    <h5 css={info}>» {date}</h5>
  </>
);

export default PostInfo;
