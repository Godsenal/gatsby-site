const { css } = require('@emotion/react');
const { screen } = require('../constants');

export const layoutWidth = css`
  width: 40%;
  min-width: ${screen.small}px;
  @media screen and (max-width: ${screen.small}px) {
    width: 90%;
    min-width: 0px;
  }
`;
