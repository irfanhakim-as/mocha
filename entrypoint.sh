#!/bin/bash

set -e

# ================= DO NOT EDIT BEYOND THIS LINE =================

# check required environment variables
if [ -z "${APP_ROOT}" ]; then
    echo "ERROR: APP_ROOT environment variable is not set." >&2
    exit 1
fi

echo "Waking Mocha up..."

# copy user-supplied files
if [ -n "${CONFIG_DIR}" ] && [ -d "${CONFIG_DIR}" ]; then
    # copy json data files
    if [ -d "${CONFIG_DIR}/data" ] && [ -n "$(ls ${CONFIG_DIR}/data/*.json 2>/dev/null)" ]; then
        echo "Mocha is copying over some data files..."
        cp -v ${CONFIG_DIR}/data/*.json "/${APP_ROOT}/src/data/"
    fi
    # copy images
    if [ -d "${CONFIG_DIR}/images" ] && [ -n "$(ls -A ${CONFIG_DIR}/images 2>/dev/null)" ]; then
        echo "Mocha is copying over some images..."
        cp -rv ${CONFIG_DIR}/images/. "/${APP_ROOT}/src/assets/images/"
    fi
fi

# check if site build should be skipped
if [ "${SKIP_BUILD}" != "true" ]; then
    # run the build process
    echo "Mocha is packing something for you..."
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
    echo "Mocha is marking his territory..."
    # chmod -R 775 "/${APP_ROOT}" /var/www/html /var/log/apache2
    find "/${APP_ROOT}" -type d -exec chmod 755 {} \;
    find "/${APP_ROOT}" -type f -exec chmod 644 {} \;
    chown -R apache: "/${APP_ROOT}" /var/www/html /var/log/apache2

    # run apache server
    echo "Mocha is going for a run..."
    httpd -D FOREGROUND
else
    echo "ERROR: Build failed. Keeping the container running for debugging." >&2
    tail -f /dev/null
fi
