#!/usr/bin/env bash
# Релиз CP-Helper: деплой правил Firestore + коммит + тег + пуш.
# Тег запускает сборку Mac+Win в GitHub Actions.
#
# Использование:
#   ./release.sh "текст коммита"          # деплой правил + релиз
#   ./release.sh "текст коммита" --no-rules   # без деплоя правил
#
# Версия берётся из package.json; тег = v<версия>. Перед запуском подними версию
# в package.json и src-tauri/tauri.conf.json (они должны совпадать, иначе CI упадёт).

set -euo pipefail
cd "$(dirname "$0")"

MSG="release"
SKIP_RULES=0
for arg in "$@"; do
  case "$arg" in
    --no-rules) SKIP_RULES=1 ;;
    *) MSG="$arg" ;;
  esac
done

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

# 3) деплой правил Firestore (до пуша, чтобы БД была готова к новой версии)
if [ "$SKIP_RULES" = "1" ]; then
  echo "ℹ Деплой правил пропущен (--no-rules)."
elif command -v firebase >/dev/null 2>&1; then
  echo "▶ Деплой правил Firestore..."
  firebase deploy --only firestore:rules
  echo "✔ Правила задеплоены."
else
  echo "⚠ firebase CLI не найден — пропускаю деплой правил."
  echo "  Установи (npm i -g firebase-tools) и залогинься (firebase login), либо запусти с --no-rules."
  exit 1
fi

# 4) коммит
git add -A
if git diff --cached --quiet; then
  echo "ℹ Нет изменений для коммита — пропускаю commit."
else
  git commit -m "$MSG"
  echo "✔ Коммит создан."
fi

# 5) тег (если уже есть — предупреждаем)
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "⚠ Тег $TAG уже существует. Если это новый релиз — подними версию. Пропускаю создание тега."
else
  git tag -a "$TAG" -m "CP-Helper $TAG"
  echo "✔ Тег $TAG создан."
fi

# 6) пуш ветки и тега
git push origin HEAD
git push origin "$TAG"
echo "✅ Готово. Открой вкладку Actions на GitHub — пошла сборка $TAG."
