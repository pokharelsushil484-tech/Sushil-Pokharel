
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
// Explicitly extending React.Component to resolve missing property errors for setState and props
export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly defining state property for proper TypeScript inference
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
  }

  private handleReset = () => {
    // Accessing setState from this context (available on React.Component)
    this.setState({ hasError: false, error: null });
  };

  public render() {
    // Accessing state from this context (available on React.Component)
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

    // Accessing props from this context (available on React.Component)
    return this.props.children;
  }
}
