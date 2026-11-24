import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { ehEmailAdminTeste, ehPapelAdmin } from "@/lib/admins";
import { supabase } from "@/lib/supabase";

export type EstadoAdministrador = {
  /** Ainda estou conferindo quem está logado. */
  carregando: boolean;
  /** A pessoa logada pode usar a área de administração. */
  autorizado: boolean;
};

/**
 * Confere se quem está logado é administrador.
 *
 * Como no resto do app, a ligação com a conta é `usuario.auth_user_id`. O
 * `papel` pode ser "admin" ou "administrador". O e-mail de teste entra como
 * administrador sem depender do banco.
 */
export function useAdministrador(): EstadoAdministrador {
  const [estado, setEstado] = useState<EstadoAdministrador>({
    carregando: true,
    autorizado: false,
  });

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        let autorizado = false;

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const email = (user.email ?? "").trim().toLowerCase();

            if (ehEmailAdminTeste(email)) {
              autorizado = true;
            } else {
              const { data } = await supabase
                .from("usuario")
                .select("papel")
                .eq("auth_user_id", user.id)
                .maybeSingle<{ papel: string | null }>();

              autorizado = ehPapelAdmin(data?.papel);
            }
          }
        } catch (erro) {
          console.log("Não deu para conferir o administrador:", erro);
        }

        if (ativo) setEstado({ carregando: false, autorizado });
      })();

      return () => {
        ativo = false;
      };
    }, [])
  );

  return estado;
}
