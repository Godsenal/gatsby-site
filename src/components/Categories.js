import React from "react";
import { css } from "@emotion/core";
import { CustomLink } from ".";

const categoryItem = css`
  box-sizing: border-box;
  margin: 10px;
  padding: 30px 10px;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;

  display: flex;
  align-items: center;
`;
const categoryTitle = css`
  flex-basis: 200px;
  margin-left: 20px;
`;
const categorySub = css`
  text-align: right;
  flex: 1 1;
`;
const Categories = ({ categories, categoriesCount, ...props }) => (
  <>
    {categories &&
      categories.map(category => (
        <CustomLink
          key={category}
          css={categoryItem}
          to={`/categories/${category}`}
          {...props}
        >
          <div css={categoryTitle}>
            <span role="img">🔲 {category}</span>
          </div>
          <div css={categorySub}>
            {categoriesCount && categoriesCount[category]}
          </div>
        </CustomLink>
      ))}
  </>
);

export default Categories;
