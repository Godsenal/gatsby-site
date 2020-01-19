import React, { useMemo } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 100%;
  margin: 2.5rem 0;
  text-align: center;
`;

const Button = styled.button`
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
  outline: none;
  padding: 0.2rem 0.6rem;
  margin-right: 5px;
  border-radius: 0.25rem;

  ${props =>
    props.isActive &&
    `
    color: ${props.theme.contrastColor};
    background: ${props.theme.primaryColor};
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  `}
`;

const Pagination = ({ currentPage, totalPage, onPageChange }) => {
  const handleClick = page => e => {
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
      <Button onClick={handleClick(1)}>{`|<`}</Button>
      <Button onClick={handleClick(currentPage - 1)}>{`<`}</Button>
      {pages.map(page => (
        <Button key={page} onClick={handleClick(page)} isActive={page === currentPage}>
          {page}
        </Button>
      ))}
      <Button onClick={handleClick(currentPage + 1)}>{`>`}</Button>
      <Button onClick={handleClick(totalPage)}>{`>|`}</Button>
    </Container>
  );
};

export default Pagination;
