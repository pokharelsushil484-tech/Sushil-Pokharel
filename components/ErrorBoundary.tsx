
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../views/ErrorPage';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors in the component tree.
 */
// Fix: Explicitly extend Component from 'react' so that TypeScript correctly identifies it as a React component class, 
// providing access to this.state, this.props, and this.setState, and validating the override modifier.
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Fix: state property is now recognized as inherited from Component
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Fix: override is valid because Component defines this lifecycle method
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // Fix: setState is now recognized as inherited from Component
    this.setState({ hasError: false, error: null });
  };

  // Fix: override is valid because Component defines render
  public override render() {
    // Fix: state and props are now recognized as inherited members
    if (this.state.hasError) {
      // Ensure errorDetails is a string to prevent React Error #31
      const details = this.state.error ? String(this.state.error) : "Unknown Application Error";
      return (
        <ErrorPage 
          type="CRASH" 
          errorDetails={details} 
          onAction={this.handleReset}
          actionLabel="Try Again"
        />
      );
    }

    return this.props.children;
  }
}
