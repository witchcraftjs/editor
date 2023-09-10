{
  inputs =
    {
      nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
      systems.url = "github:nix-systems/default";
      devenv.url = "github:cachix/devenv";
      devenv.inputs.nixpkgs.follows = "nixpkgs";
      # IMPORTANT: this must be pinned to the same version in package.json
      # and no reading it directly is not supported (https://github.com/NixOS/nix/issues/4945)
      playwright.url = "github:pietdevries94/playwright-web-flake/1.54.0";
    };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = { self, nixpkgs, devenv, systems, playwright, ... } @ inputs:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      packages = forEachSystem (system: {
        devenv-up = self.devShells.${system}.default.config.procfileScript;
      });

      devShells = forEachSystem
        (system:
          let
            overlay = final: prev: {
              inherit (playwright.packages.${system}) playwright-test playwright-driver;
            };
            pkgs = import nixpkgs {
              inherit system;
              overlays = [ overlay ];
            };
          in
          {
            default = devenv.lib.mkShell {
              inherit inputs pkgs;
              modules =
                let
                in
                [
                  ({ pkgs, config, ... }: {
                    env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 1;
                    env.PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
                    env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
                    languages = {
                      javascript = {
                        enable = true;
                        package = pkgs.nodejs_23;
                        pnpm.enable = true;
                      };
                    };
                    packages = [
                      pkgs.playwright-test
                    ];
                    enterShell = ''
                      export NPM_TOKEN=$(cat $SECRETS_DIR/NPM_TOKEN)
                      export GH_TOKEN=$(cat $SECRETS_DIR/GH_TOKEN)
                      echo "node `${pkgs.nodejs_23}/bin/node --version`"
                      echo "pnpm `${pkgs.nodePackages.pnpm}/bin/pnpm --version`"
                      echo PLAYWRIGHT_BROWSERS_PATH $PLAYWRIGHT_BROWSERS_PATH;
                      echo PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH $PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
                    '';
                  })
                ];
            };
          });
    };
}
