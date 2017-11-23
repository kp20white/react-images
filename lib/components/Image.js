'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
var MAX_SCALE = 3.0;

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
        secondWrapper: {}
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
              wi = imageNode.offsetWidth;

          wrapperNode.scrollTop = (hi - hw) / 2;
          wrapperNode.scrollLeft = (wi - ww) / 2;
        }
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.src !== nextProps.src) {
        this.setState({
          scale: MIN_SCALE,
          imageLoaded: false,
          imageStyle: {
            maxHeight: 'calc(100vh - ' + nextProps.heightOffset + 'px)'
          },
          wrapperStyle: {},
          secondWrapper: {}
        });
      }
    }
  }, {
    key: 'onZoomIn',
    value: function onZoomIn() {
      var wrapHeight = this.refs.image_wrapper.offsetHeight;
      var wrapWidth = this.refs.image_wrapper.offsetWidth;
      var newScale = this.state.scale + 1.0;
      this.setState({
        scale: newScale,
        wrapperStyle: _extends({}, this.props.wrapperStyle, {
          overflow: 'scroll',
          width: wrapWidth,
          height: wrapHeight
        }),
        secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
        imageStyle: { width: '100%', height: '100%' }
      });

      this.zoomed = true;
    }
  }, {
    key: 'onZoomOut',
    value: function onZoomOut() {
      var newScale = this.state.scale - 1.0;
      if (newScale === 1.0) {
        this.setState({
          scale: MIN_SCALE,
          imageStyle: {
            maxHeight: 'calc(100vh - ' + this.props.heightOffset + 'px)'
          },
          wrapperStyle: {},
          secondWrapper: {}
        });
      } else {
        var wrapHeight = this.refs.image_wrapper.offsetHeight;
        var wrapWidth = this.refs.image_wrapper.offsetWidth;
        this.setState({
          scale: newScale,
          wrapperStyle: _extends({}, this.props.wrapperStyle, {
            overflow: 'scroll',
            width: wrapWidth,
            height: wrapHeight
          }),
          secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
          imageStyle: { width: '100%', height: '100%' }
        });
      }

      this.zoomed = true;
    }
  }, {
    key: 'render',
    value: function render() {

      var imgSize = {};
      if (this.state.scale > 1.0) {
        imgSize.width = this.state.imageStyle.width;
        imgSize.height = this.state.imageStyle.height;
      }

      var imageStyle = _extends({}, this.state.imageStyle);
      imageStyle.visibility = this.state.imageLoaded ? 'visible' : 'hidden';

      return _react2['default'].createElement(
        'div',
        { style: { position: 'relative', backgroundColor: 'black' } },
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
        this.state.scale > MIN_SCALE && _react2['default'].createElement(_iconsMinus2['default'], {
          color: '#FFF',
          title: 'Zoom out',
          onClick: this.onZoomOut.bind(this),
          style: {
            position: 'absolute',
            bottom: 10,
            right: this.state.scale < MAX_SCALE ? 40 : 10,
            cursor: 'pointer',
            zIndex: 100,
            width: 20,
            height: 20,
            opacity: this.state.imageLoaded ? 0.7 : 0,
            filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))'
          } }),
        this.state.scale < MAX_SCALE && _react2['default'].createElement(_iconsPlus2['default'], {
          color: '#FFF',
          title: 'Zoom in',
          onClick: this.onZoomIn.bind(this),
          style: {
            position: 'absolute',
            bottom: 10,
            right: 10,
            cursor: 'pointer',
            zIndex: 100,
            width: 20,
            height: 20,
            opacity: this.state.imageLoaded ? 0.7 : 0,
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
              className: this.props.className,
              onClick: this.props.onClickImage,
              sizes: this.state.scale === 1.0 ? this.props.sizes : undefined,
              alt: this.props.alt,
              src: this.props.src
            }, imgSize, {
              srcSet: this.props.srcset,
              style: imageStyle
            }))
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
  sizes: _react.PropTypes.string.isRequired,
  src: _react.PropTypes.string.isRequired,
  srcset: _react.PropTypes.array,
  style: _react.PropTypes.object.isRequired
};
module.exports = exports['default'];