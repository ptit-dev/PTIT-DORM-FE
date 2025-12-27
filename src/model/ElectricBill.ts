export interface ElectricBill {
  id: string;
  area_id?: string;
  room_id: string;
  month: string;
  prev_electric: number | null;
  curr_electric: number | null;
  amount: number | null;
  is_confirmed: boolean;
  payment_status: 'unpaid' | 'paid';
  payment_proof?: string;
}
