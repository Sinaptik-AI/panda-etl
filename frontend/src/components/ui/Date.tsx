import React from "react";
import { format } from "date-fns";

interface DateLabelProps {
  dateString: string;
  formatString?: string;
}

const DateLabel: React.FC<DateLabelProps> = ({
  dateString,
  formatString = "yyyy-MM-dd",
}) => {
  const date = new Date(dateString);
  return (
    <div className="flex items-center space-x-1 rounded-full shadow-sm">
      <span className="text-gray-800 font-medium">
        {format(date, formatString)}
      </span>
    </div>
  );
};

export default DateLabel;
