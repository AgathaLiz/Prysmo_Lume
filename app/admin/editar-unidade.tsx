import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { FormularioUnidade } from "@/components/FormularioUnidade";
import { ModalConfirmadoAdmin } from "@/components/ModalAdmin";
import { ProtecaoAdmin } from "@/components/ProtecaoAdmin";
import {
  atualizarUnidade,
  listarUnidades,
  type DadosUnidade,
  type Unidade,
} from "@/lib/unidades";

/**
 * Tela 5 — Editar Unidade (mockup): a mesma tela de criação, com os campos já
 * preenchidos com a unidade escolhida, e o botão "Confirmar".
 */
export default function TelaEditarUnidade() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const nivelId = useMemo(() => Number(id ?? 0), [id]);

  const [unidade, setUnidade] = useState<Unidade | null>(null);
  const [unidadesExistentes, setUnidadesExistentes] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      listarUnidades().then((lista) => {
        if (!ativo) return;
        setUnidade(lista?.find((item) => item.id === nivelId) ?? null);
        setUnidadesExistentes(lista?.length ?? 0);
        setCarregando(false);
      });

      return () => {
        ativo = false;
      };
    }, [nivelId])
  );

  const enviar = useCallback(
    async (dados: DadosUnidade) => {
      if (nivelId <= 0 || dados.nome.length === 0 || salvando) return;

      setSalvando(true);
      const resultado = await atualizarUnidade(nivelId, dados);
      setSalvando(false);

      if (!resultado.ok) {
        setPopup({
          titulo: "Não deu para salvar",
          mensagem: resultado.erro ?? "Não deu para salvar a unidade agora.",
          variante: "aviso",
        });
        return;
      }

      setPopup({
        titulo: "Confirmado!",
        mensagem: `A unidade "${dados.nome}" foi atualizada com sucesso.`,
        variante: "sucesso",
      });
    },
    [nivelId, salvando]
  );

  const fecharPopup = useCallback(() => {
    const sucesso = popup?.variante === "sucesso";
    setPopup(null);
    if (!sucesso) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin/gerenciar-unidades" as never);
    }
  }, [popup, router]);

  const voltar = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/admin/gerenciar-unidades" as never);
    }
  }, [router]);

  if (carregando) {
    return (
      <ProtecaoAdmin>
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#891CC0" />
        </View>
      </ProtecaoAdmin>
    );
  }

  return (
    <ProtecaoAdmin>
      <FormularioUnidade
        modo="editar"
        titulo="Gerenciar Unidades"
        rotuloBotao="Confirmar"
        unidadesExistentes={unidadesExistentes}
        salvando={salvando}
        valoresIniciais={{
          nome: unidade?.nome ?? "",
          dificuldade: unidade?.dificuldade ?? null,
          posicao: unidade?.posicao ?? null,
          numeroLicoes: unidade?.licoes.length ?? 0,
          licoesIds: unidade?.licoes.map((licao) => licao.id) ?? [],
        }}
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

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
