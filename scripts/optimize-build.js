const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

async function optimizeFile(filePath) {
    if (!filePath.endsWith('.js')) return;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = await minify(content, {
            compress: {
                dead_code: true,
                drop_debugger: true,
                drop_console: false, // Сохраняем консоль для логирования
                conditionals: true,
                unused: true,
                if_return: true,
                join_vars: true,
            },
            mangle: true
        });
        
        if (result.code) {
            fs.writeFileSync(filePath, result.code, 'utf8');
            console.log(`Optimized: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error optimizing ${filePath}:`, error);
    }
}

async function traverseAndOptimize(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            await traverseAndOptimize(fullPath);
        } else if (stats.isFile()) {
            await optimizeFile(fullPath);
        }
    }
}

(async () => {
    console.log('Starting build optimization...');
    await traverseAndOptimize(distDir);
    console.log('Build optimization completed');
})(); 