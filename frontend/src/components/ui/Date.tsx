import React from "react";
import { parseISO, isValid, formatDistanceToNow } from "date-fns";

interface DateLabelProps {
  dateString: string;
  addSuffix?: boolean;
}

const DateLabel: React.FC<DateLabelProps> = ({
  dateString,
  addSuffix = true,
}) => {
  let formattedDate = "Invalid Date";

  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      formattedDate = formatDistanceToNow(date, { addSuffix });
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }

  return <span className="text-gray-800 font-medium">{formattedDate}</span>;
};

export default DateLabel;
