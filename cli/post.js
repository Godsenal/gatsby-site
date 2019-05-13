const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const matter = require("gray-matter");
const signale = require("signale");
const format = require("date-fns/format");

const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const postPath = path.resolve(process.cwd(), "src", "pages", "posts");

const readPosts = async () => {
  const posts = await readdir(postPath);
  return posts;
};
const getTitle = async () => {
  const { title } = await inquirer.prompt({
    name: "title",
    message: "What is your post title?",
    validate: val => {
      return new Promise(res => {
        if (!val || val.length < 2) {
          return res("Title must be 0 ~ 2 length.");
        }
        return res(true);
      });
    }
  });
  return title.replace(/ /gi, "-");
};
const getCategories = async choices => {
  let result = await inquirer.prompt({
    type: "list",
    name: "categories",
    message: "Select categories.",
    choices: [...choices, { name: "Create other category.", value: null }]
  });
  if (!result.categories) {
    result = await inquirer.prompt({
      name: "categories",
      message: "Type new category.",
      validate: val => {
        return new Promise(res => {
          if (!val || val.length < 2) {
            return res("Category must be 0 ~ 2 length.");
          }
          return res(true);
        });
      }
    });
  }
  return result.categories;
};
const getMatters = posts => {
  const categories = new Set();
  const tags = new Set();
  posts.forEach(filename => {
    const { data } = matter.read(`${postPath}/${filename}`);
    if (data.categories) {
      categories.add(...data.categories);
    }
    if (data.tags) {
      tags.add(...data.tags);
    }
  });
  return [Array.from(categories), Array.from(tags)];
};

module.exports = (async () => {
  const date = format(new Date(), "YYYY-MM-DD");
  const posts = await readPosts();
  const [categoryList, tagList] = getMatters(posts);

  signale.log(`Let's write!`);
  signale.log(`Today is : ${date}`);
  const title = await getTitle();
  signale.log(`Your post title is ${title}`);
  const categories = await getCategories(categoryList);
  const tags = await getTags(tagList);
})();
