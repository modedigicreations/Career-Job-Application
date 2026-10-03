'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height?: number | string;
  maxHeight?: number | string;
  overscan?: number;
  className?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyComponent?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  height = 540,
  maxHeight,
  overscan = 4,
  className = '',
  renderItem,
  emptyComponent,
  keyExtractor
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(typeof height === 'number' ? height : 500);

  // Measure container height dynamically if height is string / percentage
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight || (typeof height === 'number' ? height : 500));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (items.length === 0) {
    return emptyComponent ? <>{emptyComponent}</> : null;
  }

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + viewportHeight) / itemHeight) + overscan);

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      item: items[i],
      index: i,
      offsetY: i * itemHeight
    });
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`overflow-y-auto relative contain-strict will-change-scroll ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
      }}
    >
      <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
        {visibleItems.map(({ item, index, offsetY }) => {
          const key = keyExtractor ? keyExtractor(item, index) : ((item as any)?.id || index);
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${itemHeight}px`,
                transform: `translate3d(0, ${offsetY}px, 0)`
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
