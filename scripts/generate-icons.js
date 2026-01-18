const fs = require('fs');
const path = require('path');

// SVG 아이콘 생성
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="${size}" height="${size}" fill="#4F46E5" rx="${size * 0.15}"/>

  <!-- 시계 원 -->
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.28}" fill="white" opacity="0.9"/>

  <!-- 시계 바늘 -->
  <line x1="${size * 0.5}" y1="${size * 0.45}" x2="${size * 0.5}" y2="${size * 0.28}"
        stroke="#4F46E5" stroke-width="${size * 0.05}" stroke-linecap="round"/>
  <line x1="${size * 0.5}" y1="${size * 0.45}" x2="${size * 0.65}" y2="${size * 0.45}"
        stroke="#4F46E5" stroke-width="${size * 0.04}" stroke-linecap="round"/>

  <!-- 중심점 -->
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.04}" fill="#4F46E5"/>

  <!-- 위치 핀 -->
  <path d="M ${size * 0.5} ${size * 0.75}
           L ${size * 0.45} ${size * 0.68}
           C ${size * 0.35} ${size * 0.68} ${size * 0.35} ${size * 0.58} ${size * 0.5} ${size * 0.58}
           C ${size * 0.65} ${size * 0.58} ${size * 0.65} ${size * 0.68} ${size * 0.55} ${size * 0.68}
           Z"
           fill="white" opacity="0.9"/>
  <circle cx="${size * 0.5}" cy="${size * 0.62}" r="${size * 0.03}" fill="#4F46E5"/>
</svg>
`;

// public 디렉토리 확인
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG 아이콘 생성
const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svg.trim());
  console.log(`✓ Created ${filename}`);
});

// favicon.ico를 위한 작은 SVG
const faviconSVG = createSVG(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG.trim());
console.log('✓ Created favicon.svg');

// apple-touch-icon을 위한 SVG
const appleTouchIcon = createSVG(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchIcon.trim());
console.log('✓ Created apple-touch-icon.svg');

console.log('\n📱 Icon generation complete!');
console.log('Note: SVG icons are generated. For better PWA support, consider converting to PNG using an online tool or image library.');
