"use client";

import { useState, useTransition } from "react";
import { fs } from "@/lib/scale";
import { SiteSelect } from "@/components/SiteSelect";
import { submitReview } from "./actions";

type Restaurant = { id: string; name: string };

type Props = {
  restaurants: Restaurant[];
  defaultRestaurantId?: string;
};

type RatingFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  value: number;
  onChange: (v: number) => void;
};

function RatingField({ name, label, required, value, onChange }: RatingFieldProps) {
  const [hover, setHover] = useState(0);
  const preview = hover || value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: fs(13),
          fontWeight: 500,
          letterSpacing: "-0.005em",
          color: "var(--ink)",
        }}
      >
        {label} {required ? <span style={{ color: "#d63333" }}>*</span> : null}
      </label>
      <input type="hidden" name={name} value={value || ""} />
      <div
        role="radiogroup"
        aria-label={label}
        className="rating-stars"
        onMouseLeave={() => setHover(0)}
        style={{ display: "flex", gap: 6 }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= preview;
          const isHoverTarget = hover > 0 && n <= hover;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
              className="rating-star-btn"
              onClick={() => onChange(value === n ? 0 : n)}
              onMouseEnter={() => setHover(n)}
              style={{
                width: 38,
                height: 38,
                padding: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: filled ? "var(--ink)" : "var(--ink-faint)",
                transform: isHoverTarget ? "scale(1.06)" : "scale(1)",
                transition: "color 140ms ease, transform 140ms ease",
                lineHeight: 0,
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              >
                <path d="M12 3l2.7 5.7 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 2.9 1.3-6.2L3 9.4l6.3-.7L12 3z" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewForm({ restaurants, defaultRestaurantId }: Props) {
  const [restaurantId, setRestaurantId] = useState(defaultRestaurantId ?? "");
  const [overall, setOverall] = useState(0);
  const [food, setFood] = useState(0);
  const [ambience, setAmbience] = useState(0);
  const [service, setService] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitReview(formData);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div
        style={{
          padding: "32px 24px",
          textAlign: "center",
          border: "1px solid var(--ink)",
          borderRadius: 18,
          background: "var(--bg-card)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <p style={{ margin: 0, fontSize: fs(20), fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em" }}>
          Obrigado pela avaliação!
        </p>
        <p style={{ margin: 0, fontSize: fs(13), color: "var(--ink-soft)" }}>
          Seu feedback foi recebido e ajuda a melhorar nossa experiência.
        </p>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          htmlFor="restaurant_id"
          style={{
            fontSize: fs(13),
            fontWeight: 500,
            letterSpacing: "-0.005em",
            color: "var(--ink)",
          }}
        >
          Restaurante <span style={{ color: "#d63333" }}>*</span>
        </label>
        <SiteSelect
          id="restaurant_id"
          name="restaurant_id"
          required
          value={restaurantId}
          onChange={setRestaurantId}
          placeholder="Selecione"
          options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
        />
      </div>

      <RatingField name="overall" label="Como foi sua experiência geral?" required value={overall} onChange={setOverall} />
      <RatingField name="food" label="Comida" value={food} onChange={setFood} />
      <RatingField name="ambience" label="Ambiente" value={ambience} onChange={setAmbience} />
      <RatingField name="service" label="Atendimento" value={service} onChange={setService} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="waiter_name" style={{ fontSize: fs(13), fontWeight: 500, color: "var(--ink)" }}>
          Nome do garçom <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>(opcional)</span>
        </label>
        <input
          id="waiter_name"
          name="waiter_name"
          type="text"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid var(--ink-faint)",
            background: "var(--bg-card)",
            color: "var(--ink)",
            fontSize: fs(14),
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="comment" style={{ fontSize: fs(13), fontWeight: 500, color: "var(--ink)" }}>
          Gostaria de deixar algum comentário?
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="Escreva aqui..."
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid var(--ink-faint)",
            background: "var(--bg-card)",
            color: "var(--ink)",
            fontSize: fs(14),
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </div>

      <fieldset
        style={{
          border: "1px solid var(--ink-faint)",
          borderRadius: 14,
          padding: "18px 16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <legend
          style={{
            padding: "0 6px",
            fontSize: fs(10),
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          Para contato (opcional)
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="contact_name" style={{ fontSize: fs(12), color: "var(--ink)" }}>Seu nome</label>
          <input
            id="contact_name"
            name="contact_name"
            type="text"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--ink-faint)",
              background: "var(--bg-card)",
              color: "var(--ink)",
              fontSize: fs(13),
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="contact_email" style={{ fontSize: fs(12), color: "var(--ink)" }}>E-mail</label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--ink-faint)",
              background: "var(--bg-card)",
              color: "var(--ink)",
              fontSize: fs(13),
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="contact_phone" style={{ fontSize: fs(12), color: "var(--ink)" }}>Telefone / WhatsApp</label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            inputMode="tel"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--ink-faint)",
              background: "var(--bg-card)",
              color: "var(--ink)",
              fontSize: fs(13),
            }}
          />
        </div>
      </fieldset>

      {error ? (
        <p style={{ margin: 0, fontSize: fs(12), color: "#d63333", textAlign: "center" }}>{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: "16px 22px",
          borderRadius: 999,
          border: "1px solid var(--ink)",
          background: pending ? "var(--ink-soft)" : "var(--ink)",
          color: "#FAFAF8",
          fontSize: fs(14),
          fontWeight: 500,
          letterSpacing: "-0.005em",
          cursor: pending ? "wait" : "pointer",
          transition: "background 160ms ease",
        }}
      >
        {pending ? "Enviando..." : "Enviar avaliação"}
      </button>
    </form>
  );
}
