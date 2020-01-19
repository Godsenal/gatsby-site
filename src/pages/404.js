import React from 'react';
import { Title, Layout, CustomLink } from '../components';

export default () => {
  return (
    <Layout>
      <Title h1="Not Found" body="There's not a page yet at this route.">
        <CustomLink to="/">» Back to homepage</CustomLink>
      </Title>
    </Layout>
  );
};
