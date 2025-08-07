import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 200,
  className = '',
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState(position);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x, y;
    let placement = position;

    // Calculate available space in each direction
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;

    // Determine optimal placement with better logic
    if (placement === 'top' && spaceAbove < tooltipRect.height + 20) {
      placement = 'bottom';
    } else if (placement === 'bottom' && spaceBelow < tooltipRect.height + 20) {
      placement = 'top';
    }

    // Calculate position based on placement with better offsets
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - 12;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.bottom + 12;
        break;
      case 'left':
        x = triggerRect.left - 12;
        y = triggerRect.top + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 12;
        y = triggerRect.top + triggerRect.height / 2;
        break;
      default:
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - 12;
    }

    // Ensure tooltip stays within viewport with better margins
    if (x + tooltipRect.width / 2 > viewportWidth - 20) {
      x = viewportWidth - tooltipRect.width / 2 - 20;
    } else if (x - tooltipRect.width / 2 < 20) {
      x = tooltipRect.width / 2 + 20;
    }

    if (y + tooltipRect.height > viewportHeight - 20) {
      y = viewportHeight - tooltipRect.height - 20;
    } else if (y < 20) {
      y = 20;
    }

    setTooltipPosition({ x, y });
    setTooltipPlacement(placement);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Recalculate position after a brief delay to ensure tooltip is rendered
      setTimeout(calculatePosition, 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
    setTimeout(calculatePosition, 10);
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, position, calculatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={disabled ? -1 : 0}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`dashboard-tooltip dashboard-tooltip--${tooltipPlacement}`}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
          role="tooltip"
          aria-hidden="true"
        >
          <div className="tooltip-content">
            {content}
          </div>
          <div className={`tooltip-arrow tooltip-arrow--${tooltipPlacement}`}></div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
