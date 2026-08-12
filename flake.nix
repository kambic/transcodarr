{
  description = "Vault — Django 6 + HTMX file explorer with share scanning and ffmpeg transcoding";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;

      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      version = "0.1.0";

      # Django 6.0 may be newer than the channel. Prefer `django_6` when the
      # channel has it, accept `django` when it is already 6.x, and otherwise
      # build the pinned sdist — inside the same package set, so every consumer
      # of `python.pkgs.django` gets the same one.
      pythonFor = pkgs:
        let
          py = pkgs.python312.override {
            self = py;
            packageOverrides = final: prev: {
              django =
                if prev ? django_6 then prev.django_6
                else if lib.versionAtLeast prev.django.version "6.0" then prev.django
                else
                  final.buildPythonPackage rec {
                    pname = "django";
                    version = "6.0.7";
                    pyproject = true;

                    src = pkgs.fetchPypi {
                      inherit pname version;
                      hash = "sha256-KZhQP8CDEk+1gDcIS/oA3jI8fHQ/BfG0KE53v/CriJA=";
                    };

                    build-system = [ final.setuptools ];
                    dependencies = [ final.asgiref final.sqlparse ];

                    # The channel's asgiref may trail what Django's metadata
                    # asks for by a patch release; it works fine.
                    dontCheckRuntimeDeps = true;

                    # Django's own test suite needs a checkout, not the sdist.
                    doCheck = false;
                    pythonImportsCheck = [ "django" ];

                    meta = {
                      description = "High-level Python web framework";
                      homepage = "https://www.djangoproject.com/";
                      license = lib.licenses.bsd3;
                    };
                  };
            };
          };
        in
        py;

      packageFor = pkgs: pkgs.callPackage ./nix/package.nix {
        inherit version;
        python = pythonFor pkgs;
      };
    in
    {
      packages = forAllSystems (pkgs: rec {
        vault = packageFor pkgs;
        default = vault;
      });

      # `nix run` starts the server; `nix run .#manage -- migrate` is manage.py.
      apps = forAllSystems (pkgs:
        let vault = packageFor pkgs; in {
          # nix run .
          default = { type = "app"; program = "${vault}/bin/vault-serve"; };
          # nix run .#manage -- migrate | seed_demo | scan_share --all | ...
          manage = { type = "app"; program = "${vault}/bin/vault"; };
        });

      devShells = forAllSystems (pkgs:
        let
          python = pythonFor pkgs;
          pythonEnv = python.withPackages (ps: with ps; [
            django
            gunicorn
            # Nice to have while developing; none of it is imported by the app.
            ipython
            pytest
          ]);
        in
        {
          default = pkgs.mkShell {
            name = "vault-dev";

            packages = [
              pythonEnv
              pkgs.ffmpeg-headless # transcode app; ffprobe comes with it
              pkgs.sqlite # inspecting db.sqlite3
              pkgs.ruff
              pkgs.cifs-utils # mount.cifs, for testing against a real share
            ];

            env = {
              DJANGO_SETTINGS_MODULE = "config.settings";
              DJANGO_DEBUG = "1";
              PYTHONDONTWRITEBYTECODE = "1";
            };

            shellHook = ''
              echo "Vault dev shell — Django ${python.pkgs.django.version}, $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"
              echo
              echo "  python manage.py migrate"
              echo "  python manage.py seed_demo            # demo tree to click around"
              echo "  python manage.py runserver"
              echo "  python manage.py test                 # 75 tests"
              echo "  python manage.py scan_share --register 'Share' /mnt/smb/share"
              echo "  python manage.py transcode_media --presets"
              echo
            '';
          };
        });

      # `nix flake check` runs the real test suite in a sandbox.
      checks = forAllSystems (pkgs:
        let
          python = pythonFor pkgs;
          pythonEnv = python.withPackages (ps: with ps; [ django gunicorn ]);
          vault = packageFor pkgs;
        in
        {
          inherit vault;

          tests = pkgs.runCommand "vault-tests"
            {
              nativeBuildInputs = [ pythonEnv pkgs.ffmpeg-headless ];
            } ''
            cp -r ${vault}/share/vault/. .
            chmod -R u+w .
            export DJANGO_SETTINGS_MODULE=config.settings
            export VAULT_DATA_DIR="$TMPDIR/data"
            export HOME="$TMPDIR"
            python manage.py test --verbosity 2
            touch $out
          '';
        });

      nixosModules.default = import ./nix/module.nix { inherit self; };

      overlays.default = final: prev: {
        vault = packageFor final;
      };

      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}
