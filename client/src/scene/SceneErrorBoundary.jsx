import { Component } from 'react';

/**
 * Hangganan ng pagkakamali para sa 3D hero.
 *
 * Ang WebGL ay enhancement lamang. Kung may bahagi ng scene na
 * matumit ng hindi inaasahan, dapat makita pa rin ng bisita ang
 * buong pahayagan sa ibaba — hindi isang itim na pahina.
 */
export class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(error) {
    console.error('[hero] scene error:', error);
    return { failed: true };
  }

  componentDidUpdate(prevProps) {
    // Kapag nagbago ang children (hal. StrictMode remount), subukang muli.
    if (this.state.failed && prevProps.children !== this.props.children) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default SceneErrorBoundary;