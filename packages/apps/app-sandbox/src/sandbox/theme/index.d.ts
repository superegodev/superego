interface ColorScale {
  _1: string;
  _2: string;
  _3: string;
  _4: string;
  _5: string;
}

export default interface Theme {
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
    // Use multiples with calc for other spacing values
    _4: "1rem";
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
}
