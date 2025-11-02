import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ThreeColumnLayout } from './ThreeColumnLayout';

describe('ThreeColumnLayout', () => {
  describe('Rendering', () => {
    it('should render all three panels with children', () => {
      render(
        <ThreeColumnLayout
          leftPanel={<div>Left Content</div>}
          centerPanel={<div>Center Content</div>}
          rightPanel={<div>Right Content</div>}
        />
      );

      expect(screen.getByText('Left Content')).toBeInTheDocument();
      expect(screen.getByText('Center Content')).toBeInTheDocument();
      expect(screen.getByText('Right Content')).toBeInTheDocument();
    });

    it('should render with resizable panel group', () => {
      const { container } = render(
        <ThreeColumnLayout
          leftPanel={<div>Left</div>}
          centerPanel={<div>Center</div>}
          rightPanel={<div>Right</div>}
        />
      );

      // ResizablePanelGroup should have data-slot attribute
      const panelGroup = container.querySelector('[data-slot="resizable-panel-group"]');
      expect(panelGroup).toBeInTheDocument();
    });

    it('should render three resizable panels', () => {
      const { container } = render(
        <ThreeColumnLayout
          leftPanel={<div>Left</div>}
          centerPanel={<div>Center</div>}
          rightPanel={<div>Right</div>}
        />
      );

      // Should have three panels
      const panels = container.querySelectorAll('[data-slot="resizable-panel"]');
      expect(panels).toHaveLength(3);
    });

    it('should render two resize handles between panels', () => {
      const { container } = render(
        <ThreeColumnLayout
          leftPanel={<div>Left</div>}
          centerPanel={<div>Center</div>}
          rightPanel={<div>Right</div>}
        />
      );

      // Should have two resize handles (between left-center and center-right)
      const handles = container.querySelectorAll('[data-slot="resizable-handle"]');
      expect(handles).toHaveLength(2);
    });

    it('should accept className prop', () => {
      const { container } = render(
        <ThreeColumnLayout
          leftPanel={<div>Left</div>}
          centerPanel={<div>Center</div>}
          rightPanel={<div>Right</div>}
          className="custom-class"
        />
      );

      const panelGroup = container.querySelector('[data-slot="resizable-panel-group"]');
      expect(panelGroup?.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('Panel Content', () => {
    it('should render complex content in each panel', () => {
      render(
        <ThreeColumnLayout
          leftPanel={
            <div>
              <h2>Left Panel</h2>
              <p>Left content</p>
            </div>
          }
          centerPanel={
            <div>
              <h2>Center Panel</h2>
              <p>Center content</p>
            </div>
          }
          rightPanel={
            <div>
              <h2>Right Panel</h2>
              <p>Right content</p>
            </div>
          }
        />
      );

      expect(screen.getByRole('heading', { name: 'Left Panel' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Center Panel' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Right Panel' })).toBeInTheDocument();
      expect(screen.getByText('Left content')).toBeInTheDocument();
      expect(screen.getByText('Center content')).toBeInTheDocument();
      expect(screen.getByText('Right content')).toBeInTheDocument();
    });

    it('should handle empty panels gracefully', () => {
      render(
        <ThreeColumnLayout
          leftPanel={<div></div>}
          centerPanel={<div>Center Only</div>}
          rightPanel={<div></div>}
        />
      );

      expect(screen.getByText('Center Only')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      render(
        <ThreeColumnLayout
          leftPanel={<nav aria-label="Navigation">Left Nav</nav>}
          centerPanel={<main>Main Content</main>}
          rightPanel={<aside>Sidebar</aside>}
        />
      );

      expect(screen.getByRole('navigation', { name: 'Navigation' })).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  });
});
