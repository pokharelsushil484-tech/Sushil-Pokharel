
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../views/ErrorPage';
import { storageService } from '../services/storageService';

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
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // RECORD VIOLATION: System instability decreases node integrity
    const username = sessionStorage.getItem('active_session_user');
    if (username) {
        storageService.recordViolation(username, "UI_FAULT", `UI Crash Detected: ${error.message}`);
    }
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const details = this.state.error ? String(this.state.error) : "Unknown Application Error";
      return (
        <ErrorPage 
          type="CRASH" 
          errorDetails={details} 
          onAction={this.handleReset}
          actionLabel="Attempt Recovery"
        />
      );
    }

    return (this as any).props.children;
  }
}
