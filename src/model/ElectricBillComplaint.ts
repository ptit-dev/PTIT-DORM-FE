export interface ElectricBillComplaint {
  id: string;
  electric_bill_id: string;
  student_name?: string;
  student_id?: string;
  note: string;
  proof?: string;
  created_at?: string;
  status: 'pending' | 'accepted' | 'rejected';
}
