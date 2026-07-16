#!/usr/bin/env bash
# Релиз CP-Helper: (опц.) смена версии + деплой правил Firestore + коммит + тег + пуш.
# Тег запускает сборку Mac+Win в GitHub Actions.
#
# Использование:
#   ./release.sh "текст коммита"                     # релиз текущей версии
#   ./release.sh --bump patch "текст коммита"        # 1.4.0 -> 1.4.1
#   ./release.sh --bump minor "текст коммита"        # 1.4.0 -> 1.5.0
#   ./release.sh --bump major "текст коммита"        # 1.4.0 -> 2.0.0
#   ./release.sh --set 1.4.2 "текст коммита"         # задать версию явно
#   ./release.sh --set 1.4.2 --no-rules "текст"      # без деплоя правил
#
# --set / --bump правят версию в package.json и src-tauri/tauri.conf.json.
# Тег = v<версия>.

set -euo pipefail
cd "$(dirname "$0")"

MSG="release"
SKIP_RULES=0
NEW_VERSION=""
BUMP=""

while [ $# -gt 0 ]; do
  case "$1" in
    --no-rules) SKIP_RULES=1 ;;
    --set|-v|--version) shift; NEW_VERSION="${1:-}" ;;
    --bump) shift; BUMP="${1:-}" ;;
    *) MSG="$1" ;;
  esac
  shift
done

# Пишет версию в файл, заменяя первое поле "version": "...".
set_version() {
  node -e "const fs=require('fs');const p=process.argv[1];const v=process.argv[2];let s=fs.readFileSync(p,'utf8');s=s.replace(/\"version\":\s*\"[^\"]*\"/, '\"version\": \"'+v+'\"');fs.writeFileSync(p,s);" "$1" "$2"
}

# 0) если задан --bump, вычислить новую версию из package.json
if [ -n "$BUMP" ] && [ -z "$NEW_VERSION" ]; then
  NEW_VERSION="$(node -e "const [a,b,c]=require('./package.json').version.split('.').map(Number);const t=process.argv[1];console.log(t==='major'?(a+1)+'.0.0':t==='minor'?a+'.'+(b+1)+'.0':a+'.'+b+'.'+(c+1));" "$BUMP")"
fi

# 0b) если задана новая версия — проверить формат и прописать в оба файла
if [ -n "$NEW_VERSION" ]; then
  if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "❌ Неверный формат версии: '$NEW_VERSION' (нужно X.Y.Z, напр. 1.4.1)"
    exit 1
  fi
  set_version package.json "$NEW_VERSION"
  set_version src-tauri/tauri.conf.json "$NEW_VERSION"
  echo "▶ Версия установлена: $NEW_VERSION"
fi

# 1) убрать stale-локи, если остались от прерванного git
rm -f .git/HEAD.lock .git/index.lock .git/objects/maintenance.lock 2>/dev/null || true

# 2) сверить версии package.json и tauri.conf.json
PKG_VERSION="$(node -p "require('./package.json').version")"
TAURI_VERSION="$(node -p "require('./src-tauri/tauri.conf.json').version")"
if [ "$PKG_VERSION" != "$TAURI_VERSION" ]; then
  echo "❌ Версии не совпадают: package.json=$PKG_VERSION, tauri.conf.json=$TAURI_VERSION"
  echo "   Задай версию явно: ./release.sh --set X.Y.Z \"...\""
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
  echo "⚠ Тег $TAG уже существует. Подними версию: ./release.sh --bump patch \"...\". Пропускаю создание тега."
else
  git tag -a "$TAG" -m "CP-Helper $TAG"
  echo "✔ Тег $TAG создан."
fi

# 6) пуш ветки и тега
git push origin HEAD
git push origin "$TAG"
echo "✅ Готово. Открой вкладку Actions на GitHub — пошла сборка $TAG."
