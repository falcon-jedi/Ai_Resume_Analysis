'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { cn } from '@/app/app/_util/cn';

const ResizablePanelGroup = ({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) => (
  <ResizablePrimitive.Group
    orientation={orientation}
    className={cn('flex h-full w-full data-[group-orientation=vertical]:flex-col', className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.Separator
    className={cn(
      'relative flex w-[3px] items-center justify-center bg-[#ddc0bd] hover:bg-[#7a1f1f] active:bg-[#7a1f1f] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7a1f1f] z-30 cursor-col-resize select-none data-[separator-orientation=vertical]:h-[3px] data-[separator-orientation=vertical]:w-full data-[separator-orientation=vertical]:cursor-row-resize',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-40 flex h-7 w-4 items-center justify-center rounded-sm border border-[#ddc0bd] bg-[#FFF8EE] shadow-sm hover:bg-[#fff0ed] transition-colors">
        <GripVertical className="h-3 w-3 text-[#564240]" />
      </div>
    )}
  </ResizablePrimitive.Separator>
);

const ssrSafeStorage: ResizablePrimitive.LayoutStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

const useDefaultLayout = (props: Parameters<typeof ResizablePrimitive.useDefaultLayout>[0]) => {
  return ResizablePrimitive.useDefaultLayout({
    storage: ssrSafeStorage,
    ...props,
  });
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle, useDefaultLayout };
