"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var PlayButton = function PlayButton(props) {
	return _react2["default"].createElement(
		"svg",
		{
			className: props.className,
			fill: props.fill,
			style: props.style,
			version: "1.1",
			xmlns: "http://www.w3.org/2000/svg",
			xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", viewBox: "0 0 32 32", xmlSpace: "preserve" },
		_react2["default"].createElement("path", { d: "M6 4l20 12-20 12z" })
	);
};

PlayButton.propTypes = {
	className: _react.PropTypes.string.isRequired,
	fill: _react.PropTypes.string.isRequired,
	style: _react.PropTypes.object.isRequired
};

exports["default"] = PlayButton;
module.exports = exports["default"];