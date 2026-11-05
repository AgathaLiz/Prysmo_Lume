import { supabase } from "@/lib/supabase";

export type ResultadoEdicao =
  | { ok: true; mensagem?: string }
  | { ok: false; erro: string };

const falha = (erro: string): ResultadoEdicao => ({ ok: false, erro });

async function atualizarCampoUsuario(
  campos: { nome_completo?: string; telefone?: string }
): Promise<ResultadoEdicao> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return falha("Sessão expirada. Entre novamente.");

  const { data, error } = await supabase
    .from("usuario")
    .update(campos)
    .eq("auth_user_id", auth.user.id)
    .select("usuario_id");

  if (error) {
    // 23505 = violação de UNIQUE (telefone já usado por outra conta)
    if (error.code === "23505") return falha("Esse telefone já está em uso em outra conta.");
    return falha("Não foi possível salvar. Tente novamente.");
  }
  // Sem erro mas sem linhas alteradas = RLS bloqueando o UPDATE
  if (!data || data.length === 0) {
    return falha("Sem permissão para alterar esse dado (verifique a policy de UPDATE da tabela usuario).");
  }
  return { ok: true };
}

/** Mesma máscara da tela de cadastro, para o telefone ficar igual em todo o banco. */
export function mascaraTelefone(valor: string) {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

export async function atualizarNome(nome: string): Promise<ResultadoEdicao> {
  const limpo = nome.trim().replace(/\s+/g, " ");
  if (limpo.length < 3) return falha("Digite seu nome completo.");
  return atualizarCampoUsuario({ nome_completo: limpo });
}

export async function atualizarTelefone(telefone: string): Promise<ResultadoEdicao> {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) {
    return falha("Telefone inválido. Use DDD + número.");
  }
  return atualizarCampoUsuario({ telefone: mascaraTelefone(digitos) });
}

export async function atualizarEmail(email: string): Promise<ResultadoEdicao> {
  const limpo = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) return falha("E-mail inválido.");

  const { error } = await supabase.auth.updateUser({ email: limpo });
  if (error) return falha(error.message || "Não foi possível alterar o e-mail.");

  return {
    ok: true,
    mensagem:
      "Enviamos um link de confirmação para o novo e-mail. A troca só vale depois que você confirmar.",
  };
}

export async function atualizarSenha(
  senhaAtual: string,
  novaSenha: string,
  confirmacao: string
): Promise<ResultadoEdicao> {
  if (!senhaAtual) return falha("Digite sua senha atual.");
  if (novaSenha.length < 6) return falha("A nova senha precisa ter ao menos 6 caracteres.");
  if (novaSenha !== confirmacao) return falha("A confirmação não confere com a nova senha.");
  if (novaSenha === senhaAtual) return falha("A nova senha deve ser diferente da atual.");

  const { data: auth } = await supabase.auth.getUser();
  const email = auth.user?.email;
  if (!email) return falha("Sessão expirada. Entre novamente.");

  // Confere a senha atual antes de trocar
  const { error: erroLogin } = await supabase.auth.signInWithPassword({
    email,
    password: senhaAtual,
  });
  if (erroLogin) return falha("Senha atual incorreta.");

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return falha(error.message || "Não foi possível alterar a senha.");

  return { ok: true, mensagem: "Senha alterada com sucesso." };
}