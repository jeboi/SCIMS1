import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = ({ open, onOpenChange, trigger, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef(null);
  
  const isControlled = open !== undefined;
  const isOpenState = isControlled ? open : isOpen;
  const setIsOpenState = isControlled ? onOpenChange : setIsOpen;

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpenState?.(false);
      }
    };
    
    if (isOpenState) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenState, setIsOpenState]);

  return (
    <div ref={popoverRef} className="relative inline-block">
      <div onClick={() => setIsOpenState?.(!isOpenState)}>
        {trigger}
      </div>
      {isOpenState && (
        <div className="absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const PopoverTrigger = ({ children }) => children;

const PopoverContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4", className)}
    {...props}
  >
    {children}
  </div>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };