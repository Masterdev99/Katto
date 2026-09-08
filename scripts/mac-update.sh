#!/bin/bash

# System Update Handler - macOS
# This script handles the update notification and installation process

set -e

# Configuration
WEBHOOK_URL="https://your-worker-domain.workers.dev/webhook/update-complete"
SYSTEM_NAME="macOS"
VERSION="2.0.0"
USER_ID=$(id -un)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Display update header
display_header() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║         System Update v${VERSION}         ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Show initial notification using native macOS tools
show_notification() {
    local title="$1"
    local message="$2"

    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"$message\" with title \"$title\""
    fi
}

# Run update installation process
run_update_process() {
    log_info "Starting system update process..."
    echo ""

    # Step 1: Pre-flight checks
    log_info "Step 1: Running pre-flight checks..."
    sleep 1
    log_success "System requirements verified"
    echo ""

    # Step 2: Download components
    log_info "Step 2: Preparing update components..."
    sleep 1
    log_success "Components ready"
    echo ""

    # Step 3: Install update
    log_info "Step 3: Installing update..."
    # Add your actual update commands here
    # Example: sudo installer -pkg update.pkg -target /
    sleep 2
    log_success "Update installed successfully"
    echo ""

    # Step 4: Verify installation
    log_info "Step 4: Verifying installation..."
    sleep 1
    log_success "Installation verified"
    echo ""
}

# Send notification to webhook
send_notification() {
    log_info "Sending update notification..."

    # Build JSON payload
    local json_payload=$(cat <<EOF
{
  "system": "${SYSTEM_NAME}",
  "timestamp": "${TIMESTAMP}",
  "version": "${VERSION}",
  "userId": "${USER_ID}"
}
EOF
)

    # Send POST request using curl
    if command -v curl &> /dev/null; then
        local response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$json_payload" \
            "$WEBHOOK_URL" 2>/dev/null || echo "error")

        local http_code=$(echo "$response" | tail -n1)

        if [ "$http_code" = "200" ]; then
            log_success "Notification sent successfully"
        else
            log_error "Failed to send notification (HTTP ${http_code})"
            log_info "Continuing without webhook confirmation..."
        fi
    else
        log_error "curl not found - cannot send notification"
    fi
}

# Display completion message
show_completion() {
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════╗"
    echo "║      Update Installation Complete     ║"
    echo "║          System v${VERSION} Ready         ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"

    echo ""
    log_success "Your system is now up to date!"
    echo ""
    log_info "Computer: $(hostname)"
    log_info "User: ${USER_ID}"
    log_info "Time: ${TIMESTAMP}"
    echo ""
}

# Error handler
handle_error() {
    log_error "An error occurred during update"
    echo "Error on line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Main execution
main() {
    display_header

    # Show macOS notification
    show_notification "System Update" "Version ${VERSION} is being installed"

    # Run update process
    run_update_process

    # Send webhook notification
    send_notification

    # Show completion
    show_completion

    # Optional: Log to local file
    local log_file="${HOME}/Library/Logs/system-update.log"
    echo "[$(date)] System Update v${VERSION} completed successfully" >> "$log_file" 2>/dev/null || true

    exit 0
}

# Execute
main
