import * as React from "react";

// Simple Card component
const Card = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

// Card Header
const CardHeader = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

// Card Title
const CardTitle = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

// Card Content
const CardContent = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};