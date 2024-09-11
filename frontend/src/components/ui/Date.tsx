import React from "react";
import { parseISO, isValid, formatDistanceToNow, subMinutes } from "date-fns";

interface DateLabelProps {
  dateString: string | Date;
  addSuffix?: boolean;
}

const DateLabel: React.FC<DateLabelProps> = ({
  dateString,
  addSuffix = true,
}) => {
  let formattedDate = "-";

  try {
    let date: Date;

    if (dateString instanceof Date) {
      date = dateString;
    } else {
      date = parseISO(dateString);
    }

    if (isValid(date)) {
      if (dateString instanceof Date) {
        formattedDate = formatDistanceToNow(date, { addSuffix });
      } else {
        const utcDate = subMinutes(date, date.getTimezoneOffset());
        formattedDate = formatDistanceToNow(utcDate, { addSuffix });
      }
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }

  return <span className="text-gray-800 font-medium">{formattedDate}</span>;
};

export default DateLabel;
