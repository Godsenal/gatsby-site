import React from "react";
import { graphql, Link } from "gatsby";
import { css } from "@emotion/core";
import {
  Banner,
  Content,
  Disqus,
  HEAD,
  Layout,
  PostInfo,
  Profile,
  Title
} from "../components";

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
  const { title, date, banner, tags } = markdownRemark.frontmatter;
  const { id, html, timeToRead } = markdownRemark;
  const { previous, next } = pageContext;
  return (
    <Layout>
      <HEAD title={title} pathname={location.pathname} />
      <Title h1={title} />
      <PostInfo date={date} timeToRead={timeToRead} tags={tags} />
      {banner && <Banner banner={banner} />}
      <Content dangerouslySetInnerHTML={{ __html: html }} />
      <h4 css={listContainer}>
        <Link to="/blog">» List</Link>
      </h4>
      <Profile />
      <Disqus id={id} url={location.href} />
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
    </Layout>
  );
};

export default Template;

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      frontmatter {
        title
        date
        banner
        tags
      }
    }
  }
`;
