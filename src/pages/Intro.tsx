import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Building2, Phone, Mail, MapPin, UserPlus } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DormitorySlideshow from "@/components/intro/DormitorySlideshow";
import RegistrationModal from "@/components/forms/RegistrationModal";
import ptitBuilding from "@/assets/ptit-building.jpg";
import ptitBuilding2 from "@/assets/Toa_nha_A2_PTIT.jpg";

const Intro = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("ptit_user") || "null");
  });
  console.log("Intro user:");
  const stats = [
    {
      icon: <Building2 className="h-8 w-8 text-primary" />,
      title: "4 Tòa ký túc xá",
      description: "B1, B2, B5 và Ngọc Trục"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "2,300+ Sinh viên",
      description: "Đang sinh sống và học tập"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "100% An toàn",
      description: "Bảo vệ 24/7 và camera giám sát"
    }
  ];

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Hotline",
      info: "024.3385.2008"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      info: "ktx@ptit.edu.vn"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Địa chỉ",
      info: "Km10, Đường Nguyễn Trãi, Q.Hà Đông, Hà Nội"
    }
  ];
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <Header user={user} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{
            backgroundImage: `url(${ptitBuilding2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Hệ thống Ký túc xá
                <span className="block text-3xl md:text-5xl mt-2">PTIT</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                Môi trường sống hiện đại, an toàn và thân thiện dành cho sinh viên 
                Học viện Công nghệ Bưu chính Viễn thông
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => setIsRegistrationOpen(true)}
                  size="lg"
                  variant="ptit"
                  className="text-lg px-8 py-3"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Đăng ký nguyện vọng ngay
                </Button>
                <p className="text-sm opacity-80">
                  🔥 Đợt đăng ký mùa thu 2025 đang mở
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      {stat.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {stat.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dormitory Slideshow Section */}
        <section className="py-16 bg-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Các tòa ký túc xá
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Khám phá các tòa ký túc xá hiện đại với đầy đủ tiện nghi, 
                mang đến môi trường sống và học tập tốt nhất cho sinh viên
              </p>
            </div>
            
            <DormitorySlideshow />
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                  Tại sao chọn KTX PTIT?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Vị trí thuận lợi</h3>
                      <p className="text-muted-foreground">
                        Nằm ngay trong khuôn viên trường, gần các khu học tập và sinh hoạt chính
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Tiện ích đầy đủ</h3>
                      <p className="text-muted-foreground">
                        Wifi miễn phí, phòng học tự học, căng tin, sân thể thao và nhiều tiện ích khác
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">An ninh tốt</h3>
                      <p className="text-muted-foreground">
                        Hệ thống bảo vệ 24/7, camera giám sát và quản lý sinh viên chặt chẽ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Card className="shadow-card">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                      Liên hệ ban quản lý
                    </h3>
                    <div className="space-y-4">
                      {contactInfo.map((contact, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
                          <div className="text-primary">
                            {contact.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{contact.title}</p>
                            <p className="text-muted-foreground">{contact.info}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => setIsRegistrationOpen(true)}
                        variant="ptit"
                        className="w-full"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Đăng ký nguyện vọng
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
};

export default Intro;