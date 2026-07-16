import { readFileSync, existsSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function main() {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile || !existsSync(keyFile)) {
    console.error("Укажите GOOGLE_APPLICATION_CREDENTIALS = путь к serviceAccountKey.json");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(readFileSync(keyFile, "utf8"));
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  const targetEmail = process.env.TARGET_EMAIL || "a0w.k1m@gmail.com";
  const snapshot = await db.collection("users").where("email", "==", targetEmail).get();

  if (snapshot.empty) {
    console.log(`Пользователь ${targetEmail} не найден`);
    process.exit(1);
  }

  await snapshot.docs[0].ref.update({ role: "PL" });
  console.log(`Роль PL выдана ${targetEmail}`);
}

main().catch(console.error);
