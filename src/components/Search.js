import React, { createRef, Component } from 'react';
import {
  InstantSearch,
  connectStateResults,
  SearchBox,
  Hits,
  Highlight,
} from 'react-instantsearch-dom';
import { css } from '@emotion/react';
import algoliasearch from 'algoliasearch/lite';
import { CustomLink } from '../components';
import { screen } from '../constants';

const searchContainer = (open) => css`
  position: fixed;
  top: 200px;
  left: 50%;
  margin-left: -400px;
  width: 800px;
  padding: 20px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: var(--bg);

  z-index: 105;

  transition: top 0.3s ease-in-out;

  @media screen and (max-width: ${screen.small}px) {
    width: 100%;
    margin-top: 0;
    margin-left: 0;
    top: ${open ? '0px' : '-1000px'};
    left: 0;
  }
`;
const container = css`
  width: 100%;
`;
const searchBox = css`
  width: 100%;
  margin: auto;
  form {
    width: 100%;
    display: flex;
  }
  input {
    width: 90%;
    outline: none;
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    color: var(--text);
  }
  button {
    border: none;
    outline: none;
  }
  svg {
    fill: var(--text);
  }
`;
const hitList = css`
  overflow-y: auto;
  max-height: 500px;
  ul {
    margin: 0;
  }
  li {
    margin-bottom: 2rem;
  }
  em {
    font-weight: 600;
  }
`;
const noResult = css`
  text-align: center;
`;
const Post = ({ hit }) => (
  <div>
    <CustomLink to={hit.path}>
      <Highlight attribute="title" hit={hit} />
    </CustomLink>
  </div>
);
const SearchResults = connectStateResults(({ searchState, searchResults, children }) => {
  if (!searchState || !searchState.query || !searchResults.query) {
    return null;
  }
  if (!searchResults || searchResults.hits.length <= 0) {
    return <div css={noResult}>No results for {searchState.query}</div>;
  }
  return children;
});
class Search extends Component {
  wrapper = createRef();
  componentDidMount() {
    window.addEventListener('mousedown', this.handleMousedown);
  }
  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleMousedown);
  }
  handleMousedown = (e) => {
    if (this.props.open && this.wrapper.current && !this.wrapper.current.contains(e.target)) {
      this.props.handleClose();
    }
  };
  render() {
    const { open } = this.props;
    if (!process.env.GATSBY_ALGOLIA_APP_ID || !process.env.GATSBY_ALGOLIA_SEARCH_KEY) {
      return null;
    }
    if (!open) return null;

    const searchClient = algoliasearch(
      process.env.GATSBY_ALGOLIA_APP_ID,
      process.env.GATSBY_ALGOLIA_SEARCH_KEY,
    );

    return (
      <div css={searchContainer(open)} ref={this.wrapper}>
        <InstantSearch searchClient={searchClient} indexName="gatsby_site">
          <div css={container}>
            <div css={searchBox}>
              <SearchBox autoFocus />
            </div>
            <SearchResults>
              <div css={hitList}>
                <Hits hitComponent={Post} />
              </div>
            </SearchResults>
          </div>
        </InstantSearch>
      </div>
    );
  }
}

export default Search;

export { Search };
