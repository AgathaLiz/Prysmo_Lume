import { Redirect } from "expo-router";

//Vai redirecionar direto pra pagina de começo, para não dar erro de rota
export default function Index() {
  return <Redirect href="/onboarding/comeco" />;
}