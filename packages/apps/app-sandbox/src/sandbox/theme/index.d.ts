interface ColorScale {
  _1: string;
  _2: string;
  _3: string;
  _4: string;
  _5: string;
}

// Unless requested otherwise, use these values when applying custom styles.
declare const theme: {
  typography: {
    fontSizes: {
      xs3: string;
      xs2: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xl2: string;
      xl3: string;
      xl4: string;
    };
    fontFamilies: {
      sansSerif: string;
      serif: string;
      monospace: string;
    };
  };

  spacing: {
    // Equivalent to 1rem. Use multiples with calc for other spacing values
    _4: string;
  };

  borders: {
    radius: {
      none: string;
      md: string;
    };
    width: {
      thin: string;
      medium: string;
      thick: string;
    };
  };

  colors: {
    semantic: {
      info: {
        border: string;
        background: string;
        text: string;
        backgroundFilled: string;
        textFilled: string;
      };
      success: {
        border: string;
        background: string;
        text: string;
        backgroundFilled: string;
        textFilled: string;
      };
      pending: {
        border: string;
        background: string;
        text: string;
        backgroundFilled: string;
        textFilled: string;
      };
      warning: {
        border: string;
        background: string;
        text: string;
        backgroundFilled: string;
        textFilled: string;
      };
      error: {
        border: string;
        background: string;
        text: string;
        backgroundFilled: string;
        textFilled: string;
      };
    };

    // UI elements colors
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
    background: {
      surface: string;
      subtleSurface: string;
      secondarySurface: string;
      surfaceHighlight: string;
      inverse: string;
      inverseHighlight: string;
    };
    border: {
      default: string;
      strong: string;
      subtle: string;
      focus: string;
      disabled: string;
      inverse: string;
    };

    // Raw colors
    blues: ColorScale;
    greens: ColorScale;
    yellows: ColorScale;
    reds: ColorScale;
    cyans: ColorScale;
    teals: ColorScale;
    oranges: ColorScale;
    violets: ColorScale;
    pinks: ColorScale;
  };
};
export default theme;
