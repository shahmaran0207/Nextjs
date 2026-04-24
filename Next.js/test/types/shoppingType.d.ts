export type Product = {
    id: bigint | number;
    name: string;
    description: string | null;
    price: string | number;
    stock: number;
    sku: string | null;
    has_image: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type DarkTheme = {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    borderHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentDim: string;
};