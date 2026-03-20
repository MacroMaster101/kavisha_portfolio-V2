export const themeColors = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  primaryLight: "rgba(99, 102, 241, 0.1)",
  primaryGlow: "rgba(99, 102, 241, 0.5)",
  primaryGlowHover: "rgba(99, 102, 241, 0.7)",
  secondary: "#a855f7",
  secondaryHover: "#9333ea",
};

export const ColorThemeConfig = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      :root {
        --brand-primary: ${themeColors.primary};
        --brand-primary-hover: ${themeColors.primaryHover};
        --brand-primary-light: ${themeColors.primaryLight};
        --brand-primary-glow: ${themeColors.primaryGlow};
        --brand-primary-glow-hover: ${themeColors.primaryGlowHover};
        --brand-secondary: ${themeColors.secondary};
        --brand-secondary-hover: ${themeColors.secondaryHover};
      }
    `}} />
  );
};
