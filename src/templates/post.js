import React from "react";
import { graphql, Link } from "gatsby";
import { css } from "@emotion/core";
import {
  Banner,
  Content,
  Layout,
  PostInfo,
  Profile,
  Title
} from "../components";

const prevPost = css`
  float: left;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateX(-5px);
    transition: transform 0.3s ease-in-out;
  }
`;
const nextPost = css`
  float: right;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateX(5px);
    transition: transform 0.3s ease-in-out;
  }
`;
const listContainer = css`
  text-align: right;
`;
const Template = ({ data, pageContext }) => {
  const { markdownRemark } = data;
  const { title, date, banner, tags } = markdownRemark.frontmatter;
  const { html, timeToRead } = markdownRemark;
  const { previous, next } = pageContext;
  return (
    <Layout>
      <Title h1={title} />
      <PostInfo date={date} timeToRead={timeToRead} tags={tags} />
      {banner && <Banner banner={banner} />}
      <Content dangerouslySetInnerHTML={{ __html: html }} />
      <h4 css={listContainer}>
        <Link to="/blog">» List</Link>
      </h4>
      <Profile />
      <div>
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
