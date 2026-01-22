
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
// Fix: Use the named Component import from react to ensure generic Props and State are correctly recognized by the TypeScript compiler.
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    // Fix: Initialize the base Component class correctly with super(props).
    super(props);
    // Fix: Explicitly initialize the state object on the class instance.
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Fix: Implement the static getDerivedStateFromError lifecycle method to update state when an error occurs.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Fix: Log the error using componentDidCatch for debugging or monitoring.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // Fix: Use an arrow function for handleReset to ensure 'this' refers to the class instance when calling this.setState.
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  // Fix: Implement the render method to return fallback UI when an error is detected.
  public render() {
    // Fix: Accessing state inherited from the base Component class.
    if (this.state.hasError) {
      // Fix: Safely convert error details to a string to avoid rendering issues.
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

    // Fix: Accessing children from the props inherited from the base Component class.
    return this.props.children;
  }
}
