import PropTypes from 'prop-types';
import React from 'react';
import { css, StyleSheet } from 'aphrodite/no-important';
import defaults from '../theme';
import { deepMerge } from '../utils';

function Footer ({
	caption,
	countCurrent,
	countSeparator,
	countTotal,
	showCount,
	pdf,
	src,
	...props,
}, {
	theme,
}) {
	if (!caption && !showCount) return null;

	const classes = StyleSheet.create(deepMerge(defaultStyles, theme));

	const imageCount = showCount ? (
		<div className={css(classes.footerCount)}>
			{countCurrent}
			{countSeparator}
			{countTotal}
		</div>)
		: <span />;

	let _caption = caption;
	let _pdfFileName = 'Download';

	if (pdf) {
		let captionsParts = caption.split('\n'); // for PDF content content should be in format `${filename}\n${formatted date}`
		if (captionsParts.length === 2) {
      _pdfFileName = captionsParts[0];
      _caption = captionsParts[1];
		}
	}

	return (
		<div className={css(classes.footer)} {...props}>
			{_caption ? (
				<figcaption className={css(classes.footerCaption)}>
					{ pdf
						? <div><a className={css(classes.downloadLink)}  href={src} target="_blank"><i className="fa fa-file-pdf-o" />&nbsp;{_pdfFileName}&nbsp;</a>({_caption})</div>
						: caption }
				</figcaption>
			) : (pdf ? <a className={css(classes.downloadLink)}  href={src} target="_blank"><i className="fa fa-file-pdf-o" />&nbsp;{_pdfFileName}</a>
        : <span />)}
			{imageCount}
		</div>
	);
}

Footer.propTypes = {
	caption: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	countCurrent: PropTypes.number,
	countSeparator: PropTypes.string,
	countTotal: PropTypes.number,
	showCount: PropTypes.bool,
	pdf: PropTypes.bool,
	src: PropTypes.string,
};
Footer.contextTypes = {
	theme: PropTypes.object.isRequired,
};

const defaultStyles = {
	footer: {
		boxSizing: 'border-box',
		color: defaults.footer.color,
		cursor: 'auto',
		display: 'flex',
		justifyContent: 'space-between',
		left: 0,
		lineHeight: 1.3,
		paddingBottom: defaults.footer.gutter.vertical,
		paddingLeft: defaults.footer.gutter.horizontal,
		paddingRight: defaults.footer.gutter.horizontal,
		paddingTop: defaults.footer.gutter.vertical,
	},
	footerCount: {
		color: defaults.footer.count.color,
		fontSize: defaults.footer.count.fontSize,
		paddingLeft: '1em', // add a small gutter for the caption
	},
	footerCaption: {
		flex: '1 1 0',
	},
  downloadLink: {
    color: '#DDD',
		fontSize: '18px',
	},
};

module.exports = Footer;
