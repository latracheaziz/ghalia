import { Component } from 'react'

/** Keeps a failed page or 3D scene from taking the whole site down. */
export class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    if (this.props.fallback !== undefined) return this.props.fallback
    return (
      <main id="main" className="wrap section" data-theme="paper" style={{ minHeight: '70vh' }}>
        <h1 className="display t-title">GHALIA</h1>
        <p className="t-lead" style={{ marginBlock: '1.5rem' }}>Something went wrong. Please refresh the page.</p>
        <a className="link" href="/">Return home</a>
      </main>
    )
  }
}
