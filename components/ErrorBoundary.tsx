
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
// Fix: Explicitly extending React.Component ensures that 'setState', 'props', and 'state' are correctly recognized as inherited members by TypeScript.
export class ErrorBoundary extends React.Component<Props, State> {
  // Define initial state
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
    // Fix: Accessing setState from the base class React.Component.
    this.setState({ hasError: false, error: null });
  };

  public render() {
    // Fix: Accessing state and props inherited from React.Component.
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

    return this.props.children;
  }
}
