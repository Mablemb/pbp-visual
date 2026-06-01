// D&D 5e-style damage types with display metadata for the visual viewer.
export type DamageType =
    | 'bludgeoning' | 'slashing' | 'piercing'
    | 'acid' | 'lightning' | 'cold' | 'fire' | 'force'
    | 'necrotic' | 'psychic' | 'radiant' | 'thunder' | 'poison';

export interface DamageTypeMeta {
    label: string;
    icon: string;
    /** Tailwind-compatible HEX used for the flash tint and number color. */
    color: string;
}

export const DAMAGE_TYPES: Record<DamageType, DamageTypeMeta> = {
    bludgeoning: { label: 'Contundente', icon: '🪨', color: '#a16207' },
    slashing:    { label: 'Cortante',    icon: '🗡️', color: '#9ca3af' },
    piercing:    { label: 'Perfurante',  icon: '🏹', color: '#d4d4d8' },
    acid:        { label: 'Ácido',       icon: '🧪', color: '#65a30d' },
    lightning:   { label: 'Elétrico',    icon: '⚡', color: '#facc15' },
    cold:        { label: 'Frio',        icon: '❄️', color: '#38bdf8' },
    fire:        { label: 'Fogo',        icon: '🔥', color: '#f97316' },
    force:       { label: 'Força',       icon: '✨', color: '#a855f7' },
    necrotic:    { label: 'Necrótico',   icon: '💀', color: '#4b5563' },
    psychic:     { label: 'Psíquico',    icon: '🧠', color: '#ec4899' },
    radiant:     { label: 'Radiante',    icon: '🌟', color: '#fde047' },
    thunder:     { label: 'Trovão',      icon: '🌩️', color: '#6366f1' },
    poison:      { label: 'Venenoso',    icon: '☠️', color: '#16a34a' },
};

export const DAMAGE_TYPE_LIST: DamageType[] = Object.keys(DAMAGE_TYPES) as DamageType[];
