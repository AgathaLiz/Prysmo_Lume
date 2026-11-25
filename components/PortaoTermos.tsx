import { useEffect, useRef, useState, type ReactNode } from "react";

import { ModalTermos } from "@/components/ModalTermos";
import { supabase } from "@/lib/supabase";
import { TERMOS_VERSAO } from "@/lib/termos";

export function PortaoTermos({ children }: { children: ReactNode }) {
  const [pendente, setPendente] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  // Evita checar de novo a cada renovação de token da mesma pessoa.
  const verificadoPara = useRef<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function verificar(idUsuario: string | null) {
      if (!idUsuario) {
        verificadoPara.current = null;
        if (ativo) setPendente(false);
        return;
      }
      if (verificadoPara.current === idUsuario) return;
      verificadoPara.current = idUsuario;

      const { data, error } = await supabase.rpc("termos_aceitos", {
        p_versao: TERMOS_VERSAO,
      });
      if (!ativo) return;

      if (error) {
        // Sem internet ou função ainda não criada: não trava o app e tenta de novo depois.
        console.log("Erro ao checar os termos:", error.message);
        verificadoPara.current = null;
        return;
      }

      setPendente(data !== true);
    }

    supabase.auth
      .getSession()
      .then(({ data }) => verificar(data.session?.user.id ?? null));

    const { data: inscricao } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        const idUsuario = sessao?.user.id ?? null;
        // Fora do callback para não travar o cliente do Supabase.
        setTimeout(() => {
          void verificar(idUsuario);
        }, 0);
      }
    );

    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, []);

  async function aceitar() {
    setSalvando(true);
    setErro("");

    const { error } = await supabase.rpc("aceitar_termos", {
      p_versao: TERMOS_VERSAO,
    });

    setSalvando(false);

    if (error) {
      console.log("Erro ao registrar o aceite:", error.message);
      setErro("Não conseguimos salvar agora. Veja a internet e tente de novo.");
      return;
    }

    setPendente(false);
  }

  async function recusar() {
    setPendente(false);
    verificadoPara.current = null;
    await supabase.auth.signOut();
  }

  return (
    <>
      {children}
      <ModalTermos
        visivel={pendente}
        salvando={salvando}
        erro={erro}
        onAceitar={aceitar}
        onRecusar={recusar}
      />
    </>
  );
}