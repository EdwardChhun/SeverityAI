import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Get derived state when an error occurs
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Log error information
  componentDidCatch(error, info) {
    console.error("Error occurred:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again later.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
