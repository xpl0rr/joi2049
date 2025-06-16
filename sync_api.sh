#!/bin/bash

# Sync API directory to remote server, excluding __pycache__ folders
# This script syncs the local api/ directory to the remote server and restarts the API service

echo "Syncing API files..."
rsync -chazvP --exclude='cloud.db' --exclude='__pycache__' --exclude='venv' api/ ocean:/var/www/joi2049/api

# Check if rsync was successful
if [ $? -eq 0 ]; then
    echo "Sync completed successfully. Restarting joi2049-api service..."
    # Restart the systemd service for the API
    # Using systemd is preferred over manual process management because:
    # - systemd handles process supervision and automatic restarts
    # - No need for nohup/& background process management
    # - Proper logging and status monitoring
    # - Service dependencies and startup order
    ssh ocean "sudo systemctl restart joi2049-api.service"
    
    # Check if the service started successfully
    if ssh ocean "systemctl is-active --quiet joi2049-api.service"; then
        echo "joi2049-api service restarted successfully."
    else
        echo "Warning: joi2049-api service may not have started properly."
        ssh ocean "systemctl status joi2049-api.service --no-pager -l"
    fi
else
    echo "Sync failed. API service not restarted."
    exit 1
fi

