"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeTime } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  type?: string;
}

interface ActivityDetailsModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

const getActivityIcon = (type?: string) => {
  switch (type) {
    case "profile":
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      );
    case "security":
      return (
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      );
    case "verification":
      return (
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    case "account":
      return (
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
  }
};

const getActivityColor = (type?: string) => {
  switch (type) {
    case "profile":
      return "border-blue-200 bg-blue-50";
    case "security":
      return "border-green-200 bg-green-50";
    case "verification":
      return "border-purple-200 bg-purple-50";
    case "account":
      return "border-orange-200 bg-orange-50";
    default:
      return "border-indigo-200 bg-indigo-50";
  }
};

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  if (!activity) return null;

  const activityDate = new Date(activity.timestamp);
  const relativeTime = formatRelativeTime(activity.timestamp);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getActivityIcon(activity.type)}
            <span>Activity Details</span>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this activity
          </DialogDescription>
        </DialogHeader>

        <div
          className={`rounded-lg border-2 p-4 ${getActivityColor(
            activity.type
          )}`}
        >
          <div className="space-y-4">
            {/* Activity Action */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Action
              </h3>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {activity.action}
              </p>
            </div>

            {/* Activity Details */}
            {activity.details && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Details
                </h3>
                <p className="text-gray-700 mt-1">{activity.details}</p>
              </div>
            )}

            {/* Timestamp Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  When
                </h3>
                <p className="text-gray-700 mt-1 text-sm">{relativeTime}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Exact Time
                </h3>
                <p className="text-gray-700 mt-1 text-sm">
                  {activityDate.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Activity ID */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Activity ID
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {activity.id}
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailsModal;
