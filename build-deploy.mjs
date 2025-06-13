import { execSync } from 'child_process';

// 1. 构建项目
execSync('npm run build', { stdio: 'inherit' });

// 2. 进入dist目录并初始化Git
execSync('cd dist && git init', { stdio: 'inherit' });
execSync('cd dist && git add -A', { stdio: 'inherit' });
execSync('cd dist && git commit -m "Deploy to GH Pages"', { stdio: 'inherit' });

// 3. 推送到gh-pages分支
execSync(
  'cd dist && git push -f https://github.com/txs-ft/phaser-test-ground.git main:gh-pages',
  { stdio: 'inherit' }
);

console.log('✅ 已部署到 GitHub Pages');