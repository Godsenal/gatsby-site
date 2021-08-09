import React from 'react';
import { graphql, Link } from 'gatsby';
import { css } from '@emotion/core';
import {
  Banner,
  Content,
  Disqus,
  HEAD,
  Layout,
  PostInfo,
  Profile,
  Title,
  Toc,
} from '../components';

const prevOrNext = css`
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-wrap: wrap;
`;
const prevPost = css`
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateX(-5px);
    transition: transform 0.3s ease-in-out;
  }
`;
const nextPost = css`
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateX(5px);
    transition: transform 0.3s ease-in-out;
  }
`;
const listContainer = css`
  text-align: right;
`;

const Template = ({ data, pageContext, location }) => {
  const { markdownRemark } = data;
  const { id, html, timeToRead, excerpt, tableOfContents, frontmatter } = markdownRemark;
  const { title, date, banner, tags } = frontmatter;
  const { previous, next } = pageContext;

  return (
    <Layout>
      <HEAD title={title} pathname={location.pathname} description={excerpt} />
      <Title h1={title} />
      <Toc tableOfContents={tableOfContents} />
      <PostInfo date={date} timeToRead={timeToRead} tags={tags} />
      {banner && <Banner banner={banner} />}
      <Content dangerouslySetInnerHTML={{ __html: html }} />
      <h4 css={listContainer}>
        <Link to="/blog">» List</Link>
      </h4>
      <Profile />
      <div css={prevOrNext}>
        {previous && (
          <Link css={prevPost} to={previous.fields.slug}>
            <h5>« {previous.frontmatter.title}</h5>
          </Link>
        )}
        {next && (
          <Link css={nextPost} to={next.fields.slug}>
            <h5>{next.frontmatter.title} »</h5>
          </Link>
        )}
      </div>
      <Disqus id={id} url={location.href} />
    </Layout>
  );
};

export default Template;

export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      excerpt(truncate: true)
      frontmatter {
        title
        date
        banner
        tags
        categories
      }
      tableOfContents
    }
  }
`;
