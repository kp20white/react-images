import React, { Component, PropTypes } from 'react';
import MinusIcon from '../icons/minus';
import PlusIcon from '../icons/plus';

const MIN_SCALE = 1.0;
const MAX_SCALE = 3.0;

export default class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: MIN_SCALE,
      wrapperStyle: {position: 'relative'},
    };
  }

  onZoomIn(e) {
    console.log('image_wrapper clientHeight', this.refs.image_wrapper.clientHeight);
    this.setState({scale: this.state.scale + 1.0});
  }

  onZoomOut(e) {
    console.log('image_wrapper clientHeight', this.refs.image_wrapper.clientHeight);
    this.setState({scale: this.state.scale - 1.0});
  }

  render()
  {
    return (<div style={this.state.wrapperStyle} ref="image_wrapper">
      <img
        className={this.props.className}
        onClick={this.props.onClickImage}
        sizes={this.props.sizes}
        alt={this.props.alt}
        src={this.props.src}
        srcSet={this.props.srcset}
        style={this.props.style}
      />
      {this.state.scale > MIN_SCALE &&
        <MinusIcon
          color="#FFF"
          title="Zoom out"
          onClick={this.onZoomOut.bind(this)}
          style={{
            position: 'absolute',
            bottom: 40,
            right: 10,
            cursor: 'pointer',
            zIndex: 100,
            width: 20,
            height: 20,
            opacity: 0.8,
            filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))',
          }}/>
      }
      {this.state.scale < MAX_SCALE &&
        <PlusIcon
          color="#FFF"
          title="Zoom in"
          onClick={this.onZoomIn.bind(this)}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            cursor: 'pointer',
            zIndex: 100,
            width: 20,
            height: 20,
            opacity: 0.8,
            filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))'
          }} />
      }
    </div>);
  }

}

Image.propTypes = {
  alt: PropTypes.func,
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  sizes: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  srcset: PropTypes.array,
  style: PropTypes.object.isRequired,
};

/*
Image.defaultProps = {
  preload: "auto",
};*/
