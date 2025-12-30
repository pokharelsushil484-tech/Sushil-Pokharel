
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../views/ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fix: Explicitly using React.Component to ensure proper type inheritance for class components in TypeScript
export class ErrorBoundary extends React.Component<Props, State> {
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
    // Fix: Inherited setState is now correctly typed as part of React.Component
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

    // Fix: Inherited props is now correctly typed as part of React.Component
    return this.props.children;
  }
}
