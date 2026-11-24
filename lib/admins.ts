/**
 * Permissões do administrador.
 *
 * "Admin" é quem tem `papel = 'admin'` ou `papel = 'administrador'` na tabela
 * `usuario`. Tirar a permissão deixa a pessoa sem papel (volta a ser aluno,
 * como quem acabou de se cadastrar); dar a permissão grava 'admin'.
 *
 * Se a consulta falhar (sem internet ou bloqueada pelo banco), devolvemos
 * `null` para a tela conseguir avisar em vez de mostrar uma lista vazia como se
 * ninguém fosse administrador.
 */

import { supabase } from "@/lib/supabase";

/** Os valores de `usuario.papel` que contam como administrador. */
export const PAPEIS_ADMIN = ["admin", "administrador"];

/** E-mail que, para fins de teste, entra como administrador. */
export const EMAIL_ADMIN_TESTE = "prysmo.lume@gmail.com";

/** Diz se um `papel` (como vem do banco) é de administrador. */
export function ehPapelAdmin(papel: string | null | undefined): boolean {
  const valor = (papel ?? "").trim().toLowerCase();
  return PAPEIS_ADMIN.includes(valor);
}

/** Diz se um e-mail é o de teste do administrador. */
export function ehEmailAdminTeste(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === EMAIL_ADMIN_TESTE;
}

export type PessoaAdmin = {
  usuarioId: number;
  nome: string;
};

type LinhaBanco = {
  usuario_id: number;
  nome_completo: string | null;
};

type LinhaComPapel = LinhaBanco & {
  papel: string | null;
};

function nomeDe(linha: LinhaBanco): string {
  const nome = linha.nome_completo?.trim();
  return nome && nome.length > 0 ? nome : `Usuário #${linha.usuario_id}`;
}

/** Todos os administradores, em ordem alfabética. */
export async function carregarAdmins(): Promise<PessoaAdmin[] | null> {
  try {
    const { data, error } = await supabase
      .from("usuario")
      .select("usuario_id, nome_completo")
      .in("papel", PAPEIS_ADMIN)
      .order("nome_completo", { ascending: true });

    if (error) {
      console.log("Erro ao ler os administradores:", error.message);
      return null;
    }

    return ((data ?? []) as LinhaBanco[]).map((linha) => ({
      usuarioId: linha.usuario_id,
      nome: nomeDe(linha),
    }));
  } catch (erro) {
    console.log("Erro ao ler os administradores:", erro);
    return null;
  }
}

/** Quem ainda não é administrador, para poder ganhar a permissão. */
export async function carregarNaoAdmins(): Promise<PessoaAdmin[] | null> {
  try {
    const { data, error } = await supabase
      .from("usuario")
      .select("usuario_id, nome_completo, papel")
      .order("nome_completo", { ascending: true });

    if (error) {
      console.log("Erro ao ler os usuários:", error.message);
      return null;
    }

    return ((data ?? []) as LinhaComPapel[])
      .filter((linha) => !ehPapelAdmin(linha.papel))
      .map((linha) => ({
        usuarioId: linha.usuario_id,
        nome: nomeDe(linha),
      }));
  } catch (erro) {
    console.log("Erro ao ler os usuários:", erro);
    return null;
  }
}

/** Dá ou tira a permissão de administrador. Devolve o erro, ou null se deu certo. */
export async function definirAdmin(
  usuarioId: number,
  admin: boolean
): Promise<string | null> {
  try {
    const candidatosPapel: (string | null)[] = admin
      ? ["admin"]
      : [null, "user", "usuario", "comum", "member", "aluno"];

    let ultimoErro: string | null = null;
    let linhas: { usuario_id: number }[] | null = null;

    for (const papel of candidatosPapel) {
      const resposta = await supabase
        .from("usuario")
        .update({ papel })
        .eq("usuario_id", usuarioId)
        .select("usuario_id");

      if (!resposta.error) {
        ultimoErro = null;
        linhas = resposta.data as { usuario_id: number }[] | null;
        break;
      }

      ultimoErro = resposta.error.message;
    }

    if (ultimoErro) {
      console.log("Erro ao salvar a permissão:", ultimoErro);
      return ultimoErro;
    }

    if (!linhas || linhas.length === 0) {
      return "Sem permissão no banco (RLS) para alterar este usuário.";
    }

    return null;
  } catch (erro) {
    console.log("Erro ao salvar a permissão:", erro);
    return "Não deu para salvar agora. Tente de novo em instantes.";
  }
}
