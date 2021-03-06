import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Menu, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RouteWithSubRoutes from '../router/RouteWithSubRoutes';

import testService from './test-service';
testService();

import ScrollIndicator from './public/ScrollIndicator';
import SettingPage from './public/SettingPage';
import AuthorPane from './public/AuthorPane';

import { history } from '../App';

// 批量引入所有图片(可以指定所有图片类型)
// const requireContext = require.context('resources/install', true, /^\.\/.*\.(jpg|png)$/);
const requireContext = require.context('resources/public', true, /.*/);
requireContext.keys().map(requireContext);

@inject('pub') @observer
class HomePage extends Component {
  static propTypes = {
    pub: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
    };
    this.lastActiveItem = null;
  }

  /* ------------------- react event ------------------- */


  componentDidMount() {
    const { pub } = this.props;
    const { activeItem, total } = pub.state;
    const { animation } = this.getAnimation(activeItem, total);
    pub.checkPassword();
    pub.setToast(toast);
    history.push({
      pathname: '/install',
      state: { animation },
    });
  }

  /* ------------------- page event ------------------- */

  openExternalLink = (link) => {
    const { pub } = this.props;
    pub.openExternalLink(link);
  }

  openSettingPage = () => {
    const { pub } = this.props;
    pub.setSettingPage(true);
  }

  closeSettingPage = () => {
    const { pub } = this.props;
    pub.setSettingPage(false);
  }

  toggleRouterMenu = () => {
    const { pub } = this.props;
    pub.toggleNavActivate();
  }

  handleItemClick = (ev, { name }) => {
    const { pub, location } = this.props;
    const { total } = pub.state;
    const { animation } = this.getAnimation(name, total);
    if (location.pathname === `/${name}`) return;
    history.push({
      pathname: `/${name}`,
      state: { animation },
    });
    pub.setActiveItem(name);
  }

  /* ------------------- element builder ------------------- */

  /* 子菜单组件组件 */
  buildSubItem = (name, i, activeItem) => (
    <Menu.Item
      key={`${name}-${i}-subitem`}
      name={name}
      active={activeItem === name}
      onClick={this.handleItemClick}
    />
  )

  /* 根据导航菜单显示状态选择样式类 */
  getToggleState = navActivate => ({
    toggleIcon: navActivate ? 'arrow alternate circle left outline' : 'arrow alternate circle right outline',
    toggleClass: navActivate ? 'router-left-toggle' : 'router-left-toggle toggle-hidden',
    rightToggleClass: navActivate ? '' : 'toggle-hidden',
    leftToggleClass: navActivate ? '' : 'toggle-hidden',
  })

  /* 根据组件位置获取计算动画类型 */
  getAnimation = (activeItem, total) => {
    let animationClass = 'right-left-show-animation';

    if (this.lastActiveItem) {
      const lastIndex = total.indexOf(this.lastActiveItem);
      const nowIndex = total.indexOf(activeItem);
      if (nowIndex > lastIndex) {
        animationClass = 'right-left-show-animation';
      } else {
        animationClass = 'left-right-show-animation';
      }
    }
    this.lastActiveItem = activeItem;
    return {
      animation: animationClass,
    };
  }

  /* ------------------- page render ------------------- */

  render() {
    const { pub, match, routes } = this.props;
    const { checkPassword } = pub;
    const {
      activeItem, navActivate, total, settingPage, password,
    } = pub.state;
    const {
      toggleIcon, toggleClass, rightToggleClass, leftToggleClass,
    } = this.getToggleState(navActivate);
    return (
      <div className="container-router">

        <div className={`container-router-left ${leftToggleClass}`}>
          <div className="router-left-mask router-left-background" />
          <div className="router-left-mask2" />

          {/* menu */}

          <Menu pointing vertical className="text-white-shadow">
            {
              total.map((name, i) => this.buildSubItem(name, i, activeItem))
            }
          </Menu>

          {/* setting model */}

          <SettingPage
            open={settingPage}
            closeSettingPage={this.closeSettingPage}
            checkPassword={checkPassword}
            password={password}
            setPassword={pub.setPassword}
          />

          {/* author */}

          <AuthorPane />

          {/* left router */}

          <div className="router-left-menu">
            <span className="router-left-setting" onClick={() => {this.openSettingPage()}}>
              <Icon name="key"/>
            </span>
            <span onClick={() => {this.openExternalLink('https://www.github.com/NoJsJa')}}>
              <Icon name="github" />
            </span>
            <span className={toggleClass} onClick={this.toggleRouterMenu}>
              <Icon name={toggleIcon} />
            </span>

          </div>
        </div>

        {/* children */}

        <div className={`container-router-right ${rightToggleClass}`}>
          
          {
            routes && routes.map((route, i) => 
              <RouteWithSubRoutes key={`${route.path}_${i}`} route={route}/>
            )
          }

          <ScrollIndicator
            total={toJS(total)}
            activeItem={activeItem}
            handleItemClick={this.handleItemClick}
          />
        </div>

        {/* toast component */}
        <ToastContainer
          position="top-right"
          autoClose={5e3}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

      </div>
    );
  }
}

HomePage.propTypes = {};

export default HomePage;
