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
  MagnifyingGlass,
  ToggleRight,
  ForkKnife,
  Stack,
  TextAlignLeft,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

/** Faixa de título que separa as grandes partes do guia. */
function PartTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-4 border-b border-ink-ghost pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
      {children}
    </h2>
  );
}

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
        <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
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
      <h4 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
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
      </h4>
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
          Pratos Quentes, Festival) e, dentro delas, os <strong>Pratos / itens</strong>. No menu à esquerda:
        </p>
        <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
          <li className="flex gap-2">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-accent" weight="bold" />
            <span><strong>Cardápio</strong> — visão geral e busca; é por aqui que você entra nas categorias e nos itens.</span>
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

      {/* ===================== PARTE 1: CATEGORIAS ===================== */}
      <PartTitle>Parte 1 — Categorias</PartTitle>

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
          Para mudar uma já existente, clique em <strong>Editar</strong>. A seguir, o que significa cada campo.
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
            <h4 className="text-sm font-semibold text-ink">Quadrada (1:1)</h4>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Padrão, quando a categoria <strong>não</strong> está em destaque. Saída 1200×1200.
              É o card normal da home.
            </p>
          </div>
          <div className="rounded-xl border border-accent/40 bg-accent-soft/40 p-4">
            <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-bg-muted text-xs font-medium text-ink-muted">
              16:9
            </div>
            <h4 className="text-sm font-semibold text-ink">Widescreen (16:9)</h4>
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
      <Section icon={<Sparkle size={20} weight="duotone" />} title="Destaque e exibição da categoria">
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

      {/* Programação categoria */}
      <Section icon={<CalendarBlank size={20} weight="duotone" />} title="Programação da categoria (opcional)">
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
      </Section>

      {/* ===================== PARTE 2: PRATOS ===================== */}
      <PartTitle>Parte 2 — Pratos / itens do cardápio</PartTitle>

      {/* Buscar, ativar, editar, reordenar */}
      <Section icon={<MagnifyingGlass size={20} weight="duotone" />} title="Buscar, editar e reordenar itens">
        <Field name="Barra de busca">
          Digite o nome do prato, a categoria ou a subcategoria — a busca ignora acentos e maiúsculas e
          mostra os primeiros resultados. Clique em um resultado pra abrir o item direto na edição.
          Itens desligados aparecem marcados como <strong>“Inativo”</strong>.
        </Field>
        <Field name="Reordenar (arrastar)">
          Cada item tem uma <strong>alça</strong> (o ícone de arrastar) na lista. Segure e arraste pra
          mudar a ordem em que aparecem no site. Se a categoria usa subcategorias, arrastar o
          <strong> cabeçalho da seção</strong> move o grupo inteiro de uma vez.
        </Field>
        <Field name="Editar / Excluir">
          O botão <strong>Editar</strong> (lápis) abre o formulário do item. O botão de
          <strong> lixeira</strong> apaga de vez — diferente de desativar, não dá pra desfazer, então
          use com cuidado.
        </Field>
      </Section>

      {/* Ativar/desativar */}
      <Section icon={<ToggleRight size={20} weight="duotone" />} title="Ativar e desativar um item">
        <p className="text-sm leading-relaxed text-ink-secondary">
          O botãozinho <strong>“Ativo”</strong> (toggle) na lista liga e desliga o item no cardápio do
          site na hora:
        </p>
        <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
          <li className="flex gap-2">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-accent" weight="bold" />
            <span><strong>Ligado</strong> — o item aparece pro cliente.</span>
          </li>
          <li className="flex gap-2">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-accent" weight="bold" />
            <span>
              <strong>Desligado</strong> — some do cardápio, mas <strong>não é apagado</strong>. Use
              pra item que faltou no estoque ou que volta depois. É o jeito seguro de “esconder”
              sem perder os dados.
            </span>
          </li>
        </ul>
      </Section>

      {/* Novo item campo a campo */}
      <Section icon={<ForkKnife size={20} weight="duotone" />} title="Novo item, campo a campo">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Em <strong>Novo item</strong> (ou ao editar um prato), você encontra:
        </p>
        <Field name="Nome" badge="obrigatório">
          O nome do prato como o cliente vê.
        </Field>
        <Field name="Categoria" badge="obrigatório">
          Em qual seção do cardápio o item entra. Dá pra mover o prato de categoria depois é só trocar aqui.
        </Field>
        <Field name="Descrição" badge="opcional">
          O texto curto embaixo do nome (ingredientes, modo de preparo). Para texto longo e seções, veja
          <em> “Detalhes”</em> mais abaixo.
        </Field>
        <Field name="Preço" badge="opcional">
          É <strong>texto livre</strong>, então escreva como deve aparecer (ex.:{" "}
          <code className="rounded bg-bg-muted px-1 font-mono text-xs">R$ 82,90</code>). Pode deixar
          vazio em itens sem preço fixo (ex.: que só têm variantes).
        </Field>
        <Field name="Preço antes (promo)" badge="opcional">
          O preço “de” que aparece <strong>riscado</strong> ao lado do preço atual — vira o efeito
          “de R$ 174,90 por R$ 139,90”. Deixe vazio quando não houver promoção.
        </Field>
        <Field name="Subcategoria" badge="opcional">
          Agrupa o item dentro da categoria (vira aquele cabeçalho de seção na lista e no site). Itens
          com a mesma subcategoria ficam juntos.
        </Field>
        <Field name="Badges">
          Selinhos pequenos no card (ex.: marcadores de tipo do prato). Marque os que se aplicam.
        </Field>
      </Section>

      {/* Variantes */}
      <Section icon={<Stack size={20} weight="duotone" />} title="Variantes (opções com preços diferentes)">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Use <strong>Variantes</strong> quando o mesmo item tem opções de escolha com preços próprios —
          ex.: escolha de proteína, sabor ou tamanho. Clique em <strong>“+ Adicionar variante”</strong>
          e preencha o <strong>nome</strong> e o <strong>preço</strong> de cada opção (ex.: “Frango — R$ 48”,
          “Camarão — R$ 62”). Cada variante é uma linha; o botão <strong>Remover</strong> tira a opção.
        </p>
      </Section>

      {/* Pratos incluídos no menu */}
      <Section icon={<ForkKnife size={20} weight="duotone" />} title="Pratos incluídos no menu (entradas, principais, sobremesas)">
        <p className="text-sm leading-relaxed text-ink-secondary">
          A seção <strong>“Pratos incluídos neste menu”</strong> serve pra montar menus executivos,
          combos e festivais — você vincula <strong>outros pratos</strong> como etapas. As abas
          separam por tipo: <strong>Entradas</strong>, <strong>Entradas frias</strong>,{" "}
          <strong>Principais</strong> e <strong>Sobremesas</strong>.
        </p>
        <Field name="Adicionar um prato existente">
          Na aba desejada, clique em <strong>“Adicionar entrada/principal…”</strong>. Abre uma busca —
          digite o nome e clique pra incluir. Se o prato for de <strong>outra unidade</strong>, ele vem
          marcado com um selo e é <strong>copiado pra esta unidade</strong> automaticamente ao adicionar.
        </Field>
        <Field name="Criar um prato novo na hora">
          Use <strong>“Criar novo prato”</strong> pra cadastrar um item e já vinculá-lo, sem sair da tela.
        </Field>
        <Field name="Organizar os itens incluídos">
          Cada item da etapa tem: o <strong>toggle Ativo</strong>, o <strong>lápis</strong> pra editar
          (inclusive adicionar foto), as setas <strong>↑ ↓</strong> pra reordenar e a{" "}
          <strong>lixeira</strong> pra desvincular (não apaga o prato, só tira do menu).
        </Field>
        <Field name="Título da etapa no cardápio">
          Por padrão a etapa aparece como “Entradas”, “Principais” etc. Você pode trocar esse rótulo
          (ex.: “Para começar”, “Prato principal”) no campo <em>Título da etapa</em>. Deixe vazio pra usar o padrão.
        </Field>
      </Section>

      {/* Destaque do prato + programação */}
      <Section icon={<Sparkle size={20} weight="duotone" />} title="Prato em destaque e programação">
        <Field name="Prato em destaque">
          Marca o item como destaque: ele vira um card de <strong>linha cheia em 16:9</strong> com um
          selo. Ao marcar, aparece o campo <strong>“Texto do badge”</strong> — o que escreve aí aparece
          no canto da foto (ex.: NOVO, MAIS PEDIDO, PROMOÇÃO, EXCLUSIVO). Vazio = “DESTAQUE”.
        </Field>
        <Field name="Foto do prato: 1:1 ou 16:9">
          Igual à categoria: normalmente a foto é <strong>quadrada (1:1)</strong>; se o prato estiver em
          <strong> destaque</strong> (ou estiver numa categoria de <strong>Festival</strong>), ela passa
          a ser <strong>16:9</strong>. Marque o destaque antes de subir a foto pra recortar no formato certo.
        </Field>
        <Field name="Programação">
          Mesma lógica da categoria: dá pra agendar data/hora de início e fim e dias ocultos pra o item
          aparecer e sumir sozinho. Ótimo pra pratos sazonais e promoções com prazo.
        </Field>
        <Field name="Criar também em outra unidade">
          Na criação, marque pra cadastrar o mesmo prato na outra unidade de uma vez.
        </Field>
      </Section>

      {/* Detalhes (texto longo + seções) */}
      <Section icon={<TextAlignLeft size={20} weight="duotone" />} title='Detalhes: texto longo + seções (modal "Ver itens")'>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Ao <strong>editar</strong> um prato existente, há o bloco{" "}
          <strong>“Detalhes (texto longo + seções)”</strong> com o botão <strong>“Editar detalhes”</strong>.
          É o conteúdo que aparece no <strong>modal “Ver itens”</strong> do cardápio — ideal pra{" "}
          <strong>Festival Premium</strong> e menus com mais texto.
        </p>
        <Field name="Descrição longa">
          O texto principal que abre no topo do modal — uma apresentação geral do menu/prato.
        </Field>
        <Field name="Seções">
          Blocos de <strong>título + texto</strong> em lista, abaixo da descrição longa. Clique em
          <strong> “+ Adicionar seção”</strong>, dê um <strong>título</strong> (ex.: “Entradas Da Cozinha”)
          e o <strong>conteúdo</strong> (a lista de itens daquela etapa). Pode reordenar arrastando. Use
          pra detalhar tudo que vem no menu sem poluir o card.
        </Field>
        <div className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-ink-secondary">
          Depois de salvar qualquer coisa, confira no <strong>site público</strong> (link no rodapé do
          menu). As mudanças refletem em tempo real.
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
