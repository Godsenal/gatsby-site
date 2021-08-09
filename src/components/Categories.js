import React from 'react';
import { css } from '@emotion/react';
import { CustomLink } from '.';

const categoryItem = css`
  text-align: center;
  padding: 20px;
  margin: 10px;
  h1 {
    margin: 0;
    padding: 0;
  }
`;
const Categories = ({ categories, categoriesCount, ...props }) => (
  <>
    {categories &&
      categories.map((category) => (
        <div css={categoryItem}>
          <h1>
            <CustomLink key={category} to={`/categories/${category}`} {...props}>
              {category}
            </CustomLink>
          </h1>
          {categoriesCount && categoriesCount[category]}개의 글
        </div>
      ))}
  </>
);

export default Categories;
