import React from 'react';
import { Helmet } from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';
import favicon16 from '../images/favicon16.png';
import favicon32 from '../images/favicon32.png';
import favicon64 from '../images/favicon64.png';
import favicon128 from '../images/favicon128.png';

const query = graphql`
  query Head {
    site {
      siteMetadata {
        defaultTitle: title
        defaultDescription: description
        siteUrl: url
        defaultImage: image
        favicon
      }
    }
  }
`;

const Head = ({ title, description, image, pathname, article, tags }) => (
  <StaticQuery
    query={query}
    render={({
      site: {
        siteMetadata: {
          defaultTitle,
          titleTemplate,
          defaultDescription,
          siteUrl,
          defaultImage,
          favicon,
        },
      },
    }) => {
      const seo = {
        title: title || defaultTitle,
        description: description || defaultDescription,
        image: `${siteUrl}${image || defaultImage}`,
        url: `${siteUrl}${pathname || '/'}`,
        favicon: `${siteUrl}${favicon}`,
        keywords: (tags || []).join(','),
      };

      return (
        <>
          <Helmet
            title={seo.title}
            titleTemplate={titleTemplate}
            link={[
              {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: `${favicon16}`,
              },
              {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: `${favicon32}`,
              },
              {
                rel: 'icon',
                type: 'image/png',
                sizes: '64x64',
                href: `${favicon64}`,
              },
              { rel: 'shortcut icon', type: 'image/png', href: `${favicon128}` },
            ]}
          >
            <html lang="ko" />
            <meta name="description" content={seo.description} />
            <meta name="image" content={seo.image} />
            {seo.keywords && <meta name="keywords" content={seo.keywords} />}
            {seo.url && <meta property="og:url" content={seo.url} />}
            {(article ? true : null) && <meta property="og:type" content="article" />}
            {seo.title && <meta property="og:title" content={seo.title} />}
            {seo.description && <meta property="og:description" content={seo.description} />}
            {seo.image && <meta property="og:image" content={seo.image} />}
            <meta name="twitter:card" content="summary_large_image" />
            {seo.title && <meta name="twitter:title" content={seo.title} />}
            {seo.description && <meta name="twitter:description" content={seo.description} />}
            {seo.image && <meta name="twitter:image" content={seo.image} />}
          </Helmet>
        </>
      );
    }}
  />
);

export default Head;
