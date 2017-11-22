import React, { PropTypes } from 'react';

const PlayButton = (props) => {
	return <svg
		fill={props.fill}
		style={props.style}
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 22 32" xmlSpace="preserve">
		<path d="M6 4l20 12-20 12z" />
	</svg>;
};


PlayButton.propTypes = {
	fill: PropTypes.string.isRequired,
	style: PropTypes.object.isRequired,
};

export default PlayButton;