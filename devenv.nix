{ inputs, pkgs, ... }:

let
  # project_name = (builtins.fromJSON (builtins.readFile ./package.json)).name;
  # isCi = builtins.getEnv "CI" == "true";
in
{
  imports = [ inputs.utils.devenvModule ];
  overlays = [
    (final: prev: {
      playwright-test = inputs.playwright.packages.${prev.system}.playwright-test;
      playwright-driver = inputs.playwright.packages.${prev.system}.playwright-driver;
    })
    (final: prev: {
      unstable = import inputs.nixpkgs-unstable { system = prev.system; };
    })
  ];

  custom.js.nodejs.package = pkgs.nodejs_24;
  custom.js.pnpm.package = inputs.nixpkgs-unstable.legacyPackages.${pkgs.system}.pnpm;
  custom.js.setupPlaywright = true;
  custom.js.playwrightDriverPackage = pkgs.playwright-driver;
  packages = with pkgs; [
    actionlint
    unstable.tsgolint
  ];

}
