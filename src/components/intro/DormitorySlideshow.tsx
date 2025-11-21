import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Building, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dormitoryB1 from "@/assets/B1.jpg";
import dormitoryB2 from "@/assets/B2.jpg";
import dormitoryB5 from "@/assets/B5.jpg";
import dormitoryNT from "@/assets/NT.jpg";

const dormitoryData = [
  {
    id: 1,
    name: "Ký túc xá B1",
    image: dormitoryB1,
    description: "Tòa nhà hiện đại với đầy đủ tiện nghi, phục vụ sinh viên nam và nữ, sinh viên quốc tế",
    capacity: "500 sinh viên",
    facilities: ["Wifi miễn phí", "Phòng học tự học", "Căng tin", "Bảo vệ 24/7"],
    location: "Khu vực Trần Phú, Hà Đông (trong trường) - Campus chính"
  },
  {
    id: 2,
    name: "Ký túc xá B2", 
    image: dormitoryB2,
    description: "Khu phức hợp ký túc xá với môi trường học tập lý tưởng",
    capacity: "600 sinh viên",
    facilities: ["Phòng giặt tự động", "Sân thể thao", "Thư viện mini", "Phòng sinh hoạt"],
    location: "Khu vực Trần Phú, Hà Đông ( ngoài trường ) - Campus chính"
  },
  {
    id: 3,
    name: "Ký túc xá B5",
    image: dormitoryB5, // Reusing image for demo
    description: "Tòa nhà mới nhất với thiết kế hiện đại và thân thiện môi trường",
    capacity: "400 sinh viên", 
    facilities: ["Thang máy", "Phòng tập gym", "Khu vực BBQ", "Hệ thống điều hòa"],
    location: "Khu vực Trần Phú, Hà Đông (trong trường) - Campus chính"
  },
  {
    id: 4,
    name: "Ký túc xá Ngọc Trục",
    image: dormitoryNT, // Reusing image for demo
    description: "Khu ký túc xá rộng rãi với không gian xanh thoáng mát",
    capacity: "800 sinh viên",
    facilities: ["Khu vui chơi", "Sân bóng đá", "Quán ăn", "Trạm y tế"],
    location: "Khu vực Ngọc Trục - Campus phụ"
  }
];

const DormitorySlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % dormitoryData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % dormitoryData.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + dormitoryData.length) % dormitoryData.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const currentDorm = dormitoryData[currentSlide];

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <Card className="overflow-hidden shadow-card border-0">
        <div className="relative">
          {/* Image Container */}
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            <img
              src={currentDorm.image}
              alt={currentDorm.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Navigation Buttons */}
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={nextSlide}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">{currentDorm.name}</h3>
            <p className="text-lg opacity-90 mb-4">{currentDorm.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{currentDorm.capacity}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{currentDorm.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>{currentDorm.facilities.length} tiện ích</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary mb-3">Tiện ích nổi bật</h4>
              <ul className="space-y-2">
                {currentDorm.facilities.map((facility, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-3">Thông tin chi tiết</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Sức chứa:</strong> {currentDorm.capacity}</div>
                <div><strong>Vị trí:</strong> {currentDorm.location}</div>
                <div><strong>Loại hình:</strong> Ký túc xá sinh viên</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {dormitoryData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-primary scale-110' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DormitorySlideshow;