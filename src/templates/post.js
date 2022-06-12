import React, { useEffect, useRef, useState } from 'react';
import { graphql, Link } from 'gatsby';
import { DiscussionEmbed } from 'disqus-react';
import { css } from '@emotion/react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Content, HEAD, Layout, PostInfo, Profile, Title, Toc } from '../components';
import { screen } from '../constants';

const ANCHOR_SELECTOR = '.anchor';
const DISQUS_NAME = 'godsenal-1';

const prevOrNext = css`
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const commonPostLink = css`
  @media screen and (max-width: ${screen.small}px) {
    width: 100%;
    text-align: center;
  }
`;

const prevPost = css`
  ${commonPostLink}
`;
const nextPost = css`
  ${commonPostLink}
`;
const listContainer = css`
  text-align: right;
`;

const Template = ({ data, pageContext, location }) => {
  const $content = useRef(null);
  const [activeHash, setActiveHash] = useState('');
  const { markdownRemark } = data;
  const { id, html, timeToRead, excerpt, tableOfContents, frontmatter } = markdownRemark;
  const { title, date, banner, tags } = frontmatter;
  const { previous, next } = pageContext;
  const image = getImage(banner);

  useEffect(() => {
    const anchors = $content.current.querySelectorAll(ANCHOR_SELECTOR);
    const GAP = 100;

    if (anchors.length === 0) {
      return;
    }

    const handleScroll = () => {
      if (GAP <= anchors[0].getBoundingClientRect().top) {
        setActiveHash('');
        return;
      }

      const firstMatchIndex = [...anchors].findIndex((_, i) => {
        return !anchors[i + 1] || anchors[i + 1].getBoundingClientRect().top >= GAP;
      });

      firstMatchIndex > -1 && setActiveHash(anchors[firstMatchIndex].hash);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Layout>
      <HEAD title={title} pathname={location.pathname} description={excerpt} tags={tags} />
      <Title h1={title} />
      <Toc tableOfContents={tableOfContents} activeHash={activeHash} />
      <PostInfo date={date} timeToRead={timeToRead} tags={tags} />
      {image && <GatsbyImage image={image} alt={title} />}
      <Content ref={$content} dangerouslySetInnerHTML={{ __html: html }} />
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
      <DiscussionEmbed
        shortname={DISQUS_NAME}
        config={{
          url: location.href,
          identifier: id,
          title,
          language: 'ko',
        }}
      />
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
        banner {
          childImageSharp {
            gatsbyImageData(width: 1200)
          }
        }
        tags
        categories
      }
      tableOfContents
    }
  }
`;
