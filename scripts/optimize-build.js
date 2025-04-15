const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

// Копирование папки prisma в dist для миграций
function copyPrismaFiles() {
    const srcPrismaDir = path.join(__dirname, '../src/db/prisma');
    const distPrismaDir = path.join(__dirname, '../prisma');
    const destDbDir = path.join(__dirname, '../dist/db');
    const destPrismaDir = path.join(destDbDir, 'prisma');
    
    console.log('Copying Prisma files to dist directory...');
    
    // Создаем директорию если её нет
    if (!fs.existsSync(destDbDir)) {
        fs.mkdirSync(destDbDir, { recursive: true });
    }
    
    if (!fs.existsSync(destPrismaDir)) {
        fs.mkdirSync(destPrismaDir, { recursive: true });
    }
    
    // Копируем в корневую prisma директорию
    if (!fs.existsSync(distPrismaDir)) {
        fs.mkdirSync(distPrismaDir, { recursive: true });
    }
    
    // Копируем schema.prisma в обе директории
    if (fs.existsSync(path.join(srcPrismaDir, 'schema.prisma'))) {
        // Копируем в dist/db/prisma
        fs.copyFileSync(
            path.join(srcPrismaDir, 'schema.prisma'),
            path.join(destPrismaDir, 'schema.prisma')
        );
        
        // Копируем в корневую prisma директорию
        fs.copyFileSync(
            path.join(srcPrismaDir, 'schema.prisma'),
            path.join(distPrismaDir, 'schema.prisma')
        );
        
        console.log('Copied schema.prisma to both dist/db/prisma and prisma directories');
    }
    
    // Копируем миграции, если они есть
    const migrationsDir = path.join(srcPrismaDir, 'migrations');
    if (fs.existsSync(migrationsDir)) {
        // Копируем в dist/db/prisma/migrations
        const destMigrationsDir = path.join(destPrismaDir, 'migrations');
        if (!fs.existsSync(destMigrationsDir)) {
            fs.mkdirSync(destMigrationsDir, { recursive: true });
        }
        
        // Копируем в /prisma/migrations
        const rootMigrationsDir = path.join(distPrismaDir, 'migrations');
        if (!fs.existsSync(rootMigrationsDir)) {
            fs.mkdirSync(rootMigrationsDir, { recursive: true });
        }
        
        const migrations = fs.readdirSync(migrationsDir);
        for (const migration of migrations) {
            const migrationDir = path.join(migrationsDir, migration);
            if (fs.statSync(migrationDir).isDirectory()) {
                const destMigrationDir = path.join(destMigrationsDir, migration);
                if (!fs.existsSync(destMigrationDir)) {
                    fs.mkdirSync(destMigrationDir, { recursive: true });
                }
                
                const rootMigrationDir = path.join(rootMigrationsDir, migration);
                if (!fs.existsSync(rootMigrationDir)) {
                    fs.mkdirSync(rootMigrationDir, { recursive: true });
                }
                
                const files = fs.readdirSync(migrationDir);
                for (const file of files) {
                    fs.copyFileSync(
                        path.join(migrationDir, file),
                        path.join(destMigrationDir, file)
                    );
                    
                    fs.copyFileSync(
                        path.join(migrationDir, file),
                        path.join(rootMigrationDir, file)
                    );
                }
            }
        }
        console.log('Copied Prisma migrations to both dist/db/prisma and prisma directories');
    }
}

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
    
    // Сначала копируем файлы Prisma
    copyPrismaFiles();
    
    // Затем оптимизируем JS файлы
    await traverseAndOptimize(distDir);
    
    console.log('Build optimization completed');
})(); 