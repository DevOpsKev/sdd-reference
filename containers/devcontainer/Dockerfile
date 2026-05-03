# devcontainer
#
# IDE-facing image that layers a non-root `vscode` user, zsh, and a starship
# prompt on top of the CI base. The published image is consumed by
# .devcontainer/devcontainer.json.

ARG BASE_IMAGE=git.kevinryan.io/kevin-ryan-associates-public/sdd-reference/basecontainer:latest
FROM ${BASE_IMAGE}

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/zsh $USERNAME \
    && apt-get update \
    && apt-get install -y --no-install-recommends zsh \
    && echo "$USERNAME ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME \
    # starship prompt: single static binary, shell-agnostic.
    && curl -fsSL https://starship.rs/install.sh \
        | sh -s -- --yes --bin-dir /usr/local/bin \
    && rm -rf /var/lib/apt/lists/*

USER $USERNAME

# Initialise starship for both bash (default for many tools) and zsh
# (the user's login shell). The default preset is intentionally used —
# override per-user via ~/.config/starship.toml if desired.
RUN printf '\n# starship prompt\neval "$(starship init bash)"\n' >> /home/$USERNAME/.bashrc \
    && printf '\n# starship prompt\neval "$(starship init zsh)"\n' >> /home/$USERNAME/.zshrc

WORKDIR /workspace
