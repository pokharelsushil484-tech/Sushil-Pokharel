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
// Fix: Explicitly importing and extending Component from 'react' ensures that members like this.setState and this.props are correctly recognized as inherited properties.
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    // Initialize the base React Component class.
    super(props);
  }

  // Use the static getDerivedStateFromError lifecycle method to update the component state when an error occurs during rendering.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Use componentDidCatch to log error information for monitoring and debugging.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // Use an arrow function to ensure 'this' is bound correctly to the component instance when resetting state.
  private handleReset = () => {
    // Fix: Using this.setState correctly as an inherited member from the Component base class.
    this.setState({ hasError: false, error: null });
  };

  public render() {
    // Access state inherited from the base Component class to determine if fallback UI should be displayed.
    if (this.state.hasError) {
      // Safely convert the error object to a string for display in the ErrorPage component.
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

    // Fix: Correctly return children from props inherited from the base Component class.
    return this.props.children;
  }
}
