import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        className={cn(
          "relative w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-sm text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>

        {/* Footer (optional) - can be added via children or custom */}
      </div>
    </div>
  );
};

// Modal Header (for custom header)
const ModalHeader = ({ className, children, ...props }) => (
  <div
    className={cn("flex items-center justify-between px-6 py-4 border-b border-gray-200", className)}
    {...props}
  >
    {children}
  </div>
);

// Modal Body
const ModalBody = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4", className)} {...props}>
    {children}
  </div>
);

// Modal Footer
const ModalFooter = ({ className, children, ...props }) => (
  <div
    className={cn("flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200", className)}
    {...props}
  >
    {children}
  </div>
);

// Modal Trigger (button that opens modal)
const ModalTrigger = ({ children, onClick, ...props }) => {
  const trigger = React.Children.only(children);
  return React.cloneElement(trigger, {
    onClick: (e) => {
      trigger.props.onClick?.(e);
      onClick?.(e);
    },
    ...props,
  });
};

export { Modal, ModalHeader, ModalBody, ModalFooter, ModalTrigger };