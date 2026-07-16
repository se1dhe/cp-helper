import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://masterwork.wiki/lu4/classes';
const outputDir = path.join(process.cwd(), 'public', 'icons', 'classes');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath);
        res.pipe(writeStream);
        writeStream.on('finish', () => {
          writeStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function scrape() {
  console.log('Запускаю парсер...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set user agent to bypass simple blocks
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  
  await page.goto(url, { waitUntil: 'networkidle2' });
  console.log('Страница загружена.');

  // Находим все элементы с классами (возможно таблицы или блоки)
  const classes = await page.evaluate(() => {
    const results = [];
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.src;
      // В masterwork.wiki обычно иконки профессий лежат в специфичных папках или имеют названия проф
      if (src && (src.includes('class') || src.includes('skill'))) {
        results.push({
          src,
          alt: img.alt || path.basename(src)
        });
      }
    });
    return results;
  });

  console.log(`Найдено потенциальных иконок: ${classes.length}`);

  for (const c of classes) {
    if (!c.src.startsWith('http')) continue;
    let filename = c.alt.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    if (filename === '_.png' || filename === '.png') {
        filename = path.basename(c.src).split('?')[0];
    }
    const filepath = path.join(outputDir, filename);
    
    try {
      await downloadImage(c.src, filepath);
      console.log(`Скачано: ${filename}`);
    } catch (e) {
      console.log(`Ошибка скачивания ${c.src}`);
    }
  }

  await browser.close();
  console.log('Готово!');
}

scrape().catch(console.error);
