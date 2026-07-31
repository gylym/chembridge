import ChemBridgeApp from "../ChemBridgeApp";

export const metadata = {
  title: "Тіркелу · ChemBridge",
  description: "ChemBridge платформасында жаңа оқу аккаунтын ашу.",
};

export default function RegisterPage() {
  return <ChemBridgeApp initialView="auth" initialAuthMode="register" />;
}
