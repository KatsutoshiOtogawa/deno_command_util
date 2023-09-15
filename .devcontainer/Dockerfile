
FROM mcr.microsoft.com/devcontainers/base:jammy
RUN su - vscode -c "curl -fsSL https://deno.land/x/install/install.sh | sh"

RUN su - vscode -c "echo export DENO_INSTALL=/home/vscode/.deno >> /home/vscode/.bashrc"
RUN su - vscode -c "echo 'export PATH=\$DENO_INSTALL/bin:\$PATH' >> /home/vscode/.bashrc"
