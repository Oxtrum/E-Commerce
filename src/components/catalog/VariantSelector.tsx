import { useMemo, useState } from "react"

import type { CatalogVariant } from "@/types/catalog"

interface VariantSelectorProps {
  variants: CatalogVariant[]
  value: string
  onValueChange: (variantId: string) => void
}

function isAvailable(variant: CatalogVariant) {
  return variant.stockVisible > 0
}

export function VariantSelector({
  variants,
  value,
  onValueChange,
}: VariantSelectorProps) {
  const [selection, setSelection] = useState<Record<string, string>>({})
  const activeVariants = useMemo(() => variants, [variants])
  const attributeNames = useMemo(
    () => [
      ...new Set(activeVariants.flatMap((variant) => Object.keys(variant.atributos))),
    ],
    [activeVariants],
  )

  if (!attributeNames.length) {
    return (
      <label className="block text-sm">
        Variante
        <select
          className="mt-1 w-full rounded-md border bg-background p-2"
          onChange={(event) => onValueChange(event.target.value)}
          value={value}
        >
          <option value="">Selecciona una variante</option>
          {activeVariants.map((variant) => (
            <option
              disabled={!isAvailable(variant)}
              key={variant.productoVarianteId}
              value={variant.productoVarianteId}
            >
              {variant.nombre} — {variant.sku} — stock {variant.stockVisible}
            </option>
          ))}
        </select>
      </label>
    )
  }

  const updateSelection = (attribute: string, attributeValue: string) => {
    const nextSelection = { ...selection, [attribute]: attributeValue }
    setSelection(nextSelection)

    const resolvedVariant = activeVariants.find(
      (variant) =>
        isAvailable(variant) &&
        attributeNames.every(
          (name) =>
            nextSelection[name] &&
            String(variant.atributos[name]) === nextSelection[name],
        ),
    )
    onValueChange(resolvedVariant?.productoVarianteId ?? "")
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Selecciona una variante</legend>
      {attributeNames.map((attribute) => {
        const values = [
          ...new Set(
            activeVariants
              .map((variant) => variant.atributos[attribute])
              .filter((attributeValue) => attributeValue != null)
              .map(String),
          ),
        ]

        return (
          <label className="block text-sm" key={attribute}>
            {attribute}
            <select
              className="mt-1 w-full rounded-md border bg-background p-2"
              onChange={(event) =>
                updateSelection(attribute, event.target.value)
              }
              value={selection[attribute] ?? ""}
            >
              <option value="">Seleccionar</option>
              {values.map((attributeValue) => {
                const candidateSelection = {
                  ...selection,
                  [attribute]: attributeValue,
                }
                const canResolve = activeVariants.some(
                  (variant) =>
                    isAvailable(variant) &&
                    Object.entries(candidateSelection).every(
                      ([name, selectedValue]) =>
                        !selectedValue ||
                        String(variant.atributos[name]) === selectedValue,
                    ),
                )

                return (
                  <option
                    disabled={!canResolve}
                    key={attributeValue}
                    value={attributeValue}
                  >
                    {attributeValue}
                  </option>
                )
              })}
            </select>
          </label>
        )
      })}
      {value ? <p className="text-sm">Variante disponible seleccionada.</p> : null}
    </fieldset>
  )
}
