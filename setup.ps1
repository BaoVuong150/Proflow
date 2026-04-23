Write-Host "---------------------------------------------------"
Write-Host "🚀 BAT DAU CAI DAT DU AN PROFLOW 1-CLICK 🚀"
Write-Host "---------------------------------------------------"

Write-Host "`n[1/5] Dang tai va bien dich giao dien Frontend..."
docker run --rm -v "${PWD}/frontend:/app" -w /app node:20-alpine sh -c "npm install && npm run build"

Write-Host "`n[2/5] Dang cai dat thu vien Backend (PHP/Laravel)..."
docker run --rm -v "${PWD}/backend:/app" composer install --ignore-platform-reqs

Write-Host "`n[3/5] Khoi tao file cau hinh bao mat..."
if (-Not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  -> Da tao file .env tu .env.example"
} else {
    Write-Host "  -> File .env da ton tai, bo qua."
}

Write-Host "`n[4/5] Dang khoi dong toan bo he thong Docker..."
docker compose up -d

Write-Host "`n[5/5] Cho Backend tinh day va chay Database Migrate..."
Start-Sleep -Seconds 10
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --force

Write-Host "`n---------------------------------------------------"
Write-Host "✅ HOAN THANH XUAT SAC! ✅"
Write-Host "Ban khong can lam them gi nua. Ban chi viec:"
Write-Host "1. Mo them 1 Terminal nua vao thu muc frontend chay: npm run dev"
Write-Host "   Hoac chay lenh qua Docker:"
Write-Host "   docker run -it --rm -v ""${PWD}/frontend:/app"" -w /app -p 3000:3000 node:20-alpine npm run dev"
Write-Host "2. Mo trinh duyet: http://localhost:3000"
Write-Host "---------------------------------------------------"
