'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _iconsPlayButton = require('../icons/playButton');

var _iconsPlayButton2 = _interopRequireDefault(_iconsPlayButton);

var Video = (function (_Component) {
  _inherits(Video, _Component);

  function Video(props) {
    _classCallCheck(this, Video);

    _get(Object.getPrototypeOf(Video.prototype), 'constructor', this).call(this, props);
    this.state = { play: false };
  }

  _createClass(Video, [{
    key: 'onWrapperClick',
    value: function onWrapperClick(e) {
      e.stopPropagation();
      if (this.state.play) {
        this.refs.video_player.pause();
      } else {
        this.refs.video_player.play();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      var video = this.refs.video_player;

      video.addEventListener("play", function () {
        self.setState({ play: true });
      }, false);

      video.addEventListener("pause", function () {
        self.setState({ play: false });
      }, false);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        { style: { position: 'relative', pointerEvents: 'auto' } },
        _react2['default'].createElement(
          'div',
          { onClick: this.onWrapperClick.bind(this),
            style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '90%', zIndex: 100, cursor: this.props.style.cursor ? this.props.style.cursor : 'auto' } },
          _react2['default'].createElement(_iconsPlayButton2['default'], {
            fill: '#FFFFFF',
            style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '18%', height: '18%', margin: 'auto', opacity: this.state.play ? 0 : 0.8, cursor: 'pointer', transition: 'opacity 0.3s' }
          })
        ),
        _react2['default'].createElement(
          'video',
          {
            ref: 'video_player',
            src: this.props.src,
            preload: this.props.preload,
            controls: true,
            className: this.props.className,
            poster: this.props.poster,
            style: this.props.style },
          _react2['default'].createElement('source', { key: this.props.src, src: this.props.src }),
          this.props.srcset.map(function (src) {
            return _react2['default'].createElement('source', { key: src, src: src });
          })
        )
      );
    }
  }]);

  return Video;
})(_react.Component);

exports['default'] = Video;

Video.propTypes = {
  className: _react.PropTypes.string.isRequired,
  poster: _react.PropTypes.string.isRequired,
  preload: _react.PropTypes.string,
  src: _react.PropTypes.string.isRequired,
  srcset: _react.PropTypes.array.isRequired,
  style: _react.PropTypes.object.isRequired
};

Video.defaultProps = {
  preload: "auto"
};
module.exports = exports['default'];