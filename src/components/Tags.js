import React from "react";
import { css } from "@emotion/core";
import { CustomLink } from ".";

const tagItem = css`
  display: inline-block;
  box-sizing: border-box;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
`;

const Tags = ({ tags, tagsCount, ...props }) => (
  <>
    {tags &&
      tags.map(tag => (
        <CustomLink key={tag} css={tagItem} to={`/tags/${tag}`} {...props}>
          <span role="img">🔖</span> {tag} {tagsCount && tagsCount[tag]}
        </CustomLink>
      ))}
  </>
);

export default Tags;
