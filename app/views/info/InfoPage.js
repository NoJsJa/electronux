import React from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

@inject('info') @observer
class InfoPage extends React.Component {

  toggleInstall(index) {
  }

  render() {
    const { info, location } = this.props;
    const { animation } = location.state ? location.state : { animation: '' };
    console.log(location);
    return (
      <div className={`router-right-wrapper ${animation}`}>
        <div>
          info
        </div>
      </div>
    );
  }
}
export default InfoPage;