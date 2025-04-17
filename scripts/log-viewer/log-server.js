const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.LOG_VIEWER_PORT || 3030;

// Путь к директории с логами
const logsDir = path.join(__dirname, '../../logs');

// Базовые стили и скрипты для удобного просмотра
const headContent = `
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Совпадём - Просмотр логов</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #e91e63;
      border-bottom: 2px solid #f3f3f3;
      padding-bottom: 10px;
    }
    a {
      color: #e91e63;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .log-list {
      list-style: none;
      padding: 0;
    }
    .log-list li {
      padding: 8px 15px;
      border-bottom: 1px solid #eee;
    }
    .log-list li:hover {
      background-color: #f9f9f9;
    }
    .log-content {
      white-space: pre-wrap;
      font-family: monospace;
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 3px;
      overflow-x: auto;
    }
    .error { color: #d32f2f; }
    .warning { color: #ff9800; }
    .info { color: #2196f3; }
    .debug { color: #4caf50; }
    .refresh {
      background-color: #e91e63;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 3px;
      cursor: pointer;
      margin-bottom: 15px;
    }
    .refresh:hover {
      background-color: #c2185b;
    }
    .controls {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search {
      padding: 8px;
      width: 300px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
    .log-nav {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      margin-bottom: 20px;
    }
  </style>
</head>
`;

// Главная страница со списком доступных лог-файлов
app.get('/', (req, res) => {
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Ошибка чтения директории логов: ' + err.message);
    }

    const logFiles = files.filter(file => file.endsWith('.log'));
    
    let html = `
    <!DOCTYPE html>
    <html lang="ru">
    ${headContent}
    <body>
      <div class="container">
        <h1>Просмотр логов бота "Совпадём"</h1>
        <ul class="log-list">
    `;
    
    logFiles.forEach(file => {
      html += `<li><a href="logs/${file}">${file}</a></li>`;
    });
    
    html += `
        </ul>
      </div>
    </body>
    </html>
    `;
    
    res.send(html);
  });
});

// Маршрут для списка логов (для корректной работы через прокси)
app.get('/logs', (req, res) => {
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Ошибка чтения директории логов: ' + err.message);
    }

    const logFiles = files.filter(file => file.endsWith('.log'));
    
    let html = `
    <!DOCTYPE html>
    <html lang="ru">
    ${headContent}
    <body>
      <div class="container">
        <h1>Просмотр логов бота "Совпадём"</h1>
        <ul class="log-list">
    `;
    
    logFiles.forEach(file => {
      html += `<li><a href="${file}">${file}</a></li>`;
    });
    
    html += `
        </ul>
      </div>
    </body>
    </html>
    `;
    
    res.send(html);
  });
});

// Просмотр содержимого лог-файла с пагинацией и поиском
app.get('/logs/:filename', (req, res) => {
  const filename = req.params.filename;
  const logPath = path.join(logsDir, filename);
  
  const limit = parseInt(req.query.limit) || 200; // кол-во строк на странице
  const page = parseInt(req.query.page) || 1;
  const searchTerm = req.query.search || '';
  
  // Проверка безопасности пути
  if (!filename.match(/^[a-zA-Z0-9_\-\.]+\.log$/)) {
    return res.status(400).send('Недопустимое имя файла');
  }
  
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Ошибка чтения файла лога: ' + err.message);
    }
    
    let lines = data.split('\n');
    let totalLines = lines.length;
    
    // Применяем поиск, если указан
    if (searchTerm) {
      lines = lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Расчет пагинации
    const totalPages = Math.ceil(lines.length / limit);
    const startIdx = (page - 1) * limit;
    const endIdx = Math.min(startIdx + limit, lines.length);
    
    // Выбираем только нужные строки
    const displayedLines = lines.slice(startIdx, endIdx);
    
    // Подсветка строк по типу лога
    const colorizedLines = displayedLines.map(line => {
      // Проверяем числовые уровни логирования
      if (line.includes('"level":50') || line.includes('"level":60') || line.includes('"level":"error"') || line.includes('ERROR')) {
        return `<div class="error">${escapeHtml(line)}</div>`;
      } else if (line.includes('"level":40') || line.includes('"level":"warn"') || line.includes('WARN')) {
        return `<div class="warning">${escapeHtml(line)}</div>`;
      } else if (line.includes('"level":30') || line.includes('"level":"info"') || line.includes('INFO')) {
        return `<div class="info">${escapeHtml(line)}</div>`;
      } else if (line.includes('"level":20') || line.includes('"level":10') || line.includes('"level":"debug"') || line.includes('DEBUG')) {
        return `<div class="debug">${escapeHtml(line)}</div>`;
      }
      return escapeHtml(line);
    }).join('\n');
    
    // Строим ссылки пагинации
    let paginationLinks = '';
    for (let i = 1; i <= totalPages; i++) {
      if (i === page) {
        paginationLinks += `<strong>${i}</strong> `;
      } else {
        paginationLinks += `<a href="?page=${i}&limit=${limit}&search=${encodeURIComponent(searchTerm)}">${i}</a> `;
      }
    }
    
    let html = `
    <!DOCTYPE html>
    <html lang="ru">
    ${headContent}
    <body>
      <div class="container">
        <h1>Просмотр файла: ${filename}</h1>
        
        <div class="controls">
          <a href="/logs" class="back">← Назад к списку файлов</a>
          <form method="GET">
            <input type="hidden" name="page" value="1">
            <input type="hidden" name="limit" value="${limit}">
            <input type="text" name="search" placeholder="Поиск в логах..." class="search" value="${searchTerm}">
            <button type="submit" class="refresh">Найти</button>
          </form>
          <button class="refresh" onclick="window.location.reload()">Обновить</button>
        </div>
        
        <div class="log-nav">
          <div>
            ${searchTerm ? `Показаны результаты поиска для: <strong>${searchTerm}</strong> | ` : ''}
            Строки ${startIdx + 1}-${endIdx} из ${lines.length} ${searchTerm ? '(отфильтровано)' : ''}
          </div>
          <div>
            Страница: ${paginationLinks}
          </div>
        </div>
        
        <div class="log-content">${colorizedLines}</div>
        
        <div class="log-nav" style="margin-top: 20px;">
          <div>
            Строки на странице: 
            <a href="?page=1&limit=100&search=${encodeURIComponent(searchTerm)}">100</a> |
            <a href="?page=1&limit=200&search=${encodeURIComponent(searchTerm)}">200</a> |
            <a href="?page=1&limit=500&search=${encodeURIComponent(searchTerm)}">500</a> |
            <a href="?page=1&limit=1000&search=${encodeURIComponent(searchTerm)}">1000</a>
          </div>
          <div>
            Страница: ${paginationLinks}
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    
    res.send(html);
  });
});

// Функция для экранирования HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Запускаем сервер
app.listen(port, () => {
  console.log(`Сервер просмотра логов запущен на порту ${port}`);
  console.log(`Откройте http://localhost:${port} в браузере для просмотра логов`);
});