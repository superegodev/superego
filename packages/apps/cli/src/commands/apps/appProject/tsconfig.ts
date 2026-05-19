const tsconfig = {
  compilerOptions: {
    target: "ESNext",
    module: "ESNext",
    moduleResolution: "Bundler",
    jsx: "react",
    strict: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
  },
  include: ["main.tsx", "Collection_*.ts", "node_modules/**/*.d.ts"],
};

export default tsconfig;
