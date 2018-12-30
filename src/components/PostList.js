import React from "react";
import { css } from "@emotion/core";
import { Post } from ".";

const postList = css`
  width: 100%;
`;

const PostList = ({ edges }) => (
  <div css={postList}>
    {edges.map(edge => {
      return <Post key={edge.node.fields.slug} {...edge.node} />;
    })}
  </div>
);

export default PostList;
