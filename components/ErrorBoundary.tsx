"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-black text-white gap-4">
          <p className="text-lg text-white/60">
            Something went wrong. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
