import React from "react";

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <div className="rounded-lg p-4 bg-white shadow border-l-4 border-blue-400 mb-2">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-blue-800">{event.title}</div>
      <span className="text-xs text-gray-400">{event.date}</span>
    </div>
    <div className="text-gray-600 text-sm mt-1">{event.description}</div>
  </div>
);

export default EventCard;
