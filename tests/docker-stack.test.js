const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8');
const nginxConf = fs.readFileSync(path.join(root, 'nginx.conf'), 'utf8');
const compose = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');

assert.ok(dockerfile.includes('RUN chmod -R a+rX /usr/share/nginx/html'), 'Dockerfile must force readable static files');

assert.ok(nginxConf.includes('absolute_redirect off;'), 'nginx should disable absolute redirects to preserve mapped port');
assert.ok(nginxConf.includes('port_in_redirect off;'), 'nginx should not force port in redirects');
assert.ok(nginxConf.includes('location = / {'), 'nginx must redirect root path');
assert.ok(nginxConf.includes('return 302 /lacale-helper-v2/;'), 'nginx root redirect must point to project subpath');
assert.ok(nginxConf.includes('location ^~ /lacale-helper-v2/ {'), 'nginx subpath location must exist');
assert.ok(nginxConf.includes('rewrite ^/lacale-helper-v2/(.*)$ /$1 break;'), 'nginx must rewrite subpath to root files');
assert.ok(nginxConf.includes('try_files $uri $uri/ /index.html;'), 'nginx SPA fallback must target /index.html after rewrite');
assert.ok(nginxConf.includes('location /api/ {'), 'nginx API reverse proxy location missing');
assert.ok(nginxConf.includes('proxy_pass http://api:8000/api/;'), 'nginx API reverse proxy target mismatch');
assert.ok(nginxConf.includes('client_max_body_size 4096m;'), 'nginx client_max_body_size must be aligned with API limits');

assert.ok(compose.includes('${WEB_PORT:-8088}:80'), 'docker-compose must expose configurable WEB_PORT');
assert.ok(compose.includes('MAX_UPLOAD_MB=${MAX_UPLOAD_MB:-4096}'), 'docker-compose should expose configurable MAX_UPLOAD_MB');

assert.ok(indexHtml.includes('LC_MEDIAINFO_WASM_MODE_V3'), 'index.html must include WASM mode signature');
assert.ok(envExample.includes('WEB_PORT=8088'), '.env.example must define WEB_PORT default');
assert.ok(indexHtml.includes('setupCaptureInterceptors'), 'index.html must intercept existing upload flow in capture mode');

console.log('Docker/Nginx/NAS mode guards passed.');
