import React from 'react';

/**
 * Last line of defence: if one shape fails to render, skip just that shape instead of
 * taking the whole board (and the host page) down.
 */
export class ShapeBoundary extends React.Component<
  { id: string; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`[drawcustom] shape ${this.props.id} could not be drawn and was skipped`, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
