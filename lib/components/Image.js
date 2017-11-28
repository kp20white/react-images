'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _iconsMinus = require('../icons/minus');

var _iconsMinus2 = _interopRequireDefault(_iconsMinus);

var _iconsPlus = require('../icons/plus');

var _iconsPlus2 = _interopRequireDefault(_iconsPlus);

var MIN_SCALE = 1.0;
var MAX_SCALE = 4.0;
var SCALE_MULTER = 2.0;

var MIN_SWIPE_LENGTH = 40.0;

var Image = (function (_Component) {
  _inherits(Image, _Component);

  function Image(props) {
    _classCallCheck(this, Image);

    _get(Object.getPrototypeOf(Image.prototype), 'constructor', this).call(this, props);
  }

  _createClass(Image, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        scale: MIN_SCALE,
        imageLoaded: false,
        imageStyle: {
          maxHeight: 'calc(100vh - ' + this.props.heightOffset + 'px)'
        },
        wrapperStyle: {},
        secondWrapper: { maxHeight: '100vh' }
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var image = this.refs.lightbox_image_node;
      image.addEventListener('load', function () {
        _this.setState({ imageLoaded: true });
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.zoomed) {
        this.zoomed = false;

        if (this.state.scale > MIN_SCALE) {
          var imageNode = this.refs.lightbox_image_node,
              wrapperNode = this.refs.image_wrapper;

          var hw = wrapperNode.offsetHeight,
              hi = imageNode.offsetHeight,
              ww = wrapperNode.offsetWidth,
              wi = imageNode.offsetWidth,
              centerX = 0.5,
              centerY = 0.5;

          if (this.touchRelativePos) {
            centerX = this.touchRelativePos.x;
            centerY = this.touchRelativePos.y;
            this.touchRelativePos = null;
          }

          wrapperNode.scrollTop = hi * centerY - hw / 2;
          wrapperNode.scrollLeft = wi * centerX - ww / 2;
        }
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.src !== nextProps.src) {
        this.touchRelativePos = null;
        this.setState({
          scale: MIN_SCALE,
          imageLoaded: false,
          imageStyle: {
            maxHeight: 'calc(100vh - ' + nextProps.heightOffset + 'px)'
          },
          wrapperStyle: {},
          secondWrapper: { maxHeight: '100vh' }
        });
      }
    }
  }, {
    key: 'onZoomIn',
    value: function onZoomIn(e) {
      var multer = arguments.length <= 1 || arguments[1] === undefined ? SCALE_MULTER : arguments[1];

      if (this.state.scale >= MAX_SCALE) return;

      if (e !== null) {
        console.log('clear touchPos');
        this.touchRelativePos = null;
      } // if click on + clear tabPos info

      var wrapHeight = this.refs.image_wrapper.offsetHeight;
      var wrapWidth = this.refs.image_wrapper.offsetWidth;
      var newScale = this.state.scale * multer;
      this.setState({
        scale: newScale,
        wrapperStyle: {
          overflow: 'scroll',
          width: wrapWidth,
          height: wrapHeight
        },
        secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
        imageStyle: { width: '100%', height: '100%' }
      });

      this.zoomed = true;
    }
  }, {
    key: 'onZoomOut',
    value: function onZoomOut(e) {
      var multer = arguments.length <= 1 || arguments[1] === undefined ? SCALE_MULTER : arguments[1];

      if (this.state.scale <= MIN_SCALE) return;

      if (e !== null) {
        console.log('clear touchPos');
        this.touchRelativePos = null;
      } // if click on - clear tabPos info

      var newScale = this.state.scale / multer;
      if (newScale === MIN_SCALE) {
        this.setState({
          scale: MIN_SCALE,
          imageStyle: {
            maxHeight: 'calc(100vh - ' + this.props.heightOffset + 'px)'
          },
          wrapperStyle: {},
          secondWrapper: { maxHeight: '100vh' }
        });
      } else {
        var wrapHeight = this.refs.image_wrapper.offsetHeight;
        var wrapWidth = this.refs.image_wrapper.offsetWidth;
        this.setState({
          scale: newScale,
          wrapperStyle: {
            overflow: 'scroll',
            width: wrapWidth,
            height: wrapHeight
          },
          secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
          imageStyle: { width: '100%', height: '100%' }
        });
      }

      this.zoomed = true;
    }
  }, {
    key: 'onImageMouseDown',
    value: function onImageMouseDown(e) {
      var _this2 = this;

      if (!this.panStarted) {
        (function () {
          var self = _this2;
          _this2.panStarted = true;
          _this2.scrollPos = { x: e.clientX, y: e.clientY };

          var onMouseMove = function onMouseMove(e) {
            var offsetX = self.scrollPos.x - e.clientX;
            var offsetY = self.scrollPos.y - e.clientY;

            self.refs.image_wrapper.scrollLeft += offsetX;
            self.refs.image_wrapper.scrollTop += offsetY;

            self.scrollPos = { x: e.clientX, y: e.clientY };
          };

          var onMouseUp = function onMouseUp(e) {
            self.panStarted = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };

          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        })();
      }
    }
  }, {
    key: 'onImageTouch',
    value: function onImageTouch(e) {
      var _this3 = this;

      if (!this.panStarted) {
        var _ret2 = (function () {
          var self = _this3;
          _this3.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          var imageRect = _this3.refs.lightbox_image_node.getClientRects()[0];
          _this3.touchRelativePos = {
            x: (e.touches[0].clientX - imageRect.x) / _this3.refs.lightbox_image_node.clientWidth,
            y: (e.touches[0].clientY - imageRect.y) / _this3.refs.lightbox_image_node.clientHeight
          };
          if (_this3.state.scale > MIN_SCALE) {
            var _ret3 = (function () {

              if (_this3.lastTouchTime && Date.now() - _this3.lastTouchTime < 300) {
                if (_this3.state.scale < MAX_SCALE) {
                  self.onZoomIn(null, SCALE_MULTER);
                } else {
                  self.onZoomOut(null, MAX_SCALE);
                }
                return {
                  v: {
                    v: undefined
                  }
                };
              }

              _this3.lastTouchTime = Date.now();
              _this3.panStarted = true;

              var onTouchMove = function onTouchMove(e) {
                var offsetX = self.touchPos.x - e.changedTouches[0].clientX;
                var offsetY = self.touchPos.y - e.changedTouches[0].clientY;

                self.refs.image_wrapper.scrollLeft += offsetX;
                self.refs.image_wrapper.scrollTop += offsetY;

                self.touchPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
              };

              var onTouchEnd = function onTouchEnd(e) {
                self.panStarted = false;
                window.removeEventListener("touchmove", onTouchMove);
                window.removeEventListener("touchend", onTouchEnd);
              };

              window.addEventListener("touchmove", onTouchMove);
              window.addEventListener("touchend", onTouchEnd);
            })();

            if (typeof _ret3 === 'object') return _ret3.v;
          } else {
            var _ret4 = (function () {
              /**
               * track touch swipes
               */
              if (_this3.lastTouchTime && Date.now() - _this3.lastTouchTime < 300) {
                // time beetween touches is less than 300ms - double tap
                self.onZoomIn(null, SCALE_MULTER);
                return {
                  v: {
                    v: undefined
                  }
                };
              }

              _this3.lastTouchTime = Date.now();
              _this3.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

              var onTouchEnd = function onTouchEnd(e) {
                self.swipeStarted = false;

                var offsetX = self.touchPos.x - e.changedTouches[0].clientX;
                var offsetY = self.touchPos.y - e.changedTouches[0].clientY;

                if (Math.abs(offsetX) > 3.0 * Math.abs(offsetY) && Math.abs(offsetX) > MIN_SWIPE_LENGTH) {
                  if (offsetX < 0) {
                    // swipe left
                    if (self.props.onSwipeLeft) self.props.onSwipeLeft();
                  } else {
                    // swipe right
                    if (self.props.onSwipeRight) self.props.onSwipeRight();
                  }
                }

                window.removeEventListener("touchend", onTouchEnd);
              };

              window.addEventListener("touchend", onTouchEnd);
            })();

            if (typeof _ret4 === 'object') return _ret4.v;
          }
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }
  }, {
    key: 'onImageDoubleClick',
    value: function onImageDoubleClick(e) {

      var imageRect = this.refs.lightbox_image_node.getClientRects()[0];

      this.touchRelativePos = {
        x: (e.clientX - imageRect.x) / this.refs.lightbox_image_node.clientWidth,
        y: (e.clientY - imageRect.y) / this.refs.lightbox_image_node.clientHeight
      };

      if (this.state.scale < MAX_SCALE) {
        this.onZoomIn(null, SCALE_MULTER);
      } else {
        this.onZoomOut(null, MAX_SCALE);
      }
    }
  }, {
    key: 'render',
    value: function render() {

      var imgSize = {};
      if (this.state.scale > MIN_SCALE) {
        imgSize.width = this.state.imageStyle.width;
        imgSize.height = this.state.imageStyle.height;
      }

      var imageStyle = _extends({}, this.state.imageStyle);
      imageStyle.visibility = this.state.imageLoaded ? 'visible' : 'hidden';

      if (this.state.scale > MIN_SCALE) {
        imageStyle.cursor = 'all-scroll';
      }

      return _react2['default'].createElement(
        'div',
        { style: { textAlign: 'center' } },
        _react2['default'].createElement(
          'div',
          { style: { position: 'relative', display: 'inline-block', maxWidth: '100vw', margin: 'auto', backgroundColor: 'black' } },
          !this.state.imageLoaded && _react2['default'].createElement('i', { className: 'fa fa-circle-o-notch fa-spin fa-fw', style: {
              position: 'absolute',
              bottom: 0,
              top: 0,
              left: 0,
              right: 0,
              margin: 'auto',
              zIndex: 100,
              width: 30,
              height: 30,
              opacity: 1,
              color: '#AAA',
              fontSize: '2em'
            } }),
          _react2['default'].createElement(_iconsMinus2['default'], {
            color: '#FFF',
            title: 'Zoom out',
            onClick: this.onZoomOut.bind(this),
            style: {
              position: 'absolute',
              bottom: 10,
              right: 40,
              cursor: this.state.scale > MIN_SCALE ? 'pointer' : 'auto',
              zIndex: 100,
              width: 20,
              height: 20,
              opacity: this.state.imageLoaded ? this.state.scale > MIN_SCALE ? 0.8 : 0.4 : 0,
              filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))'
            } }),
          _react2['default'].createElement(_iconsPlus2['default'], {
            color: '#FFF',
            title: 'Zoom in',
            onClick: this.onZoomIn.bind(this),
            style: {
              position: 'absolute',
              bottom: 10,
              right: 10,
              cursor: this.state.scale < MAX_SCALE ? 'pointer' : 'auto',
              zIndex: 100,
              width: 20,
              height: 20,
              opacity: this.state.imageLoaded ? this.state.scale < MAX_SCALE ? 0.8 : 0.4 : 0,
              filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))'
            } }),
          _react2['default'].createElement(
            'div',
            { style: this.state.wrapperStyle, ref: 'image_wrapper' },
            _react2['default'].createElement(
              'div',
              { style: this.state.secondWrapper },
              _react2['default'].createElement('img', _extends({
                ref: 'lightbox_image_node',
                className: this.state.scale === MIN_SCALE ? this.props.className + ' not_scaled_image' : this.props.className,
                sizes: this.state.scale === MIN_SCALE ? this.props.sizes : undefined,
                alt: this.props.alt,
                src: this.props.src
              }, imgSize, {
                srcSet: this.props.srcset,
                style: imageStyle,
                draggable: 'false',
                onClick: this.props.onClickImage,
                onDoubleClick: this.onImageDoubleClick.bind(this),
                onMouseDown: this.onImageMouseDown.bind(this),
                onTouchStart: this.onImageTouch.bind(this)
              }))
            )
          )
        )
      );
    }
  }]);

  return Image;
})(_react.Component);

exports['default'] = Image;

Image.propTypes = {
  alt: _react.PropTypes.func,
  className: _react.PropTypes.string.isRequired,
  heightOffset: _react.PropTypes.number.isRequired,
  onClick: _react.PropTypes.func,
  onSwipeLeft: _react.PropTypes.func,
  onSwipeRight: _react.PropTypes.func,
  sizes: _react.PropTypes.string.isRequired,
  src: _react.PropTypes.string.isRequired,
  srcset: _react.PropTypes.array,
  style: _react.PropTypes.object.isRequired
};
module.exports = exports['default'];