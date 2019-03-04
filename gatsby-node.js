const { createFilePath } = require("gatsby-source-filesystem");
const algoliasearch = require("algoliasearch");
const path = require("path");
const _ = require("lodash");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`
});

const { GATSBY_ALGOLIA_APP_ID, GATSBY_ALGOLIA_ADMIN_KEY } = process.env;
const algoClient = algoliasearch(
  GATSBY_ALGOLIA_APP_ID,
  GATSBY_ALGOLIA_ADMIN_KEY
);
const algoIndex = algoClient.initIndex("gatsby_site");

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === "MarkdownRemark") {
    // const fileNode = getNode(node.parent); createFilePath를 이용하여 쉽게 path처리
    const slug = createFilePath({ node, getNode, basePath: "pages" });
    createNodeField({
      node,
      name: "slug", // path는 이미 사용중인 값으로 피해야한다.
      value: slug
    });
  }
};
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  const postTemplate = path.resolve("src/templates/post.js");
  const postListTemplate = path.resolve("src/templates/postList.js");
  const postTagListTemplate = path.resolve("src/templates/postTagList.js");
  const tagListTemplate = path.resolve("src/templates/tagList.js");
  return new Promise((res, rej) => {
    graphql(`
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              id
              fields {
                slug
              }
              frontmatter {
                title
                tags
              }
            }
          }
        }
      }
    `).then(result => {
      const { edges } = result.data.allMarkdownRemark;
      let allTags = [];
      const searchObjects = [];
      /* helpers */
      const addTags = tags => tags && (allTags = _.union(allTags, tags));
      const addSearchObjects = (id, path, { title }) => {
        title && searchObjects.push({ objectID: id, title, path });
      };
      /*
        create post page
        latest page's index is 0!
      */
      edges.forEach(({ node }, i) => {
        const { slug } = node.fields;
        const previous = i === edges.length - 1 ? null : edges[i + 1].node;
        const next = i === 0 ? null : edges[i - 1].node;

        /* will use later */
        addTags(node.frontmatter.tags);
        addSearchObjects(node.id, node.fields.slug, node.frontmatter);

        createPage({
          path: slug,
          component: postTemplate,
          context: {
            slug,
            previous,
            next
          }
        });
      });
      /* create post list page with pagination */
      const postPerPage = 7;
      const numPage = Math.ceil(edges.length / postPerPage);
      Array.from({ length: numPage }).forEach((_, i) => {
        const path = i === 0 ? `/blog` : `/blog/${i + 1}`;
        const previous = i === 0 ? null : i === 1 ? "/blog" : `/blog/${i}`;
        const next = i + 1 === numPage ? null : `/blog/${i + 2}`;
        createPage({
          path,
          component: postListTemplate,
          context: {
            previous,
            next,
            limit: postPerPage,
            skip: postPerPage * i,
            tags: allTags
          }
        });
      });
      /* create tag list page */
      createPage({
        path: `/tags`,
        component: tagListTemplate,
        context: {
          tags: allTags
        }
      });
      /* create post list by tag */
      allTags.forEach(tag => {
        const path = `/tags/${tag}`;
        createPage({
          path,
          component: postTagListTemplate,
          context: {
            tag
          }
        });
      });
      /* create search index */
      algoIndex.addObjects(searchObjects);
    });
    res();
  });
};
