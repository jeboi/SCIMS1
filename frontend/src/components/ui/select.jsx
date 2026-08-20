import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Main Select component with context
const SelectContext = React.createContext({});

const Select = ({ children, value, onValueChange, defaultValue, ...props }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectedValue = value !== undefined ? value : internalValue;
  const setSelectedValue = onValueChange || setInternalValue;

  const contextValue = {
    value: selectedValue,
    onValueChange: setSelectedValue,
    isOpen,
    setIsOpen,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative w-full" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// Select Trigger (the visible button)
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

// Select Value (displays the selected value)
const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span ref={ref} className={cn("block truncate", className)} {...props}>
      {value || placeholder || "Select..."}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

// Select Content (the dropdown menu)
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in-80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

// Select Item (individual option)
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100",
        isSelected && "bg-gray-100 text-blue-600",
        className
      )}
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
};