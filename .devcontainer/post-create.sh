#!/bin/bash
set -e

# Ensure $HOME/.local/bin exists and is in PATH
mkdir -p "$HOME/.local/bin"
if ! grep -q '\.local/bin' "$HOME/.bashrc" 2>/dev/null; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
fi
export PATH="$HOME/.local/bin:$PATH"

if ! command -v openspec &> /dev/null; then
    npm install -g @fission-ai/openspec@latest
fi

# Claude Code CLI (skip if already installed)
if ! command -v claude &> /dev/null; then
    curl -fsSL https://claude.ai/install.sh | bash
fi

# OpenCode CLI
if ! command -v opencode &> /dev/null; then
    curl -fsSL https://opencode.ai/install | bash
fi

# Gentle AI
if ! command -v gentle-ai &> /dev/null; then
    curl -fsSL https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.sh | bash
fi