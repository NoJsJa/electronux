import React from 'react';
import PropTypes from 'prop-types';

/**
 * [ScrollIndicator 滑动指示器]
 * @param       {[Array]}    total           [所有菜单项目]
 * @param       {[String]}   activeItem      [当前激活项目]
 * @param       {[Function]} handleItemClick [点击事件处理]
 */
function ScrollIndicator({ total, activeItem, handleItemClick }) {
  function getActiveClass(isActive) {
    const aClass = isActive ? 'indicator-dot dot-active' : 'indicator-dot dot-inactive';
    return aClass;
  }

  return (
    <div className="router-scroll-indicator">
      {
        total.map(item => (
          <span
            key={`scroll-indicator-${item}`}
            className={ getActiveClass(item === activeItem) }
            onClick={ () => { handleItemClick({}, {name: item}); } }
          />
        ))
      }
    </div>
  );
}

ScrollIndicator.propTypes = {
  total: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeItem: PropTypes.string.isRequired,
  handleItemClick: PropTypes.func.isRequired,
};

export default ScrollIndicator;
