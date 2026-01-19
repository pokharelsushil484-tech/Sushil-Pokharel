
import React, { ErrorInfo, ReactNode } from 'react';
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
// Fix: Use React.Component explicitly to ensure TypeScript correctly recognizes inheritance and provides access to state, props, and lifecycle methods.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Initialize state within constructor
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  // Handle errors caught during rendering or in lifecycle methods
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // Method to reset the error state and allow for re-render
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  // Render method returns the fallback UI or children
  public override render() {
    if (this.state.hasError) {
      // Ensure the error details are converted to a string for display
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
