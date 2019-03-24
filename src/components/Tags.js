import React from "react";
import { css } from "@emotion/core";
import { CustomLink } from ".";

const container = css`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  text-align: left;
  justify-content: flex-end;
`;
const tagItem = css`
  box-sizing: border-box;
  margin: 10px;
  padding: 5px;
  border-radius: 5px;
  background-color: #838383;
`;

const Tags = ({ tags, tagsCount, ...props }) => (
  <div css={container}>
    {tags &&
      tags.map(tag => (
        <CustomLink key={tag} css={tagItem} to={`/tags/${tag}`} {...props}>
          # {tag} {tagsCount && tagsCount[tag]}
        </CustomLink>
      ))}
  </div>
);

export default Tags;
