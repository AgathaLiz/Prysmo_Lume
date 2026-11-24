import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";

import { FormularioUnidade } from "@/components/FormularioUnidade";
import { ModalConfirmadoAdmin } from "@/components/ModalAdmin";
import { ProtecaoAdmin } from "@/components/ProtecaoAdmin";
import { criarUnidade, listarUnidades, type DadosUnidade } from "@/lib/unidades";

/**
 * Tela 3 — Criar Unidade (mockup): o mesmo formulário da tela de edição, com a
 * faixa em degradê, os campos com ícone e o botão "Criar" embaixo.
 */
export default function TelaCriarUnidade() {
  const router = useRouter();

  const [unidadesExistentes, setUnidadesExistentes] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      listarUnidades().then((lista) => {
        if (ativo) setUnidadesExistentes(lista?.length ?? 0);
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  const enviar = useCallback(
    async (dados: DadosUnidade) => {
      if (dados.nome.length === 0 || salvando) return;

      setSalvando(true);
      const resultado = await criarUnidade(dados);
      setSalvando(false);

      if (!resultado.ok) {
        setPopup({
          titulo: "Não deu para criar",
          mensagem: resultado.erro ?? "Não deu para criar a unidade agora.",
          variante: "aviso",
        });
        return;
      }

      setPopup({
        titulo: "Confirmado!",
        mensagem: `A unidade "${dados.nome}" foi criada com sucesso.`,
        variante: "sucesso",
      });
    },
    [salvando]
  );

  const fecharPopup = useCallback(() => {
    const sucesso = popup?.variante === "sucesso";
    setPopup(null);
    if (sucesso) {
      router.replace("/admin/gerenciar-unidades" as never);
    }
  }, [popup, router]);

  const voltar = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/admin/unidades" as never);
    }
  }, [router]);

  return (
    <ProtecaoAdmin>
      <FormularioUnidade
        modo="criar"
        titulo="Criando Unidade"
        subtitulo={"Insira e confira as informações\npara criar uma nova Unidade/\nTrilha"}
        rotuloBotao="Criar"
        unidadesExistentes={unidadesExistentes}
        salvando={salvando}
        onEnviar={enviar}
        onVoltar={voltar}
      />

      <ModalConfirmadoAdmin
        visivel={popup !== null}
        titulo={popup?.titulo}
        mensagem={popup?.mensagem ?? ""}
        variante={popup?.variante}
        aoFechar={fecharPopup}
      />
    </ProtecaoAdmin>
  );
}
