import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getDormAreas } from "@/features/auth/api";

const DormArea: React.FC = () => {
	const [areas, setAreas] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

	useEffect(() => {
		const token = localStorage.getItem("ptit_access_token");
		setLoading(true);
		getDormAreas(token)
			.then((res) => setAreas(res))
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Header user={user} />
			<div className="flex flex-1">
				<Sidebar roles={user?.roles} />
				<main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
					<div className="max-w-7xl mx-auto">
						<h2 className="text-3xl font-bold text-center mb-8 tracking-wide text-red-700">Danh sách các khu ký túc xá</h2>
						{loading ? (
							<div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
						) : error ? (
							<div className="text-red-500 text-lg text-center py-10">{error}</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{areas.map((area) => (
									<div
										key={area.id}
										className="bg-white rounded-2xl shadow-lg border border-red-100 p-0 flex flex-col hover:shadow-2xl transition overflow-hidden"
									>
										<div className="relative w-full h-48 bg-gray-100">
											<img
												src={area.image}
												alt={area.name}
												className="object-cover w-full h-full"
											/>
											{area.status === "active" ? (
												<span className="absolute top-3 right-3 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Đang hoạt động</span>
											) : (
												<span className="absolute top-3 right-3 bg-gray-300 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow">Tạm dừng</span>
											)}
										</div>
										<div className="flex-1 flex flex-col p-6 gap-2">
											<div className="flex items-center gap-3 mb-1">
												<div className="text-2xl font-bold text-red-700">{area.name}</div>
												<div className="text-sm bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold">{area.branch}</div>
											</div>
											<div className="text-gray-700 text-[15px] mb-1"><span className="font-semibold text-red-700">Địa chỉ:</span> {area.address}</div>
											<div className="text-gray-700 text-[15px] mb-1"><span className="font-semibold text-red-700">Giá phòng:</span> <span className="text-lg font-bold text-red-700">{area.fee.toLocaleString()}đ</span> /tháng</div>
											<div className="text-gray-700 text-[15px] mb-2"><span className="font-semibold text-red-700">Mô tả:</span> {area.description}</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

export default DormArea;
