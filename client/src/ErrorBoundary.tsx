import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  componentDidCatch(error: any) {
    this.setState({ hasError: true });
  }

  render() {
    return this.state.hasError ? (
      <div className="ta-center mt-5">
        Sorry, something went wrong. Try reloading page.
      </div>
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
