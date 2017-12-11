import React, { Component, PropTypes } from 'react';
import { css, StyleSheet } from 'aphrodite/no-important';

const MIN_SWIPE_LENGTH = 40.0;

export default class Pdf extends Component {
  constructor(props) {
    super(props);
  }

  onTouch(e) {
    /**
     * track touch swipes
     */

    let self = this;

    this.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    let onTouchEnd = function(e) {
      self.swipeStarted = false;

      let offsetX = self.touchPos.x - e.changedTouches[0].clientX;
      let offsetY = self.touchPos.y - e.changedTouches[0].clientY;

      if (Math.abs(offsetX) > (3.0 * Math.abs(offsetY)) && Math.abs(offsetX) > MIN_SWIPE_LENGTH) {
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

  render()
  {
    return (
      <div className={css(classes.pdfContainer)} onTouchStart={this.onTouch.bind(this)}>
        <div>
          <img src={this.props.thumbnail} />
        </div>
        <div className={css(classes.downloadBlock)} >
          <a className={css(classes.downloadLink)}  href={this.props.src} target="_blank"><i className="fa fa-file-pdf-o" />&nbsp;Download PDF</a>
        </div>
      </div>);
  }

}

Pdf.propTypes = {
  src: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
};



const classes = StyleSheet.create({
  pdfContainer: {
    textAlign: 'center',
  },
  downloadBlock: {
    display: 'inline-block',
    padding: '10px',
  },
  downloadLink: {
    color: '#DDD',
    fontSize: '1.4em',
  },
});
