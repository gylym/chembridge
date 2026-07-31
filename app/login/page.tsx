import ChemBridgeApp from "../ChemBridgeApp";

export const metadata = {
  title: "Кіру · ChemBridge",
  description: "ChemBridge оқу аккаунтына логин арқылы кіру.",
};

export default function LoginPage() {
  return <ChemBridgeApp initialView="auth" initialAuthMode="login" />;
}
