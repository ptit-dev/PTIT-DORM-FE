import React from "react";

interface BannerProps {
  name: string;
}

const WelcomeBanner: React.FC<BannerProps> = ({ name }) => (
  <div className="w-full bg-gradient-to-r from-red-100 to-pink-50 rounded-xl flex items-center p-6 mb-6 shadow">
    <div className="flex-1">
      <h2 className="text-2xl md:text-3xl font-bold text-red-700 mb-1">
        {name}
      </h2>
      <p className="text-gray-600 text-sm">Chúc bạn một ngày làm việc hiệu quả!</p>
    </div>
      <img
        src="https://slink.ptit.edu.vn/images/welcome.gif"
        alt="Welcome gif"
        className="h-[90px] w-auto object-contain select-none"
        draggable={false}
        style={{ minWidth: 80 }}
      />
  </div>
);

export default WelcomeBanner;
