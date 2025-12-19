
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../views/ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fix: Directly extending 'Component' ensures proper type inheritance for React class components in TypeScript
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Here you could also log the error to an error reporting service
  }

  private handleReset = () => {
    // Fix: Accessing 'setState' which is inherited from 'Component'
    // Attempt to recover by resetting error state
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage 
          type="CRASH" 
          errorDetails={this.state.error?.toString()} 
          onAction={this.handleReset}
          actionLabel="Try Again"
        />
      );
    }

    // Fix: Accessing 'props' which is inherited from 'Component'
    return this.props.children;
  }
}
