import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string | number | readonly string[];
  containerClassName?: string;
  iconClassName?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, containerClassName, iconClassName, value, ...props }, ref) => {
    const formatDateDisplay = (dateString: string | number | readonly string[] | undefined) => {
      if (!dateString || typeof dateString !== "string") return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return format(date, "dd/MM/yy");
      } catch (e) {
        return "";
      }
    };

    return (
      <div className={`relative ${containerClassName || ""}`}>
        <div
          className={`flex items-center border rounded-lg p-2 ${props.disabled ? "bg-gray-100" : "bg-white"} focus-within:ring-2 focus-within:ring-green-300 ${className || ""}`}
        >
          <span className={`text-gray-700 text-sm min-w-[80px] ${!value ? "text-gray-400" : ""}`}>
            {formatDateDisplay(value) || "dd/mm/yy"}
          </span>
          <CalendarIcon className={`h-4 w-4 text-gray-400 ml-auto ${iconClassName || ""}`} />
        </div>
        <input
          type="date"
          ref={ref}
          value={value}
          {...props}
          className={`absolute inset-0 opacity-0 w-full h-full ${props.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
