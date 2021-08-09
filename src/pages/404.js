import React from 'react';
import { Title, Layout, CustomLink } from '../components';

const NotFound = () => {
  return (
    <Layout>
      <Title h1="Not Found" body="There's not a page yet at this route.">
        <CustomLink to="/">» Back to homepage</CustomLink>
      </Title>
    </Layout>
  );
};

export default NotFound;
