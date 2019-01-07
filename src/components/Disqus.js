import React, { Component } from "react";
import { Helmet } from "react-helmet";

class Disqus extends Component {
  componentDidMount() {
    const { url, id } = this.props;
    window.disqus_config = this.getDisqusConfig();
  }
  getDisqusConfig = () => ({
    url: this.props.url,
    id: this.props.id
  });
  render() {
    return (
      <>
        <Helmet>
          <script
            src="https://godsenal-1.disqus.com/embed.js"
            data-timestamp={new Date()}
          />
          <noscript>
            {`
                Please enable JavaScript to view the disqus
            `}
          </noscript>
        </Helmet>
        <div id="disqus_thread" />
      </>
    );
  }
}

export default Disqus;
