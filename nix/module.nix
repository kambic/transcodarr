{ self }:
{ config, lib, pkgs, ... }:

let
  cfg = config.services.vault;
  inherit (lib) mkEnableOption mkOption mkIf types;

  environment = {
    DJANGO_SETTINGS_MODULE = "config.settings";
    DJANGO_DEBUG = "0";
    DJANGO_ALLOWED_HOSTS = lib.concatStringsSep "," cfg.allowedHosts;
    VAULT_DATA_DIR = cfg.dataDir;
    DJANGO_STATIC_ROOT = "${cfg.package}/share/vault-static";
  } // lib.optionalAttrs (cfg.secretKeyFile != null) {
    DJANGO_SECRET_KEY_FILE = cfg.secretKeyFile;
  } // cfg.environment;

  # The service and every timer touch the same state and the same mounts.
  common = {
    inherit environment;

    # Ordering only; systemd won't start these before the shares are mounted.
    # A share that is merely slow or flaky is still handled by the scanner's own
    # availability check — this just avoids the pointless failure at boot.
    unitConfig.RequiresMountsFor = cfg.shares;

    serviceConfig = {
      User = cfg.user;
      Group = cfg.group;
      StateDirectory = "vault";
      WorkingDirectory = cfg.dataDir;

      # Hardening. The app writes to its state directory and reads the shares.
      NoNewPrivileges = true;
      PrivateTmp = true;
      PrivateDevices = true;
      ProtectSystem = "strict";
      ProtectHome = true;
      ProtectKernelTunables = true;
      ProtectKernelModules = true;
      ProtectControlGroups = true;
      RestrictSUIDSGID = true;
      RestrictRealtime = true;
      LockPersonality = true;
      SystemCallArchitectures = "native";
      ReadWritePaths = [ cfg.dataDir ];
      ReadOnlyPaths = cfg.shares;
    };
  };
in
{
  options.services.vault = {
    enable = mkEnableOption "the Vault file explorer";

    package = mkOption {
      type = types.package;
      default = self.packages.${pkgs.stdenv.hostPlatform.system}.vault;
      defaultText = lib.literalExpression "self.packages.\${system}.vault";
      description = "The Vault package to run.";
    };

    user = mkOption {
      type = types.str;
      default = "vault";
      description = ''
        User the service runs as. It needs read access to every mounted share —
        for CIFS that usually means mounting with `uid=vault` or a matching
        `gid=`, since CIFS permissions are decided at mount time.
      '';
    };

    group = mkOption {
      type = types.str;
      default = "vault";
      description = "Group the service runs as.";
    };

    dataDir = mkOption {
      type = types.path;
      default = "/var/lib/vault";
      description = "Database, uploads, transcode output and scratch space.";
    };

    bind = mkOption {
      type = types.str;
      default = "127.0.0.1:8000";
      example = "0.0.0.0:8000";
      description = "Address gunicorn listens on. Put a TLS reverse proxy in front.";
    };

    workers = mkOption {
      type = types.ints.positive;
      default = 3;
      description = ''
        Gunicorn workers. With the default immediate task backend a transcode
        occupies its worker for the whole encode, so keep this comfortably above
        the number of conversions you expect at once — or configure a real task
        backend and worker.
      '';
    };

    allowedHosts = mkOption {
      type = types.listOf types.str;
      default = [ "localhost" "127.0.0.1" ];
      example = [ "vault.example.com" ];
      description = "Django ALLOWED_HOSTS.";
    };

    secretKeyFile = mkOption {
      type = types.nullOr types.path;
      default = null;
      example = "/run/secrets/vault-secret-key";
      description = ''
        File containing DJANGO_SECRET_KEY. Read at startup, so it never has to
        appear in the Nix store or in the unit's environment.
      '';
    };

    shares = mkOption {
      type = types.listOf types.path;
      default = [ ];
      example = [ "/mnt/design" "/mnt/footage" ];
      description = ''
        Mounted directories the service should wait for and be able to read.
        These are mount points, not share definitions — mount them however you
        normally would (fileSystems, autofs, systemd.mounts).
      '';
    };

    scanInterval = mkOption {
      type = types.nullOr types.str;
      default = "hourly";
      example = "*-*-* 03:00:00";
      description = "systemd OnCalendar for rescanning shares. Null disables the timer.";
    };

    maintenanceInterval = mkOption {
      type = types.nullOr types.str;
      default = "daily";
      description = "systemd OnCalendar for trash retention, log pruning and media probes.";
    };

    openFirewall = mkOption {
      type = types.bool;
      default = false;
      description = "Open the port in `bind`. Only sensible without a reverse proxy.";
    };

    environment = mkOption {
      type = types.attrsOf types.str;
      default = { };
      example = { TRANSCODE_WORK_DIR = "/scratch/transcode"; };
      description = "Extra environment variables for every Vault unit.";
    };
  };

  config = mkIf cfg.enable {
    users.users = lib.mkIf (cfg.user == "vault") {
      vault = {
        isSystemUser = true;
        group = cfg.group;
        home = cfg.dataDir;
      };
    };
    users.groups = lib.mkIf (cfg.group == "vault") { vault = { }; };

    # Migrations run once per activation, before the server starts.
    systemd.services.vault-migrate = lib.recursiveUpdate common {
      description = "Vault database migrations";
      requiredBy = [ "vault.service" ];
      before = [ "vault.service" ];
      serviceConfig = {
        Type = "oneshot";
        ExecStart = "${cfg.package}/bin/vault migrate --noinput";
      };
    };

    systemd.services.vault = lib.recursiveUpdate common {
      description = "Vault file explorer";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ];
      serviceConfig = {
        ExecStart = lib.concatStringsSep " " [
          "${cfg.package}/bin/vault-serve"
          "--bind ${cfg.bind}"
          "--workers ${toString cfg.workers}"
          # Encoding and share walks are slow; don't let gunicorn kill them.
          "--timeout 0"
          "--access-logfile -"
        ];
        Restart = "on-failure";
        RestartSec = 5;
      };
    };

    systemd.services.vault-scan = mkIf (cfg.scanInterval != null) (lib.recursiveUpdate common {
      description = "Scan Vault shares";
      serviceConfig = {
        Type = "oneshot";
        ExecStart = "${cfg.package}/bin/vault scan_share --all";
        # A scan competes with interactive use; be polite about it.
        Nice = 10;
        IOSchedulingClass = "idle";
      };
    });

    systemd.timers.vault-scan = mkIf (cfg.scanInterval != null) {
      wantedBy = [ "timers.target" ];
      timerConfig = {
        OnCalendar = cfg.scanInterval;
        Persistent = true;
        RandomizedDelaySec = "5m";
      };
    };

    systemd.services.vault-maintenance = mkIf (cfg.maintenanceInterval != null) (lib.recursiveUpdate common {
      description = "Vault maintenance: trash retention, log pruning, media probes";
      serviceConfig = {
        Type = "oneshot";
        ExecStart = "${cfg.package}/bin/vault maintenance";
        Nice = 15;
        IOSchedulingClass = "idle";
      };
    });

    systemd.timers.vault-maintenance = mkIf (cfg.maintenanceInterval != null) {
      wantedBy = [ "timers.target" ];
      timerConfig = {
        OnCalendar = cfg.maintenanceInterval;
        Persistent = true;
        RandomizedDelaySec = "15m";
      };
    };

    networking.firewall.allowedTCPPorts = mkIf cfg.openFirewall [
      (lib.toInt (lib.last (lib.splitString ":" cfg.bind)))
    ];
  };
}
