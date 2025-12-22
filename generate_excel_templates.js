import XLSX from 'xlsx';

// Заруудын Excel загвар үүсгэх
const carsTemplate = [
  {
    'ID': 'car123',
    'Гарчиг': '2020 Toyota Camry',
    'Марк': 'Toyota',
    'Загвар': 'Camry',
    'Он': 2020,
    'Үнэ': 45000000,
    'Гүйлт': 50000,
    'Түлш': 'Бензин',
    'Хурдны хайрцаг': 'Автомат',
    'Бие': 'Седан',
    'Хөдөлгүүрийн багтаамж': 2500,
    'Хөтлөх төрөл': 'fwd',
    'Гарал үүсэл': 'japan',
    'Гадаад өнгө': 'Цагаан',
    'Дотоод өнгө': 'Хар',
    'Тайлбар': 'Маш сайн байдалтай машин',
    'Зургууд': 'https://example.com/image1.jpg; https://example.com/image2.jpg',
    'Байршил': 'ulaanbaatar',
    'Утас': '99001122',
    'WhatsApp': '99001122',
    'Төлөв': 'pending',
    'Харагдсан тоо': 0,
    'Бүртгэгдсэн огноо': new Date().toISOString(),
    'Шинэчлэгдсэн огноо': new Date().toISOString(),
  }
];

// Бизнесүүдийн Excel загвар үүсгэх
const businessesTemplate = [
  {
    'ID': 'business123',
    'Нэр': 'Токио Авто Сэлбэг',
    'Төрөл': 'parts',
    'Ангилал': 'Хөдөлгүүр',
    'Тайлбар': 'Япон машины сэлбэг хэрэгслийн дэлгүүр',
    'Утас': '77112233',
    'WhatsApp': '77112233',
    'Хаяг': 'Улаанбаатар хот, Баянзүрх дүүрэг',
    'Дугуйны өргөн': '',
    'Дугуйны профиль': '',
    'Дугуйны обод': '',
    'Үнэ': '',
    'Зургууд': 'https://example.com/business1.jpg',
    'Төлөв': 'pending',
    'Харагдсан тоо': 0,
    'Бүртгэгдсэн огноо': new Date().toISOString(),
    'Шинэчлэгдсэн огноо': new Date().toISOString(),
  }
];

// Заруудын загвар үүсгэх
const carsWs = XLSX.utils.json_to_sheet(carsTemplate);
const carsWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(carsWb, carsWs, 'Зарууд');

// Column width тохируулах
carsWs['!cols'] = [
  { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 8 },
  { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
  { wch: 12 }, { wch: 50 }, { wch: 50 }, { wch: 15 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
];

XLSX.writeFile(carsWb, 'cars_template.xlsx');
console.log('✅ cars_template.xlsx файл үүсгэгдлээ');

// Бизнесүүдийн загвар үүсгэх
const businessesWs = XLSX.utils.json_to_sheet(businessesTemplate);
const businessesWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(businessesWb, businessesWs, 'Бизнесүүд');

// Column width тохируулах
businessesWs['!cols'] = [
  { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 50 },
  { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
  { wch: 12 }, { wch: 15 }, { wch: 50 }, { wch: 12 }, { wch: 12 },
  { wch: 20 }, { wch: 20 },
];

XLSX.writeFile(businessesWb, 'businesses_template.xlsx');
console.log('✅ businesses_template.xlsx файл үүсгэгдлээ');

console.log('\n📋 Excel загвар файлууд амжилттай үүсгэгдлээ!');
console.log('   - cars_template.xlsx');
console.log('   - businesses_template.xlsx');

