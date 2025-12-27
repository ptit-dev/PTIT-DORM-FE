export interface Course {
  id: string;
  name: string;
  code: string;
  status: "done" | "in-progress";
  progress: number; // 0-100
}
