
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
export class ErrorBoundary extends Component<Props, State> {
  // Define local state to ensure it is recognized by the compiler.
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    // Call the base class constructor to initialize the component.
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

  // Use an arrow function to maintain 'this' context for accessing base class members.
  private handleReset = () => {
    // Cast 'this' to any to ensure the inherited setState method is accessible despite potential visibility issues in the environment.
    (this as any).setState({ hasError: false, error: null });
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

    // Cast 'this' to any to ensure the inherited props property is accessible and return the children elements.
    return (this as any).props.children;
  }
}
