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

var _aphroditeNoImportant = require('aphrodite/no-important');

var MIN_SWIPE_LENGTH = 40.0;

var Pdf = (function (_Component) {
  _inherits(Pdf, _Component);

  function Pdf(props) {
    _classCallCheck(this, Pdf);

    _get(Object.getPrototypeOf(Pdf.prototype), 'constructor', this).call(this, props);
  }

  _createClass(Pdf, [{
    key: 'onTouch',
    value: function onTouch(e) {
      /**
       * track touch swipes
       */

      var self = this;

      this.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

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
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        { className: (0, _aphroditeNoImportant.css)(classes.pdfContainer), onTouchStart: this.onTouch.bind(this) },
        _react2['default'].createElement(
          'div',
          null,
          _react2['default'].createElement('img', { src: this.props.thumbnail })
        ),
        _react2['default'].createElement(
          'div',
          { className: (0, _aphroditeNoImportant.css)(classes.downloadBlock) },
          _react2['default'].createElement(
            'a',
            { className: (0, _aphroditeNoImportant.css)(classes.downloadLink), href: this.props.src, target: '_blank' },
            _react2['default'].createElement('i', { className: 'fa fa-file-pdf-o' }),
            ' Download PDF'
          )
        )
      );
    }
  }]);

  return Pdf;
})(_react.Component);

exports['default'] = Pdf;

Pdf.propTypes = {
  src: _react.PropTypes.string.isRequired,
  thumbnail: _react.PropTypes.string.isRequired,
  onSwipeLeft: _react.PropTypes.func,
  onSwipeRight: _react.PropTypes.func
};

var classes = _aphroditeNoImportant.StyleSheet.create({
  pdfContainer: {
    textAlign: 'center'
  },
  downloadBlock: {
    display: 'inline-block',
    padding: '10px'
  },
  downloadLink: {
    color: '#DDD',
    fontSize: '1.4em'
  }
});
module.exports = exports['default'];