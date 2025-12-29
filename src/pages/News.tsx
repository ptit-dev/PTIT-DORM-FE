import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const News: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="w-full max-w-7xl">


            {/* Tabs */}
            <div className="mb-4 border-b border-gray-200 overflow-x-auto">
              <div className="flex flex-nowrap gap-1">
                {[
                  "Tất cả",
                  "Tin tức & thông báo",
                  "Tin Giáo vụ",
                  "Tin tức chung",
                  "Tuyển sinh SDH",
                ].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                      index === 0
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-600 hover:text-red-600 hover:border-red-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Featured article */}
              <article className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2">
                  <img
                    src="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=300&fit=crop"
                    alt="Featured News"
                    className="w-full h-56 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-5 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                      Đoàn công tác Sở Khoa học và Công nghệ tỉnh Cao Bằng thăm và làm việc tại Học viện Công nghệ Bưu chính Viễn thông
                    </h2>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      Ngày 13/6/2025, tại Hà Nội, đoàn công tác của Sở Khoa học và Công nghệ tỉnh Cao Bằng do đồng chí Nông Thị Thanh Huyền, Giám đốc làm trưởng đoàn đã đến thăm và làm việc tại Học viện Công nghệ Bưu chính Viễn thông...
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="inline-flex items-center gap-1">
                      <i className="fas fa-calendar" /> 13/06/2025
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <i className="fas fa-tag" /> Tin tức chung
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <i className="fas fa-eye" /> Lượt xem
                    </span>
                  </div>
                </div>
              </article>

              {/* News list */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                {[ 
                  {
                    title:
                      "Đại hội Đảng bộ Học viện Công nghệ Bưu chính Viễn thông lần thứ VIII, nhiệm kỳ 2025 – 2030",
                    date: "12/06/2025",
                    category: "Tin tức chung",
                    image:
                      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=80&h=60&fit=crop",
                  },
                  {
                    title:
                      "Học viện Công nghệ Bưu chính Viễn thông kết nối hợp tác với Viện Hỗ trợ khởi nghiệp KAIST (Hàn Quốc)",
                    date: "12/06/2025",
                    category: "Tin tức chung",
                    image:
                      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=80&h=60&fit=crop",
                  },
                  {
                    title:
                      "Tọa đàm Công nghệ Chiến lược Úc-Việt tại PTIT: \"Các Công nghệ Kết nối cho Tương lai\"",
                    date: "12/06/2025",
                    category: "Tin tức chung",
                    image:
                      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=60&fit=crop",
                  },
                //   {
                //     title: "Hội nghị công bố quyết định về công tác cán bộ",
                //     date: "11/06/2025",
                //     category: "Tin tức chung",
                //     image:
                //       "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=80&h=60&fit=crop",
                //   },
                //   {
                //     title:
                //       "PTIT và Đại học Công nghệ Sydney UTS sẽ thúc đẩy hợp tác mạnh mẽ hơn nữa",
                //     date: "11/06/2025",
                //     category: "Tin tức chung",
                //     image:
                //       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=60&fit=crop",
                //   },
                //   {
                //     title:
                //       "Ra mắt Trung tâm Công nghệ chiến lược Úc – Việt và công bố tài trợ 8 dự án tiềm năng",
                //     date: "11/06/2025",
                //     category: "Tin tức chung",
                //     image:
                //       "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=80&h=60&fit=crop",
                //   },
                ].map((item) => (
                  <article
                    key={item.title}
                    className="flex gap-3 cursor-pointer group hover:bg-gray-50 rounded-lg p-2 transition-colors duration-150"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-16 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <i className="fas fa-clock" /> {item.date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </div>

            {/* More news grid */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tin tức khác</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[
                  {
                    title:
                      "PTIT tổ chức Lễ khen thưởng sinh viên có thành tích cao trong các kỳ thi cấp Quốc gia, Quốc tế năm 2025",
                    date: "23/12/2025",
                    category: "Tin tức chung",
                    image:
                      "https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?w=400&h=240&fit=crop",
                  },
                  {
                    title:
                      "PTIT ra mắt 2 trung tâm đào tạo chuyên sâu AI và vi mạch bán dẫn",
                    date: "22/12/2025",
                    category: "Tin tức & thông báo",
                    image:
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=240&fit=crop",
                  },
                  {
                    title:
                      "Hội thảo khoa học \"Ứng dụng trí tuệ nhân tạo trong giáo dục và đào tạo\"",
                    date: "21/12/2025",
                    category: "Nghiên cứu khoa học",
                    image:
                      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=240&fit=crop",
                  },
                  {
                    title:
                      "Lễ tốt nghiệp và trao bằng tốt nghiệp đại học khóa 2021-2025",
                    date: "20/12/2025",
                    category: "Tin Giáo vụ",
                    image:
                      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=240&fit=crop",
                  },
                  {
                    title:
                      "Thông báo lịch thi cuối kỳ học kỳ II năm học 2024-2025",
                    date: "19/12/2025",
                    category: "Tin Giáo vụ",
                    image:
                      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=240&fit=crop",
                  },
                  {
                    title:
                      "Chương trình tuyển sinh đại học chính quy năm 2025",
                    date: "18/12/2025",
                    category: "Tuyển sinh SDH",
                    image:
                      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=240&fit=crop",
                  },
                ].map((item) => (
                  <article
                    key={item.title}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-150 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                        Học viện Công nghệ Bưu chính Viễn thông liên tục đẩy mạnh các hoạt động đào tạo, nghiên cứu khoa học và hợp tác quốc tế, mang đến nhiều cơ hội học tập và phát triển cho sinh viên.
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <i className="fas fa-clock" /> {item.date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Pagination */}
            <nav className="mt-8 flex items-center justify-between flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-left" />
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`w-9 h-9 rounded-full text-sm font-medium border ${
                      page === 1
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-2">...</span>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full text-sm font-medium border bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                >
                  290
                </button>
                <button
                  type="button"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-right" />
                </button>
              </div>
              <span className="text-xs md:text-sm text-gray-500">10 / trang</span>
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
};

export default News;
