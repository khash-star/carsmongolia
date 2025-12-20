import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCode, Folder, Database, Layout, Settings, File } from 'lucide-react';

export default function Documentation() {
  const sections = [
    {
      title: "📄 Pages (Хуудсууд)",
      icon: File,
      color: "bg-blue-100 text-blue-600",
      description: "Апп-ын бүх хуудсууд энд байрлана. Хэрэглэгч үзэх дэлгэцүүд.",
      items: [
        { name: "Home", desc: "Нүүр хуудас, машины зарын жагсаалт" },
        { name: "Profile", desc: "Хэрэглэгчийн профайл хуудас" },
        { name: "Messages", desc: "Зурвасын систем" },
        { name: "Admin", desc: "Админы удирдлагын самбар (зөвхөн admin хэрэглэгч)" },
        { name: "CarDetails", desc: "Машины дэлгэрэнгүй мэдээлэл" },
        { name: "AddCar", desc: "Шинэ машины зар нэмэх" },
        { name: "MyCars", desc: "Миний зарууд" },
        { name: "Favorites", desc: "Хадгалсан зарууд" },
        { name: "Services", desc: "Үйлчилгээний хуудас (сэлбэг, дугуй, засвар гэх мэт)" },
        { name: "AddBusiness", desc: "Бизнес бүртгэх" },
        { name: "BusinessDetails", desc: "Бизнесийн дэлгэрэнгүй" }
      ]
    },
    {
      title: "🧩 Components (Бүрэлдэхүүн хэсгүүд)",
      icon: Folder,
      color: "bg-green-100 text-green-600",
      description: "Дахин ашиглагдах бүрэлдэхүүн хэсгүүд. Олон хуудсанд ашиглагдана.",
      items: [
        { name: "CarCard", desc: "Машины картын дизайн (жагсаалтанд)" },
        { name: "SearchFilters", desc: "Хайлтын шүүлтүүр" },
        { name: "HeroSection", desc: "Нүүр хуудасны дээд хэсэг (hero banner)" }
      ]
    },
    {
      title: "📊 Entities (Өгөгдлийн загварууд)",
      icon: Database,
      color: "bg-purple-100 text-purple-600",
      description: "Датабааз дахь өгөгдлийн бүтэц, JSON схем хэлбэрээр.",
      items: [
        { name: "Car", desc: "Машины зарын өгөгдөл (гарчиг, үнэ, үйлдвэрлэгч, загвар гэх мэт)" },
        { name: "Business", desc: "Бизнесийн өгөгдөл (сэлбэг, засвар үйлчилгээ)" },
        { name: "Message", desc: "Зурвасын өгөгдөл" },
        { name: "Favorite", desc: "Хадгалсан зарын өгөгдөл" },
        { name: "User", desc: "Хэрэглэгчийн өгөгдөл (built-in, автоматаар байдаг)" }
      ]
    },
    {
      title: "🎨 Layout.js",
      icon: Layout,
      color: "bg-orange-100 text-orange-600",
      description: "Апп-ын бүх хуудсыг хүрээлсэн ерөнхий загвар.",
      items: [
        { name: "Header", desc: "Logo, navigation, хэрэглэгчийн цэс" },
        { name: "Mobile navigation", desc: "Гар утасны цэс" },
        { name: "Notification badges", desc: "Шинэ зурвас, батлагдаагүй зар" }
      ]
    },
    {
      title: "⚙️ Functions (Арын функцүүд)",
      icon: Settings,
      color: "bg-red-100 text-red-600",
      description: "Backend функцүүд - API integration, зураг upload гэх мэт.",
      items: [
        { name: "uploadToServer", desc: "Зургийг Firebase storage руу upload хийх" },
        { name: "syncToMySQL", desc: "Base44 датаг MySQL руу синхрон хийх" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Кодын Бүтэц</h1>
          </div>
          <p className="text-gray-600">AutoZar апп-ын файл, фолдерын тайлбар</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-xl">🔧 Техникийн дэлгэрэнгүй</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Framework & Tools:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">Base44 SDK</Badge>
                <Badge variant="outline">React Query</Badge>
                <Badge variant="outline">Framer Motion</Badge>
                <Badge variant="outline">Lucide React</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Датабааз ажиллагаа:</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-green-400">// Өгөгдөл унших</div>
                <div>base44.entities.Car.list()</div>
                <div>base44.entities.Car.filter({'{'} status: 'approved' {'}'})</div>
                <br />
                <div className="text-green-400">// Өгөгдөл үүсгэх</div>
                <div>base44.entities.Car.create({'{'} title: "...", price: 1000 {'}'})</div>
                <br />
                <div className="text-green-400">// Өгөгдөл шинэчлэх</div>
                <div>base44.entities.Car.update(id, {'{'} status: 'approved' {'}'})</div>
                <br />
                <div className="text-green-400">// Өгөгдөл устгах</div>
                <div>base44.entities.Car.delete(id)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Authentication:</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-green-400">// Хэрэглэгч мэдээлэл авах</div>
                <div>const user = await base44.auth.me()</div>
                <br />
                <div className="text-green-400">// Login хуудас руу шилжих</div>
                <div>base44.auth.redirectToLogin()</div>
                <br />
                <div className="text-green-400">// Logout</div>
                <div>base44.auth.logout()</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Тайлбар хийсэн огноо: 2025-12-06</p>
          <p>Апп: AutoZar - Монголын машины зарын платформ 🇲🇳</p>
        </div>
      </div>
    </div>
  );
}