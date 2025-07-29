import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      cardBackground: string;
      text: string;
      textSecondary: string;
      white: string;
      error: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
    };
    shadows: {
      card: string;
      cardHover: string;
    };
    typography: {
      sizes: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
      };
      weights: {
        light: number;
        regular: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      fontFamily: {
        heading: string;
        body: string;
      };
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }
}
