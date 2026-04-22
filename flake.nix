{
  description = "0xhckr.dev website";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            pnpm
            nodejs_22
            biome
            worker-build
          ];

          shellHook = ''
            # Force the dynamic linker to use nix-ld
            export NIX_LD=$(nix eval --raw nixpkgs#stdenv.cc.bintools.dynamicLinker)
            export NIX_LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath (with pkgs; [
              stdenv.cc.cc
              openssl
              zlib
            ])}"

            echo "Next.js + Turbopack environment ready"
          '';
        };

        # Simplified apps for clarity
        apps = let
          # Helper function to wrap pnpm commands with necessary env vars
          wrapPnpm = cmd: {
            type = "app";
            program = "${pkgs.writeShellScript "${cmd}" ''
              export NIX_LD=$(nix eval --raw nixpkgs#stdenv.cc.bintools.dynamicLinker)
              export NIX_LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath (with pkgs; [stdenv.cc.cc openssl zlib])}"
              ${pkgs.pnpm}/bin/pnpm ${cmd}
            ''}";
          };
        in {
          install = wrapPnpm "install";
          dev = wrapPnpm "dev";
          build = wrapPnpm "run build";
        };
      }
    );
}
