const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const matter = require('gray-matter');
const chalk = require('chalk');
const ora = require('ora');
const format = require('date-fns/format');

const omitBy = require('lodash/omitBy');
const isEmpty = require('lodash/isEmpty');
const diff = require('lodash/difference');
const uniq = require('lodash/uniq');

const log = console.log;

const { promisify } = require('util');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const postPath = path.resolve(process.cwd(), 'src', 'pages', 'posts');

const readPosts = async () => {
  const posts = await readdir(postPath);
  return posts;
};
const handleTitle = async (titleList) => {
  const { title } = await inquirer.prompt({
    name: 'title',
    message: 'What is your post title?',
    validate: (val) => {
      return new Promise((res) => {
        if (!val || val.length < 2) {
          return res('Title must be 0 ~ 2 length.');
        }
        if (titleList.some((item) => item === val)) {
          return res('Title is already exist!');
        }
        return res(true);
      });
    },
  });
  return title;
};
const handleCategories = async (choices) => {
  const createIdentity = -1;
  let result = await inquirer.prompt({
    type: 'list',
    name: 'categories',
    message: 'Select categories.',
    choices: [
      { name: 'Create other category.', value: createIdentity },
      ...choices,
      { name: "I don't want to have category...", value: null },
    ],
  });
  if (result.categories === createIdentity) {
    result = await inquirer.prompt({
      name: 'categories',
      message: 'Type new category.',
      validate: (val) => {
        return new Promise((res) => {
          if (!val || val.length < 2) {
            return res('Category must be 0 ~ 2 length.');
          }
          return res(true);
        });
      },
    });
  }
  return result.categories ? [result.categories] : [];
};
const handleTags = async (choices, results = []) => {
  const FINISH = [{ name: `OK. DONE!`, value: null }];
  const currChoices = [...diff(choices, results)];
  const { result } = await inquirer.prompt({
    type: 'autocomplete',
    name: 'result',
    message: 'Select a tag.',
    source: (curr, input) => {
      return new Promise((res) => {
        if (!input) {
          return res(FINISH.concat(currChoices));
        }
        const searchResult = currChoices.filter((choice) => new RegExp(`^${input}`).test(choice));
        // Resolve search results or create Tag
        return res(
          searchResult.length ? searchResult : [{ name: `create ${input} tag.`, value: input }],
        );
      });
    },
  });
  // FINISH selected
  if (!result) {
    return uniq(results);
  }
  return handleTags(choices, results.concat(result));
};
const confirm = async (matters) => {
  log(chalk.magenta('Here is your post...'));
  log(chalk.italic(matters));
  const { proceed } = await inquirer.prompt({
    type: 'confirm',
    name: 'proceed',
    message: 'Do you want to proceed?',
  });
  return proceed;
};
const fetchMatters = (posts) => {
  const titleSet = new Set();
  const categorySet = new Set();
  const tagSet = new Set();
  posts.forEach((filename) => {
    const {
      data: { title, categories, tags },
    } = matter.read(`${postPath}/${filename}`);
    title && titleSet.add(title);
    categories && categorySet.add(...categories);
    tags && tagSet.add(...tags);
  });
  return [Array.from(titleSet), Array.from(categorySet), Array.from(tagSet)];
};
const createMatters = (matters) => {
  return matter.stringify('', matters);
};
const createPost = async (title, matters) => {
  const titleWithBar = title.replace(/ /gi, '-');
  const createPath = `${postPath}/${titleWithBar}.md`;
  await writeFile(createPath, matters);
  return createPath;
};

const startCommand = async (titleList, categoryList, tagList) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  log(chalk.magenta(`Today is : ${date}`));
  const title = await handleTitle(titleList);
  const categories = await handleCategories(categoryList);
  const tags = await handleTags(tagList);
  const matters = createMatters(omitBy({ title, date, tags, categories }, isEmpty));
  const proceed = await confirm(matters);

  if (proceed) {
    const spinner = ora('Creating post...').start();
    const createdPath = await createPost(title, matters);
    spinner.succeed('Done!');
    log(chalk.green(`You can find created post ${chalk.blue(createdPath)}`));
    return true;
  }
  return false;
};
module.exports = (async () => {
  const spinner = ora('Fetching exist matters...').start();
  const posts = await readPosts();
  const [titleList, categoryList, tagList] = fetchMatters(posts);
  spinner.succeed(`Let's write!`);
  while (!(await startCommand(titleList, categoryList, tagList)));
})();
