import React, { Component, PropTypes } from 'react';
import MinusIcon from '../icons/minus';
import PlusIcon from '../icons/plus';

const MIN_SCALE = 1.0;
const MAX_SCALE = 4.0;
const SCALE_MULTER = 2.0;

const MIN_SWIPE_LENGTH = 40.0;

export default class Image extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({
      scale: MIN_SCALE,
      imageLoaded: false,
      imageStyle: {
        maxHeight: `calc(100vh - ${this.props.heightOffset}px)`,
      },
      wrapperStyle: {},
      secondWrapper: { maxHeight: '100vh' },
    });
  }

  componentDidMount() {
    let image = this.refs.lightbox_image_node;
    image.addEventListener('load', () => {
      this.setState({imageLoaded: true});
    });
  }

  componentDidUpdate() {
    if (this.zoomed) {
      this.zoomed = false;

      if (this.state.scale > MIN_SCALE) {
        let imageNode = this.refs.lightbox_image_node,
          wrapperNode = this.refs.image_wrapper;

        let hw = wrapperNode.offsetHeight,
          hi = imageNode.offsetHeight,
          ww = wrapperNode.offsetWidth,
          wi = imageNode.offsetWidth,
          centerX = 0.5, centerY = 0.5;

        if (this.touchRelativePos) {
          centerX = this.touchRelativePos.x;
          centerY = this.touchRelativePos.y;
          console.log('this.touchPos', { centerX, centerY });
          this.touchRelativePos = null;
        }

        wrapperNode.scrollTop = (hi * centerY) - hw / 2;
        wrapperNode.scrollLeft = (wi * centerX) - ww / 2;
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.tabPos = null;
      this.setState({
        scale: MIN_SCALE,
        imageLoaded: false,
        imageStyle: {
          maxHeight: `calc(100vh - ${nextProps.heightOffset}px)`,
        },
        wrapperStyle: {},
        secondWrapper: { maxHeight: '100vh' },
      });
    }
  }

  onZoomIn(e, multer = SCALE_MULTER) {
    if (this.state.scale >= MAX_SCALE) return;

    if (e !== null) {
      console.log('clear touchPos');
      this.touchRelativePos = null;
    } // if click on + clear tabPos info

    let wrapHeight = this.refs.image_wrapper.offsetHeight;
    let wrapWidth = this.refs.image_wrapper.offsetWidth;
    let newScale  = this.state.scale * multer;
    this.setState({
      scale: newScale,
      wrapperStyle: {
        overflow: 'scroll',
        width: wrapWidth,
        height: wrapHeight,
      },
      secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
      imageStyle: { width:'100%', height: '100%' },
    });

    this.zoomed = true;
  }

  onZoomOut(e, multer = SCALE_MULTER) {
    if (this.state.scale <= MIN_SCALE) return;

    if (e !== null) {
      console.log('clear touchPos');
      this.touchRelativePos = null;
    } // if click on - clear tabPos info

    let newScale = this.state.scale / multer;
    if (newScale === MIN_SCALE) {
      this.setState({
        scale: MIN_SCALE,
        imageStyle: {
          maxHeight: `calc(100vh - ${this.props.heightOffset}px)`,
        },
        wrapperStyle: {},
        secondWrapper: { maxHeight: '100vh' },
      });
    } else {
      let wrapHeight = this.refs.image_wrapper.offsetHeight;
      let wrapWidth = this.refs.image_wrapper.offsetWidth;
      this.setState({
        scale: newScale,
        wrapperStyle: {
          overflow: 'scroll',
          width: wrapWidth,
          height: wrapHeight,
        },
        secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
        imageStyle: { width:'100%', height: '100%' },
      });
    }

    this.zoomed = true;
  }

  onImageMouseDown(e) {
    if (!this.panStarted) {
      let self = this;
      this.panStarted = true;
      this.scrollPos = { x: e.clientX, y: e.clientY };

      let onMouseMove = function(e) {
        let offsetX = self.scrollPos.x - e.clientX;
        let offsetY = self.scrollPos.y - e.clientY;

        self.refs.image_wrapper.scrollLeft += offsetX;
        self.refs.image_wrapper.scrollTop += offsetY;

        self.scrollPos = { x: e.clientX, y: e.clientY };
      };

      let onMouseUp = function(e) {
        self.panStarted = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
  }

  onImageTouch(e) {
    if (!this.panStarted) {
      let self = this;
      this.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      // console.log('e.touches[0]', e.touches[0]);
      // console.log('ClientSize', {w: this.refs.lightbox_image_node.clientWidth, h: this.refs.lightbox_image_node.clientHeight});
      let imageRect = this.refs.lightbox_image_node.getClientRects()[0];
      this.touchRelativePos = {
        x: (e.touches[0].clientX - imageRect.x) / this.refs.lightbox_image_node.clientWidth,
        y: (e.touches[0].clientY - imageRect.y) / this.refs.lightbox_image_node.clientHeight,
      };
      // console.log('touchRelativePos', this.touchRelativePos);
      if (this.state.scale > MIN_SCALE) {

        if (this.lastTouchTime && (Date.now() - this.lastTouchTime) < 300) {
          // time beetween touches is less than 300ms - double tap
          if (this.state.scale < MAX_SCALE) {
            self.onZoomIn(null, SCALE_MULTER);
          }
          else {
            self.onZoomOut(null, MAX_SCALE);
          }
          return;
        }

        this.lastTouchTime = Date.now();
        this.panStarted = true;

        let onTouchMove = function(e) {
          let offsetX = self.touchPos.x - e.changedTouches[0].clientX;
          let offsetY = self.touchPos.y - e.changedTouches[0].clientY;

          self.refs.image_wrapper.scrollLeft += offsetX;
          self.refs.image_wrapper.scrollTop += offsetY;

          self.touchPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        };

        let onTouchEnd = function(e) {
          self.panStarted = false;
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("touchend", onTouchEnd);
        };

        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("touchend", onTouchEnd);
      } else {
        /**
         * track touch swipes
         */
          if (this.lastTouchTime && (Date.now() - this.lastTouchTime) < 300) {
            // time beetween touches is less than 300ms - double tap
            self.onZoomIn(null, SCALE_MULTER);
            return;
          }

          this.lastTouchTime = Date.now();
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
    }
  }

  onImageDoubleClick(e) {

    let imageRect = this.refs.lightbox_image_node.getClientRects()[0];

    this.touchRelativePos = {
      x: (e.clientX - imageRect.x) / this.refs.lightbox_image_node.clientWidth,
      y: (e.clientY - imageRect.y) / this.refs.lightbox_image_node.clientHeight,
    };

    if (this.state.scale < MAX_SCALE) {
      this.onZoomIn(null, SCALE_MULTER);
    }
    else {
      this.onZoomOut(null, MAX_SCALE);
    }
  }

  render()
  {

    let imgSize = {};
    if (this.state.scale > MIN_SCALE) {
      imgSize.width = this.state.imageStyle.width;
      imgSize.height =  this.state.imageStyle.height;
    }

    let imageStyle = {...this.state.imageStyle};
    imageStyle.visibility = this.state.imageLoaded ? 'visible' : 'hidden';

    if (this.state.scale > MIN_SCALE) {
      imageStyle.cursor = 'all-scroll';
    }

    return (
      <div style={{textAlign: 'center'}}>
        <div style={{position: 'relative', display: 'inline-block', maxWidth: '100vw', margin: 'auto', backgroundColor: 'black'}}>
          {!this.state.imageLoaded && <i className="fa fa-circle-o-notch fa-spin fa-fw" style={{
            position: 'absolute',
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
            margin: 'auto',
            zIndex: 100,
            width: 30,
            height: 30,
            opacity:  1,
            color: '#AAA',
            fontSize: '2em',
          }} />}
          <MinusIcon
            color="#FFF"
            title="Zoom out"
            onClick={this.onZoomOut.bind(this)}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 40,
              cursor: ( this.state.scale > MIN_SCALE ? 'pointer' : 'auto' ),
              zIndex: 100,
              width: 20,
              height: 20,
              opacity: this.state.imageLoaded ? ( this.state.scale > MIN_SCALE ? 0.8 : 0.4 ) : 0,
              filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))',
            }}/>
          <PlusIcon
            color="#FFF"
            title="Zoom in"
            onClick={this.onZoomIn.bind(this)}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              cursor: ( this.state.scale < MAX_SCALE ? 'pointer' : 'auto' ),
              zIndex: 100,
              width: 20,
              height: 20,
              opacity: this.state.imageLoaded ? ( this.state.scale < MAX_SCALE ? 0.8 : 0.4 ) : 0,
              filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))',
            }} />
          <div style={this.state.wrapperStyle} ref="image_wrapper">
            <div style={this.state.secondWrapper}>
              <img
                ref="lightbox_image_node"
                className={this.state.scale === MIN_SCALE ? `${this.props.className} not_scaled_image` : this.props.className}
                sizes={this.state.scale === MIN_SCALE ? this.props.sizes : undefined}
                alt={this.props.alt}
                src={this.props.src}
                {...imgSize}
                srcSet={this.props.srcset}
                style={imageStyle}
                draggable="false"
                onClick={this.props.onClickImage}
                onDoubleClick={this.onImageDoubleClick.bind(this)}
                onMouseDown={this.onImageMouseDown.bind(this)}
                onTouchStart={this.onImageTouch.bind(this)}
              />
            </div>
          </div>
        </div>
      </div>);
  }

}

Image.propTypes = {
  alt: PropTypes.func,
  className: PropTypes.string.isRequired,
  heightOffset: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  sizes: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  srcset: PropTypes.array,
  style: PropTypes.object.isRequired,
};