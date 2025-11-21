import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getMyRoomElectricBills } from "@/features/auth/studentElectricBillApi";

const paymentMap: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

const MyRoomElectricBills: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const token = localStorage.getItem("ptit_access_token") || "";

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const res = await getMyRoomElectricBills(token);
        setBills(res || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">Hóa đơn tiền điện phòng bạn</h2>
            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-red-500 text-lg text-center py-10">{error}</div>
            ) : bills.length === 0 ? (
              <div className="text-gray-400 text-center py-10">Chưa có hóa đơn nào.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">Tháng</th>
                      <th className="p-4 text-left">Chỉ số cũ</th>
                      <th className="p-4 text-left">Chỉ số mới</th>
                      <th className="p-4 text-left">Số tiền</th>
                      <th className="p-4 text-left">Thanh toán</th>
                      <th className="p-4 text-left">Minh chứng</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="p-4 font-semibold">{b.month}</td>
                        <td className="p-4">{b.prev_electric}</td>
                        <td className="p-4">{b.curr_electric}</td>
                        <td className="p-4">{b.amount?.toLocaleString()}đ</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{paymentMap[b.payment_status]}</span>
                        </td>
                        <td className="p-4">
                          {b.payment_proof ? (
                            <a href={b.payment_proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem</a>
                          ) : (
                            <span className="text-gray-400">Chưa có</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-row gap-3 min-w-[260px] justify-center">
                            <button
                              className="px-4 py-2 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
                              disabled={b.is_confirmed}
                              onClick={() => alert('Xác nhận hóa đơn (TODO)')}
                            >
                              {b.is_confirmed ? 'Đã xác nhận' : 'Xác nhận'}
                            </button>
                            <button
                              className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                              disabled={!b.is_confirmed || b.payment_status === 'paid'}
                              onClick={() => alert('Thanh toán hóa đơn (TODO)')}
                            >
                              {b.payment_status === 'paid' ? 'Đã thanh toán' : 'Thanh toán'}
                            </button>
                            <button
                              className="px-4 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                              onClick={() => alert('Khiếu nại hóa đơn (TODO)')}
                            >
                              Khiếu nại
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyRoomElectricBills;
