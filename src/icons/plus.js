import React, { PropTypes } from 'react';

const PlusIcon = (props) => {
	return <svg
		style={props.style}
		onClick={(e) => {props.onClick(e)}}
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 22 22" xmlSpace="preserve">
		<title>{props.title}</title>
		<g>
			<line strokeLinecap="square" y2="10" x2="3" y1="10" x1="20" strokeWidth="4" stroke={props.color} fill="none" />
			<line strokeLinecap="square" y2="0" x2="11.5" y1="18" x1="11.5" strokeWidth="4" stroke={props.color} fill="none" />
		</g>
	</svg>;
};


PlusIcon.propTypes = {
	color: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	style: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
};

export default PlusIcon;