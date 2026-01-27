
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
// Use React.Component explicitly to ensure the compiler recognizes setState and props properties from the base class.
export class ErrorBoundary extends React.Component<Props, State> {
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
    // Fix: Access setState inherited from the React.Component base class.
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

    // Fix: Correctly access children from props inherited from the React.Component base class.
    return this.props.children;
  }
}
