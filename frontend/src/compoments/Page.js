import React from 'react';

class Page extends React.Component {

  render() {

    return (
      <div id="page">
        {this.props.children}
        <div id="footer">
          <p class="copyright">&#169; 2022 Gregory Moyerbrailean</p>
        </div>
      </div>
    )
  }
}

export default Page;