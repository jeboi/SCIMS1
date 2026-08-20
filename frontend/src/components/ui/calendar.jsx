import * as React from "react";
import { cn } from "@/lib/utils";

const Calendar = ({ mode = "single", selected, onSelect, className, ...props }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const handleDateClick = (date) => {
    if (mode === "single") {
      onSelect?.(date);
    }
  };
  
  const isSelected = (date) => {
    if (!selected) return false;
    return date?.toDateString() === selected.toDateString();
  };
  
  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <span className="font-medium">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
        {days.map((date, index) => (
          <div key={index}>
            {date && (
              <button
                onClick={() => handleDateClick(date)}
                className={cn(
                  "w-full text-center py-1 rounded-full text-sm hover:bg-gray-100 transition-colors",
                  isSelected(date) && "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Calendar };