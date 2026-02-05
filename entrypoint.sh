#!/bin/bash

set -e

# ================= DO NOT EDIT BEYOND THIS LINE =================

echo "Waking Mocha up..."

# check if site build should be skipped
if [ "${SKIP_BUILD}" != "true" ]; then
    # run the build process
    echo "Mocha is starting the build process..."
    npm run build:docker
fi

if [ ${?} -eq 0 ]; then
    # link built files to apache root
    if [ -d "/${APP_ROOT}/dist" ]; then
        echo "Removing old /var/www/html and linking /${APP_ROOT}/dist..."
        rm -rf /var/www/html && ln -s "/${APP_ROOT}/dist" /var/www/html
    else
        echo "ERROR: Build directory /${APP_ROOT}/dist does not exist." >&2
        exit 1
    fi

    # perms and ownership setup
    echo "Setting permissions and ownership..."
    # chmod -R 775 "/${APP_ROOT}" /var/www/html /var/log/apache2
    find "/${APP_ROOT}" -type d -exec chmod 755 {} \;
    find "/${APP_ROOT}" -type f -exec chmod 644 {} \;
    chown -R apache: "/${APP_ROOT}" /var/www/html /var/log/apache2

    # run apache server
    echo "Waking Mocha up..."
    httpd -D FOREGROUND
else
    echo "ERROR: Build failed. Keeping the container running for debugging." >&2
    tail -f /dev/null
fi
