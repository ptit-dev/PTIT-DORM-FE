import React from "react";

export interface Notification {
  id: string;
  title: string;
  date: string;
  content: string;
  isNew?: boolean;
}

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => (
  <div className={`rounded-lg p-4 bg-white shadow border-l-4 ${notification.isNew ? 'border-red-500' : 'border-gray-200'} mb-2`}>
    <div className="flex items-center justify-between">
      <div className="font-semibold text-gray-800">{notification.title}</div>
      <span className="text-xs text-gray-400">{notification.date}</span>
    </div>
    <div className="text-gray-600 text-sm mt-1">{notification.content}</div>
    {notification.isNew && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">Mới</span>}
  </div>
);

export default NotificationCard;
