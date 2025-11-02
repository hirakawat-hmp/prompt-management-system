'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

export interface ThreeColumnLayoutProps {
  /** Content for the left panel */
  leftPanel: React.ReactNode;
  /** Content for the center panel */
  centerPanel: React.ReactNode;
  /** Content for the right panel */
  rightPanel: React.ReactNode;
  /** Optional className for the panel group */
  className?: string;
  /** Width of the left sidebar in pixels (default: 280px) */
  leftSidebarWidth?: number;
  /** Default size for center panel (percentage) */
  centerPanelDefaultSize?: number;
  /** Default size for right panel (percentage) */
  rightPanelDefaultSize?: number;
  /** Minimum size for center panel (percentage) */
  centerPanelMinSize?: number;
  /** Minimum size for right panel (percentage) */
  rightPanelMinSize?: number;
  /** Maximum size for right panel (percentage) */
  rightPanelMaxSize?: number;
}

/**
 * ThreeColumnLayout Component
 *
 * A three-column layout with:
 * - Collapsible fixed-width left sidebar (projects)
 * - Resizable center and right panels
 *
 * @example
 * ```tsx
 * <ThreeColumnLayout
 *   leftPanel={<nav>Projects</nav>}
 *   centerPanel={<main>Node View</main>}
 *   rightPanel={<aside>Details</aside>}
 * />
 * ```
 */
export function ThreeColumnLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  className,
  leftSidebarWidth = 280,
  centerPanelDefaultSize = 50,
  rightPanelDefaultSize = 50,
  centerPanelMinSize = 30,
  rightPanelMinSize = 20,
  rightPanelMaxSize = 50,
}: ThreeColumnLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className={cn('flex h-full w-full', className)}>
      {/* Left Sidebar - Fixed width, collapsible */}
      <div
        className={cn(
          'h-full border-r border-border transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-[280px]' : 'w-0'
        )}
        style={{ width: isSidebarOpen ? `${leftSidebarWidth}px` : '0px' }}
      >
        <div
          className={cn(
            'h-full overflow-hidden transition-opacity duration-300',
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="h-full overflow-auto">{leftPanel}</div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-2 top-2 z-10 h-8 w-8"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <PanelLeft className={cn('h-4 w-4 transition-transform', !isSidebarOpen && 'rotate-180')} />
        </Button>
      </div>

      {/* Right side - Resizable center and right panels */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Center Panel */}
          <ResizablePanel
            defaultSize={centerPanelDefaultSize}
            minSize={centerPanelMinSize}
          >
            <div className="h-full overflow-auto">{centerPanel}</div>
          </ResizablePanel>

          {/* Resize Handle (between center and right) */}
          <ResizableHandle withHandle />

          {/* Right Panel */}
          <ResizablePanel
            defaultSize={rightPanelDefaultSize}
            minSize={rightPanelMinSize}
            maxSize={rightPanelMaxSize}
          >
            <div className="h-full overflow-auto">{rightPanel}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
