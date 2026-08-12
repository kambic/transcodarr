{ lib
, stdenvNoCC
, makeWrapper
, python
, ffmpeg-headless
, version ? "0.1.0"
}:

# The project is a Django site rather than a distributable library, so it is
# installed as a source tree plus wrappers rather than a Python package. That
# keeps `manage.py` working exactly as it does in development.
let
  pythonEnv = python.withPackages (ps: with ps; [ django gunicorn ]);
in
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "vault";
  inherit version;

  src = lib.cleanSourceWith {
    src = ../.;
    filter = path: type:
      let base = baseNameOf (toString path);
      in !(builtins.elem base [
        "result" ".git" "__pycache__" ".venv" "db.sqlite3" "media" "var"
        "staticfiles" ".direnv" ".pytest_cache"
      ]) && !(lib.hasSuffix ".pyc" base);
  };

  # ffmpeg is present at build time so the transcode app's system check passes.
  nativeBuildInputs = [ makeWrapper pythonEnv ffmpeg-headless ];

  # Collect static files at build time so the runtime data directory doesn't
  # need to be writable for a read-only deployment.
  buildPhase = ''
    runHook preBuild
    export DJANGO_SETTINGS_MODULE=config.settings
    export VAULT_DATA_DIR="$TMPDIR/build-data"
    export DJANGO_STATIC_ROOT="$TMPDIR/static"
    ${pythonEnv}/bin/python manage.py collectstatic --noinput --clear
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out/share/vault $out/share/vault-static $out/bin
    cp -r config explorer transcode manage.py $out/share/vault/
    cp -r "$TMPDIR/static/." $out/share/vault-static/

    # `vault` is manage.py: migrate, scan_share, transcode_media, createsuperuser…
    makeWrapper ${pythonEnv}/bin/python $out/bin/vault \
      --add-flags "$out/share/vault/manage.py" \
      --set-default DJANGO_SETTINGS_MODULE config.settings \
      --set-default DJANGO_STATIC_ROOT "$out/share/vault-static" \
      --chdir $out/share/vault \
      --prefix PATH : ${lib.makeBinPath [ ffmpeg-headless ]}

    # `vault-serve` runs the WSGI app under gunicorn. Reads VAULT_BIND,
    # VAULT_WORKERS and anything else gunicorn understands from the environment.
    makeWrapper ${pythonEnv}/bin/gunicorn $out/bin/vault-serve \
      --add-flags "config.wsgi:application" \
      --set-default DJANGO_SETTINGS_MODULE config.settings \
      --set-default DJANGO_STATIC_ROOT "$out/share/vault-static" \
      --set-default PYTHONPATH "$out/share/vault" \
      --chdir $out/share/vault \
      --prefix PATH : ${lib.makeBinPath [ ffmpeg-headless ]}

    runHook postInstall
  '';

  passthru = { inherit pythonEnv python; };

  meta = {
    description = "Django + HTMX file explorer with SMB share scanning and ffmpeg transcoding";
    mainProgram = "vault-serve";
    platforms = lib.platforms.unix;
  };
})
