import React from 'react';
import { Coffee, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-coffee-50 flex items-center justify-center p-4 sm:p-6 text-brand-coffee-950 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-pink-50 rounded-2xl flex items-center justify-center mx-auto border border-brand-pink-200 shadow-inner">
              <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-brand-pink-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-pink-600">
                Nathan Coffee • Since 1950s
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-brand-coffee-950">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-brand-coffee-700 leading-relaxed">
                We encountered an unexpected glitch while preparing your page. Please reload or return home to continue enjoying our fresh roast.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-pink-600 hover:bg-brand-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-900 font-bold text-xs sm:text-sm transition-colors border border-brand-coffee-200"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

