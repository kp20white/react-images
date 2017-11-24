import React, { Component, PropTypes } from 'react';
import MinusIcon from '../icons/minus';
import PlusIcon from '../icons/plus';

const MIN_SCALE = 1.0;
const MAX_SCALE = 3.0;

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
      wrapperStyle: { },
      secondWrapper: { },
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
          wi = imageNode.offsetWidth;

        wrapperNode.scrollTop = (hi - hw)/2;
        wrapperNode.scrollLeft = (wi - ww)/2;
      }

    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.setState({
        scale: MIN_SCALE,
        imageLoaded: false,
        imageStyle: {
          maxHeight: `calc(100vh - ${nextProps.heightOffset}px)`,
        },
        wrapperStyle: {},
        secondWrapper: { },
      });
    }
  }

  onZoomIn() {
    if (this.state.scale >= MAX_SCALE) return;

    let wrapHeight = this.refs.image_wrapper.offsetHeight;
    let wrapWidth = this.refs.image_wrapper.offsetWidth;
    let newScale  = this.state.scale + 1.0;
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

  onZoomOut() {
    if (this.state.scale <= MIN_SCALE) return;

    let newScale  = this.state.scale - 1.0;
    if (newScale === 1.0) {
      this.setState({
        scale: MIN_SCALE,
        imageStyle: {
          maxHeight: `calc(100vh - ${this.props.heightOffset}px)`,
        },
        wrapperStyle: {},
        secondWrapper: { },
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

  render()
  {

    let imgSize = {};
    if (this.state.scale > 1.0) {
      imgSize.width = this.state.imageStyle.width;
      imgSize.height =  this.state.imageStyle.height;
    }

    let imageStyle = {...this.state.imageStyle};
    imageStyle.visibility = this.state.imageLoaded ? 'visible' : 'hidden';

    if (this.state.scale > 1) {
      imageStyle.cursor = 'all-scroll';
    }

    return (
      <div style={{position: 'relative', backgroundColor: 'black'}}>
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
            cursor: ( this.state.scale < MAX_SCALE ? 'pointer' : 'auto' ) ,
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
              className={this.props.className}
              onClick={this.props.onClickImage}
              sizes={this.state.scale === 1.0 ? this.props.sizes : undefined}
              alt={this.props.alt}
              src={this.props.src}
              {...imgSize}
              srcSet={this.props.srcset}
              style={imageStyle}
              draggable="false"
              onMouseDown={this.onImageMouseDown.bind(this)}
            />
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
  sizes: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  srcset: PropTypes.array,
  style: PropTypes.object.isRequired,
};