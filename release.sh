#!/usr/bin/env bash
# Релиз CP-Helper: коммит + тег + пуш. Тег запускает сборку Mac+Win в GitHub Actions.
# Использование:
#   ./release.sh "текст коммита"
# Версия берётся из package.json; тег = v<версия>. Перед запуском подними версию
# в package.json и src-tauri/tauri.conf.json (они должны совпадать, иначе CI упадёт).

set -euo pipefail
cd "$(dirname "$0")"

MSG="${1:-release}"

# 1) убрать stale-локи, если остались от прерванного git
rm -f .git/HEAD.lock .git/index.lock .git/objects/maintenance.lock 2>/dev/null || true

# 2) сверить версии package.json и tauri.conf.json
PKG_VERSION="$(node -p "require('./package.json').version")"
TAURI_VERSION="$(node -p "require('./src-tauri/tauri.conf.json').version")"
if [ "$PKG_VERSION" != "$TAURI_VERSION" ]; then
  echo "❌ Версии не совпадают: package.json=$PKG_VERSION, tauri.conf.json=$TAURI_VERSION"
  echo "   Приведи их к одному значению и запусти снова."
  exit 1
fi
TAG="v$PKG_VERSION"
echo "▶ Версия: $PKG_VERSION  →  тег $TAG"

# 3) коммит
git add -A
if git diff --cached --quiet; then
  echo "ℹ Нет изменений для коммита — пропускаю commit."
else
  git commit -m "$MSG"
  echo "✔ Коммит создан."
fi

# 4) тег (если уже есть — предупреждаем)
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "⚠ Тег $TAG уже существует. Если это новый релиз — подними версию. Пропускаю создание тега."
else
  git tag -a "$TAG" -m "CP-Helper $TAG"
  echo "✔ Тег $TAG создан."
fi

# 5) пуш ветки и тега
git push origin HEAD
git push origin "$TAG"
echo "✅ Готово. Открой вкладку Actions на GitHub — пошла сборка $TAG."
