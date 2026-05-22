# Kanpai Blue · Cardápio Digital

Cardápio digital de proposta para o **Kanpai Blue**, restaurante japonês contemporâneo em Goiânia/GO. Alternativa premium ao cardápio LiveMenu/Tagme genérico — vitrine editorial em grid, paleta acolhedora com azul Kanpai como tinta única, hairlines 0.5px como assinatura gráfica.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** com tokens da paleta
- **Framer Motion** para microtransições e fade entre páginas
- **Inter** (next/font/google, pesos 400 e 500)
- Mobile-first, responsivo até 1440px+
- Deploy pronto para **Vercel**

## Rodar local

```bash
pnpm install
pnpm dev
```

Acesse `http://localhost:3000`.

> Funciona igual com `npm` ou `yarn` se preferir.

## Deploy na Vercel

Sem variáveis de ambiente. Duas opções:

1. **CLI** (com `npm i -g vercel`):
   ```bash
   npx vercel
   ```
   Aceite os defaults — framework já é detectado como Next.js.

2. **Dashboard**: empurre o repo pro GitHub e importe em [dashboard.vercel.com](https://dashboard.vercel.com).

## Como editar o cardápio

**Todo o conteúdo vive em [`lib/menu-data.ts`](lib/menu-data.ts).** Não é preciso mexer em componentes para trocar nomes, preços ou descrições.

### Editar um prato existente

Abra `lib/menu-data.ts` e encontre o `Dish` que você quer alterar. Exemplo:

```ts
{
  id: "quente-1",
  name: "Wagyu A5",                                // ← nome do prato
  price: "R$ 289",                                 // ← preço (use "" para mostrar "—")
  description: "Steak grelhado na robata...",     // ← opcional — sem isso o card termina no preço
  featured: true,                                  // ← linha inteira + badge DESTAQUE
  featuredGradient: "blue",                        // ← "blue" ou "beige" para featured
  subcategory: "Robata",                           // ← alimenta os chips do topo
},
```

### Adicionar uma categoria

Adicione um novo objeto ao array `categories`:

```ts
{
  id: "entradas",                                  // ← slug, vira /entradas na URL
  number: "07",
  name: "Entradas",
  description: "8 itens · começo da refeição",    // microinfo do card da home
  itemCount: "8 itens",
  detail: "começo da refeição",
  gradient: "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)",
  subcategories: ["Todos", "Quentes", "Frias"],
  dishes: [
    { id: "ent-1", name: "Edamame", price: "R$ 18" },
    // ...
  ],
}
```

### Marcar uma categoria como Festival (featured no índice)

Adicione `featured: true` na categoria. Ela ganha borda sólida azul Kanpai e placeholder em gradiente azul com estrela no canto, automaticamente.

## Trocar placeholders por fotos reais

Hoje todos os pratos usam o componente `PlaceholderImage` (gradiente bege ou azul + número no canto). Para usar fotos reais:

1. Crie `public/dishes/` e adicione as imagens (ex.: `wagyu.jpg`).
2. Estenda o tipo `Dish` em `lib/menu-data.ts`:
   ```ts
   export type Dish = {
     // ...
     image?: string;
   };
   ```
3. Em `components/DishCardSmall.tsx` (e `DishCardFeatured.tsx`), troque o `<PlaceholderImage />` por:
   ```tsx
   {dish.image ? (
     <Image src={dish.image} alt={dish.name} width={600} height={600} />
   ) : (
     <PlaceholderImage gradient={gradient} number={number} />
   )}
   ```
4. Importe `Image` de `next/image` no topo do arquivo.

Pratos sem `image` continuam mostrando o placeholder — adoção incremental, sem big-bang.

## Cores

```css
--bg-warm:  #FAFAF8   /* tema padrão, fundo mais quente */
--bg-cool:  #F7F8FA   /* alternativa fria, premium */
--bg-frame: #F5EFE3   /* moldura externa no mobile */
--bg-card:  #FBFAF6   /* fundo dos cards */
--ink:      #1A0E6E   /* azul Kanpai — texto e detalhes */
--ink-soft: rgba(26, 14, 110, 0.55)   /* texto secundário */
--ink-faint: rgba(26, 14, 110, 0.18)  /* hairlines */
--ink-ghost: rgba(26, 14, 110, 0.12)  /* divisores sutis */
```

O toggle de tema (warm ↔ cool) está no canto direito do header. A escolha persiste em `localStorage` na chave `kanpai-theme`.

## Estrutura de pastas

```
app/
  layout.tsx                # Inter, viewport, ThemeProvider
  page.tsx                  # Home: vitrine de categorias
  [categoria]/page.tsx      # Tela da categoria com pratos
  globals.css               # variáveis CSS, reset, moldura
components/
  Header.tsx                # logo + toggle (com prop de seta voltar)
  Footer.tsx                # microcopy esquerda/direita
  ThemeProvider.tsx         # provider warm/cool + localStorage
  ThemeToggle.tsx           # toggle visual de tema
  CategoryCard.tsx          # card da home
  CategoryView.tsx          # client view com chips + grid misto
  DishCardSmall.tsx         # card 2x2
  DishCardFeatured.tsx      # card linha cheia com DESTAQUE
  SubcategoryChips.tsx      # chips filtráveis
  PlaceholderImage.tsx      # placeholder com gradiente
  FAB.tsx                   # botão flutuante "Cardápio"
  AppShell.tsx              # moldura + transição de página
lib/
  menu-data.ts              # ÚNICO arquivo a editar pro conteúdo
```

---

Pronto para apresentar como prova de conceito. O conteúdo aqui é genérico (6 categorias placeholder com pratos variados); basta trocar pelos dados reais do restaurante depois.
