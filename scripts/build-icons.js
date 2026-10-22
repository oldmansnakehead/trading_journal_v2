/**
 * Electron Icon Generator for Trading Journal v2
 * Generates all platform icon standards:
 * - Windows: build/icon.ico (16, 24, 32, 48, 64, 128, 256)
 * - macOS:   build/icon.icns (16, 32, 64, 128, 256, 512, 1024)
 * - Linux:   build/icon.png  (1024x1024 / 512x512)
 * - App dev: resources/icon.png (512x512)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Multi-size ICO buffer packer (PNG-compressed ICO format)
function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entryOffset = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset); // Width (0 = 256)
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1); // Height (0 = 256)
    header.writeUInt8(0, entryOffset + 2); // Color palette
    header.writeUInt8(0, entryOffset + 3); // Reserved
    header.writeUInt16LE(1, entryOffset + 4); // Color planes
    header.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    header.writeUInt32LE(buf.length, entryOffset + 8); // Image size in bytes
    header.writeUInt32LE(offset, entryOffset + 12); // File offset
    offset += buf.length;
  }

  return Buffer.concat([header, ...pngBuffers]);
}

// macOS ICNS buffer packer
function createIcns(entries) {
  const chunks = [];
  let totalLength = 8;
  for (const entry of entries) {
    const chunkHeader = Buffer.alloc(8);
    chunkHeader.write(entry.ostype, 0, 4, 'ascii');
    chunkHeader.writeUInt32BE(entry.buf.length + 8, 4);
    chunks.push(chunkHeader, entry.buf);
    totalLength += entry.buf.length + 8;
  }
  const mainHeader = Buffer.alloc(8);
  mainHeader.write('icns', 0, 4, 'ascii');
  mainHeader.writeUInt32BE(totalLength, 4);
  return Buffer.concat([mainHeader, ...chunks]);
}

async function buildIcons(sourceSvgPath) {
  if (!fs.existsSync(sourceSvgPath)) {
    throw new Error(`Source SVG not found: ${sourceSvgPath}`);
  }

  console.log(`Building Electron icon assets from: ${sourceSvgPath}`);
  const svgContent = fs.readFileSync(sourceSvgPath);

  // Ensure directories exist
  fs.mkdirSync(path.resolve('build'), { recursive: true });
  fs.mkdirSync(path.resolve('resources'), { recursive: true });

  // 1. Windows ICO (16, 24, 32, 48, 64, 128, 256)
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngBuffers = await Promise.all(
    icoSizes.map((size) => sharp(svgContent).resize(size, size).png().toBuffer())
  );
  const icoBuffer = createIco(icoPngBuffers, icoSizes);
  const icoDest = path.resolve('build/icon.ico');
  fs.writeFileSync(icoDest, icoBuffer);
  console.log(`✔ Windows icon generated: ${icoDest} (${icoBuffer.length} bytes, ${icoSizes.length} layers)`);

  // 2. macOS ICNS
  const icnsEntriesConfig = [
    { ostype: 'ic07', size: 128 },
    { ostype: 'ic08', size: 256 },
    { ostype: 'ic09', size: 512 },
    { ostype: 'ic10', size: 1024 },
    { ostype: 'ic11', size: 32 },  // 16x16@2x
    { ostype: 'ic12', size: 64 },  // 32x32@2x
    { ostype: 'ic13', size: 256 }, // 128x128@2x
    { ostype: 'ic14', size: 512 }  // 256x256@2x
  ];
  const icnsEntries = await Promise.all(
    icnsEntriesConfig.map(async (entry) => ({
      ostype: entry.ostype,
      buf: await sharp(svgContent).resize(entry.size, entry.size).png().toBuffer()
    }))
  );
  const icnsBuffer = createIcns(icnsEntries);
  const icnsDest = path.resolve('build/icon.icns');
  fs.writeFileSync(icnsDest, icnsBuffer);
  console.log(`✔ macOS icon generated: ${icnsDest} (${icnsBuffer.length} bytes)`);

  // 3. Linux & Builder Master PNG (512x512)
  const png512 = await sharp(svgContent).resize(512, 512).png().toBuffer();
  const buildPngDest = path.resolve('build/icon.png');
  const resPngDest = path.resolve('resources/icon.png');
  fs.writeFileSync(buildPngDest, png512);
  fs.writeFileSync(resPngDest, png512);
  console.log(`✔ Linux/Master PNG generated: ${buildPngDest} (512x512)`);
  console.log(`✔ Runtime window icon generated: ${resPngDest} (512x512)`);

  // 4. Also generate a 1024x1024 master icon if needed
  const png1024Dest = path.resolve('build/icon-1024.png');
  await sharp(svgContent).resize(1024, 1024).png().toFile(png1024Dest);
  console.log(`✔ Master 1024x1024 PNG generated: ${png1024Dest}`);

  // 5. Keep resources/icon.svg and build/icon.svg in sync
  fs.writeFileSync(path.resolve('resources/icon.svg'), svgContent);
  fs.writeFileSync(path.resolve('build/icon.svg'), svgContent);
  console.log(`✔ Master SVG synced to resources/icon.svg & build/icon.svg`);

  console.log('\nAll Electron standard icons successfully generated!');
}

let svgPath;
if (process.argv[2]) {
  const arg = process.argv[2];
  if (fs.existsSync(arg)) {
    svgPath = path.resolve(arg);
  } else if (fs.existsSync(path.resolve(`resources/icon-concepts/${arg}.svg`))) {
    svgPath = path.resolve(`resources/icon-concepts/${arg}.svg`);
  } else if (fs.existsSync(path.resolve(`resources/icon-concepts/concept-${arg}.svg`))) {
    svgPath = path.resolve(`resources/icon-concepts/concept-${arg}.svg`);
  }
}

if (!svgPath) {
  if (fs.existsSync(path.resolve('resources/icon.svg'))) {
    svgPath = path.resolve('resources/icon.svg');
  } else {
    svgPath = path.resolve('resources/icon-concepts/concept-1.svg');
  }
}

buildIcons(svgPath).catch((err) => {
  console.error('Failed to build icons:', err);
  process.exit(1);
});
