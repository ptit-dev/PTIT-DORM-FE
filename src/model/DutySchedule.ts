import { Staff } from "./Staff";

export interface DutySchedule {
  id: string;
  date: string;
  area_id: string;
  description: string;
  staff: Staff;
}
