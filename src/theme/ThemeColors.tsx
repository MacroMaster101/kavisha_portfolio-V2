import { themeColors } from './brandColors';

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
