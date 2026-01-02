export interface Contract {
  id: string | number;
  code?: string;
  student_id: string;
  room?: string;
  room_id?: string;
  building?: string;
  floor?: string;
  start_date?: string;
  end_date?: string;
  total_amount?: number;
  monthly_fee?: number;
  status: string;
  status_payment: string;
  image_bill?: string | NullableStringFromDB;
  note?: string;
  created_at?: string | number | Date;
  updated_at?: string | number | Date;
  dorm_application?: DormApplication;
}

export type NullableStringFromDB = {
  String?: string;
  Valid?: boolean;
} | null;

import { DormApplication } from './DormApplication';
