import React, { ErrorInfo } from "react";

interface IErrorBoundaryState {
    error?: Error,
}

export class ErrorBoundary<P> extends React.Component<P, IErrorBoundaryState> {
    constructor(props: PageTransitionEventInit) {
        super(props as any);
        this.state = {};
    }

    static getDerivedStateFromError(error: Error): IErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error(error, errorInfo);
    }

    render() {
        let { error } = this.state;
        if(error) {
            return (
                <>
                    <div>{error.name}</div>
                    <div>{error.message}</div>
                    <pre>{error.stack}</pre>
                </>
            );
        }

        return this.props.children;
    }
}