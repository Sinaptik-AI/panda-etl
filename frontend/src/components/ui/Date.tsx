import React from "react";
import { format, parseISO, isValid } from "date-fns";

interface DateLabelProps {
  dateString: string;
  formatString?: string;
}

const DateLabel: React.FC<DateLabelProps> = ({
  dateString,
  formatString = "yyyy-MM-dd HH:mm",
}) => {
  let formattedDate = "Invalid Date";

  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      formattedDate = format(date, formatString);
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }

  return (
    <div className="flex items-center space-x-1 rounded-full shadow-sm">
      <span className="text-gray-800 font-medium">{formattedDate}</span>
    </div>
  );
};

export default DateLabel;
