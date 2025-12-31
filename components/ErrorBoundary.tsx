import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../views/ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors in the component tree.
 * Fix: Explicitly inheriting from React.Component to resolve property access errors for setState and props.
 */
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
    // Fix: Accessing setState through 'this' works correctly with explicit React.Component inheritance
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

    // Fix: Accessing props through 'this' works correctly with explicit React.Component inheritance
    return this.props.children;
  }
}