import type { ReactNode } from "react";
import Link from "next/link";
import {
  SquaresFour,
  ListBullets,
  ImageSquare,
  Hash,
  Sparkle,
  CalendarBlank,
  Buildings,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

/** Bloco de seção com título, ícone e conteúdo. */
function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-card p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
          {icon}
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Documentação de um campo do formulário. */
function Field({
  name,
  badge,
  children,
}: {
  name: string;
  badge?: "obrigatório" | "opcional";
  children: ReactNode;
}) {
  return (
    <div className="border-l-2 border-ink-ghost pl-4">
      <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
        {name}
        {badge ? (
          <span
            className={
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
              (badge === "obrigatório"
                ? "bg-danger-soft text-danger"
                : "bg-bg-muted text-ink-muted")
            }
          >
            {badge}
          </span>
        ) : null}
      </h3>
      <div className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{children}</div>
    </div>
  );
}

export default function ComoUsarPage() {
  return (
    <section className="flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Como usar o painel"
        description="Guia rápido pra montar e editar o cardápio sem medo de errar. Tudo que você salva aqui aparece no site na hora."
      />

      {/* Orientação geral */}
      <Section icon={<SquaresFour size={20} weight="duotone" />} title="Por onde começar">
        <p className="text-sm leading-relaxed text-ink-secondary">
          O cardápio é organizado em <strong>Categorias</strong> (as seções da home, ex.: Entradas,
          Pratos Quentes, Festival) e, dentro delas, os <strong>Pratos</strong>. No menu à esquerda:
        </p>
        <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
          <li className="flex gap-2">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-accent" weight="bold" />
            <span><strong>Cardápio</strong> — visão geral; é por aqui que você entra nos pratos.</span>
          </li>
          <li className="flex gap-2">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-accent" weight="bold" />
            <span><strong>Categorias</strong> — criar, editar, reordenar e ativar/desativar as seções.</span>
          </li>
        </ul>
        <div className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-ink-secondary">
          <strong className="text-ink">Atenção à unidade ativa.</strong> No rodapé do menu você escolhe
          a unidade (Flamboyant ou Goiânia Shopping). Tudo que você criar ou editar vale só pra unidade
          selecionada — confira sempre antes de começar.
        </div>
      </Section>

      {/* Conceito de categorias */}
      <Section icon={<ListBullets size={20} weight="duotone" />} title="Categorias: o conceito">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Cada categoria vira um <strong>card na home</strong> do cardápio. Existem dois tipos:
        </p>
        <Field name="Categoria de topo">
          Aparece direto na home. É o padrão (quando você não escolhe uma “categoria pai”).
        </Field>
        <Field name="Subseção (tem categoria pai)">
          Não aparece na home — fica <em>dentro</em> de outra categoria. Ex.: “Vinho Tinto” dentro de
          “Carta de Vinhos”. Serve pra organizar seções grandes em grupos menores.
        </Field>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Para criar, vá em <strong>Categorias</strong> e clique em <strong>Nova categoria</strong>.
          A seguir, o que significa cada campo.
        </p>
      </Section>

      {/* Campo a campo */}
      <Section icon={<Hash size={20} weight="duotone" />} title="Nova categoria, campo a campo">
        <Field name="Nome" badge="obrigatório">
          O título da seção como aparece pro cliente (ex.: “Entradas”, “Festival Premium”).
        </Field>

        <Field name="Número (ex: 01)" badge="obrigatório">
          É o rótulo numérico que aparece no card, tipo um índice (01, 02, 03…). Ele é só visual —
          <strong> não define a ordem</strong> das categorias na home. A ordem você ajusta arrastando
          os cards na lista de Categorias. Use números com dois dígitos (01, 02…) pra ficar alinhado.
        </Field>

        <Field name="Slug" badge="opcional">
          O “apelido” da categoria na URL (ex.: <code className="rounded bg-bg-muted px-1 font-mono text-xs">/festival</code>).
          Se deixar vazio, ele é gerado automaticamente a partir do nome. <strong>Depois de criado não
          pode mais mudar</strong>, então, se for digitar à mão, use só letras minúsculas, números e
          hífen (sem espaço nem acento).
        </Field>

        <Field name="Descrição" badge="opcional">
          Um textinho curto (microcopy) que aparece embaixo do nome no card. Ex.: “2 menus, principal
          experiência da casa”. Pode deixar em branco.
        </Field>

        <Field name="Categoria pai" badge="opcional">
          É aqui que você transforma a categoria numa <strong>subseção</strong>. Deixe em
          “Nenhuma” pra ela aparecer na home; ou escolha uma categoria pai pra ela ficar aninhada
          dentro daquela (e sumir da home). Só aparece se já existir alguma categoria que possa ser pai.
        </Field>

        <Field name="Item count / Detalhe / Nome curto" badge="opcional">
          Textos auxiliares e raramente necessários. <strong>Item count</strong> (ex.: “2 menus”) e
          <strong> Detalhe</strong> (ex.: “começo da refeição”) são complementos do card.
          <strong> Nome curto</strong> é uma versão reduzida do nome pra telas pequenas. Na dúvida, deixe vazios.
        </Field>

        <Field name="Gradient (fallback)">
          A cor de fundo do card quando a categoria <strong>não tem foto</strong>. Se você subir uma
          foto, ela cobre o gradiente — então só importa quando não há imagem.
        </Field>

        <Field name="Subcategorias" badge="opcional">
          Permite criar “abas/chips” dentro da categoria pra agrupar os pratos (ex.: separar por tipo).
          Cada subcategoria pode ser exibida como grade (com foto) ou lista (texto).
        </Field>
      </Section>

      {/* Imagens 1:1 vs 16:9 */}
      <Section icon={<ImageSquare size={20} weight="duotone" />} title="Foto da categoria: 1:1 ou 16:9">
        <p className="text-sm leading-relaxed text-ink-secondary">
          O formato da foto <strong>muda automaticamente</strong> conforme a opção
          <em> “Categoria em destaque”</em> (a caixinha lá embaixo do formulário):
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-ghost p-4">
            <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-bg-muted text-xs font-medium text-ink-muted">
              1:1
            </div>
            <h3 className="text-sm font-semibold text-ink">Quadrada (1:1)</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Padrão, quando a categoria <strong>não</strong> está em destaque. Saída 1200×1200.
              É o card normal da home.
            </p>
          </div>
          <div className="rounded-xl border border-accent/40 bg-accent-soft/40 p-4">
            <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-bg-muted text-xs font-medium text-ink-muted">
              16:9
            </div>
            <h3 className="text-sm font-semibold text-ink">Widescreen (16:9)</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Quando você marca <strong>“Categoria em destaque”</strong>. Saída 1920×1080, o card ganha
              borda azul Kanpai e ocupa a fileira inteira.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-bg-muted px-4 py-3 text-sm text-ink-secondary">
          <strong className="text-ink">Como recortar:</strong> ao subir a imagem, abre uma ferramenta
          de recorte — você arrasta e dá zoom pra enquadrar no formato certo. Por isso, marque
          “destaque” <em>antes</em> de subir a foto, pra já recortar no 16:9 correto. Se mudar o destaque
          depois, vale subir a foto de novo pra reenquadrar.
        </div>

        <Field name="Slideshow" badge="opcional">
          Em vez de uma foto única, você pode subir <strong>várias fotos</strong> que se alternam num
          cross-fade dentro do card. Bom pra promoções e eventos. Se preencher o slideshow, ele
          substitui a foto única.
        </Field>
      </Section>

      {/* Exibição e destaque */}
      <Section icon={<Sparkle size={20} weight="duotone" />} title="Destaque e exibição">
        <Field name="Categoria em destaque">
          Deixa o card maior, com foto 16:9 e borda azul. Use pra a seção principal do momento
          (ex.: o Festival). Como visto acima, isso também muda o formato da foto.
        </Field>
        <Field name="Card ocupa a fileira inteira">
          Faz o card esticar por toda a largura, empurrando os próximos pra linha de baixo. Bom pra dar
          peso a uma seção sem necessariamente marcá-la como destaque.
        </Field>
        <Field name="Como exibir os itens dentro da categoria">
          <strong>Cards com foto</strong> (padrão) — ideal pra pratos com imagem.{" "}
          <strong>Lista de texto</strong> — sem foto, melhor pra bebidas, drinks e vinhos, onde a foto
          não agrega.
        </Field>
      </Section>

      {/* Programação */}
      <Section icon={<CalendarBlank size={20} weight="duotone" />} title="Programação (opcional)">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Você pode agendar quando a categoria fica <strong>visível</strong>: data/hora de início e fim,
          e dias da semana em que ela fica oculta. Fora desse período ela some do site sozinha — útil
          pra festivais e promoções com prazo. Se não preencher, fica sempre visível (enquanto estiver ativa).
        </p>
      </Section>

      {/* Outras unidades */}
      <Section icon={<Buildings size={20} weight="duotone" />} title="Criar também em outra unidade">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Na criação, você pode marcar pra a categoria ser criada <strong>também</strong> na outra
          unidade de uma vez, sem precisar refazer tudo. Ela é copiada com os mesmos dados; depois cada
          unidade pode ser editada de forma independente.
        </p>
        <div className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-ink-secondary">
          Depois de salvar, é só conferir no <strong>site público</strong> (link no rodapé do menu).
          As mudanças refletem em tempo real.
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Link href="/cards/new" className="admin-btn-primary">
          Criar uma categoria agora
        </Link>
        <Link href="/cards" className="admin-btn-secondary">
          Ir para Categorias
        </Link>
      </div>
    </section>
  );
}
