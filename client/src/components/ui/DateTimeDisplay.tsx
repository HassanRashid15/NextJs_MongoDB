"use client";

import React, { useState, useEffect } from "react";
import {
  formatDate,
  formatTime,
  formatDateTime,
  dateFormats,
} from "@/lib/utils";

interface DateTimeDisplayProps {
  date?: Date | string;
  type?:
    | "date"
    | "time"
    | "datetime"
    | "relative"
    | "short"
    | "long"
    | "timeOnly";
  showIcon?: boolean;
  className?: string;
  live?: boolean; // For live updating time
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  date,
  type = "datetime",
  showIcon = false,
  className = "",
  live = false,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time for live updates
  useEffect(() => {
    if (live) {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [live]);

  const getDisplayValue = () => {
    const displayDate = date || currentTime;

    switch (type) {
      case "date":
        return formatDate(displayDate);
      case "time":
        return formatTime(displayDate);
      case "datetime":
        return formatDateTime(displayDate);
      case "relative":
        return dateFormats.relative(displayDate);
      case "short":
        return dateFormats.short(displayDate);
      case "long":
        return dateFormats.long(displayDate);
      case "timeOnly":
        return dateFormats.timeOnly(displayDate);
      default:
        return formatDateTime(displayDate);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "time":
      case "timeOnly":
        return (
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "date":
        return (
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && getIcon()}
      <span className={live ? "font-mono" : ""}>{getDisplayValue()}</span>
    </div>
  );
};

export default DateTimeDisplay;
