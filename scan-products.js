const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'products');
const OUT  = path.join(__dirname, 'data', 'products.js');
const IMG  = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

const natSort = (a, b) =>
  a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });

// Hàm tự động format tên thư mục thành Tên Sản Phẩm Đẹp
function formatTitle(folder) {
  let words = folder.replace(/[-_]+/g, ' ').trim().split(' ');
  // Viết hoa chữ cái đầu
  words = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  // Nếu có từ 2 chữ trở lên, tách chữ cuối cùng xuống dòng
  if (words.length > 1) {
    return [words.slice(0, -1).join(' '), words.slice(-1)[0]];
  }
  return words;
}

function readMeta(dir) {
  const f = path.join(dir, 'meta.json');
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { return {}; }
}

function scan() {
  if (!fs.existsSync(ROOT)) {
    console.error('✗ Không tìm thấy thư mục', ROOT); process.exit(1);
  }

  const folders = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort(natSort);

  const products = [];
  let n = 1;

  for (const folder of folders) {
    const dir = path.join(ROOT, folder);
    const imgs = fs.readdirSync(dir).filter(f => IMG.test(f)).sort(natSort);
    const meta = readMeta(dir);

    if (!imgs.length && !('image' in meta)) continue;

    const imgPaths = imgs.map(f => `products/${folder}/${f}`);

    products.push({
      id:        meta.id        ?? folder,
      num:       meta.num       ?? String(n).padStart(3, '0'),
      year:      meta.year      ?? String(new Date().getFullYear()),
      // Nếu không có meta.json, tự động lấy tên từ thư mục
      titleLines:meta.titleLines?? formatTitle(folder),
      tags:      meta.tags      ?? ['SẢN PHẨM'], // Mặc định nếu không có tag
      image:     'image' in meta ? meta.image : (imgPaths[0] ?? null),
      location:  meta.location  ?? '',
      area:      meta.area      ?? '',
      materials: meta.materials ?? '',
      duration:  meta.duration  ?? '',
      intro:     meta.intro     ?? '',
      sections:  meta.sections  ?? [],
      gallery:   'gallery' in meta ? meta.gallery : imgPaths,
    });
    n++;
  }

  const header = `/* ================================================================
   NDECOR — DATA SẢN PHẨM (TỰ ĐỘNG SINH — ĐỪNG SỬA TAY)
   ================================================================ */\n\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, header + 'window.NDECOR_PRODUCTS = ' + JSON.stringify(products, null, 2) + ';\n', 'utf8');

  console.log(`✓ Đã quét thành công ${products.length} sản phẩm!`);
}

scan();