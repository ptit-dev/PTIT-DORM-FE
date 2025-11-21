import React from "react";

export interface Course {
  id: string;
  name: string;
  code: string;
  status: "done" | "in-progress";
  progress: number; // 0-100
}

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => (
  <div className={`rounded-xl p-4 shadow bg-white border ${course.status === 'done' ? 'border-green-400' : 'border-yellow-300'} flex flex-col min-w-[220px] w-full max-w-xs`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs font-bold ${course.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>{course.status === 'done' ? 'Đã kết thúc' : 'Đang học'}</span>
      <span className="text-xs text-gray-400">{course.code}</span>
    </div>
    <div className="font-semibold text-gray-800 mb-1">{course.name}</div>
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div className={`h-2 rounded-full ${course.status === 'done' ? 'bg-green-400' : 'bg-yellow-300'}`} style={{ width: `${course.progress}%` }}></div>
    </div>
    <div className="text-xs text-right text-gray-500 mt-1">{course.progress}%</div>
  </div>
);

export default CourseCard;
