import React, { useMemo } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 100%;
  margin: 2.5rem 0;
  text-align: center;
`;

const Button = styled.button`
  cursor: pointer;
  font-size: 0.8rem;
  border: none;
  outline: none;
  padding: 5px 10px;
  border-radius: 0.25rem;
  margin-right: 5px;

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  ${(props) =>
    props.isPrev &&
    `
      &:before {
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-bottom;
        content: "";
        background-color: currentColor;
        clip-path: polygon(9.8px 12.8px, 8.7px 12.8px, 4.5px 8.5px, 4.5px 7.5px, 8.7px 3.2px, 9.8px 4.3px, 6.1px 8px, 9.8px 11.7px, 9.8px 12.8px);
      }
    `}

  ${(props) =>
    props.isAfter &&
    `
      &:after {
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-bottom;
        content: "";
        background-color: currentColor;
        clip-path: polygon(6.2px 3.2px, 7.3px 3.2px, 11.5px 7.5px, 11.5px 8.5px, 7.3px 12.8px, 6.2px 11.7px, 9.9px 8px, 6.2px 4.3px, 6.2px 3.2px)
      }
  `}

  ${(props) =>
    props.isActive &&
    `
    background: var(--secondary);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  `}
`;

const Pagination = ({ currentPage, totalPage, onPageChange }) => {
  const handleClick = (page) => (e) => {
    e.preventDefault();
    if (page < 1 || page > totalPage) {
      return;
    }
    onPageChange(page);
  };
  const pages = useMemo(() => {
    const minPage = Math.max(1, currentPage - 4);
    const maxPage = Math.min(totalPage, currentPage + 4);

    const pages = [
      ...[...Array(currentPage - minPage)].map((_, i) => i + minPage),
      currentPage,
      ...[...Array(maxPage - currentPage)].map((_, i) => i + currentPage + 1),
    ];
    return pages;
  }, [currentPage, totalPage]);

  return (
    <Container>
      <Button
        onClick={handleClick(currentPage - 1)}
        isPrev={true}
        disabled={currentPage === 1}
      ></Button>
      {pages.map((page) => (
        <Button key={page} onClick={handleClick(page)} isActive={page === currentPage}>
          {page}
        </Button>
      ))}
      <Button
        onClick={handleClick(currentPage + 1)}
        isAfter={true}
        disabled={currentPage === totalPage}
      ></Button>
    </Container>
  );
};

export default Pagination;
