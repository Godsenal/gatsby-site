import React from 'react';
import { css } from '@emotion/react';
import { Post, SimplePost } from '.';

const postList = css`
  width: 100%;
`;

const PostList = ({ simple = false, edges }) => {
  const PostListItem = simple ? SimplePost : Post;

  return (
    <div css={postList}>
      {edges.map((edge) => {
        return <PostListItem key={edge.node.fields.slug} {...edge.node} />;
      })}
    </div>
  );
};

export default PostList;
