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
			fill: props.fill,
			style: props.style,
			version: "1.1",
			xmlns: "http://www.w3.org/2000/svg",
			xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", width: "100%", height: "100%", viewBox: "0 0 22 32", xmlSpace: "preserve" },
		_react2["default"].createElement("path", { d: "M6 4l20 12-20 12z" })
	);
};

PlayButton.propTypes = {
	fill: _react.PropTypes.string.isRequired,
	style: _react.PropTypes.object.isRequired
};

exports["default"] = PlayButton;
module.exports = exports["default"];