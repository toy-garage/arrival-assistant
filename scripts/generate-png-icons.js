const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 배경 - 보라색 라운드 사각형
  ctx.fillStyle = '#4F46E5';
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // 시계 원
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.45, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // 시계 바늘
  ctx.strokeStyle = '#4F46E5';
  ctx.lineCap = 'round';

  // 분침
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.45);
  ctx.lineTo(size * 0.5, size * 0.28);
  ctx.stroke();

  // 시침
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.45);
  ctx.lineTo(size * 0.65, size * 0.45);
  ctx.stroke();

  // 중심점
  ctx.fillStyle = '#4F46E5';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.45, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 위치 핀
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.75);
  ctx.lineTo(size * 0.45, size * 0.68);
  ctx.quadraticCurveTo(size * 0.35, size * 0.68, size * 0.35, size * 0.58);
  ctx.quadraticCurveTo(size * 0.35, size * 0.53, size * 0.5, size * 0.53);
  ctx.quadraticCurveTo(size * 0.65, size * 0.53, size * 0.65, size * 0.58);
  ctx.quadraticCurveTo(size * 0.65, size * 0.68, size * 0.55, size * 0.68);
  ctx.closePath();
  ctx.fill();

  // 핀 중심점
  ctx.fillStyle = '#4F46E5';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.58, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// public 디렉토리 확인
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 다양한 크기의 아이콘 생성
const icons = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

console.log('🎨 Generating PNG icons...\n');

icons.forEach(({ size, name }) => {
  const canvas = createIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(publicDir, name);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Created ${name} (${size}x${size})`);
});

// favicon.ico를 위해 32x32를 favicon.png로도 저장
const faviconCanvas = createIcon(32);
const faviconBuffer = faviconCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer);
console.log('✓ Created favicon.png (32x32)');

console.log('\n✅ All icons generated successfully!');
console.log('📁 Icons saved to: public/');
