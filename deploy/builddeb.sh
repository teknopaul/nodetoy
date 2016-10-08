#!/bin/bash -e
#
# Build the .deb package
# Files to be build into the .deb should be build to ../deploy/root before calling this script (or edit it).  e.g. cp --archive src/* ../deploy/root/opt/myproj/
#
test `id -u` == "0" || (echo "Run as root" && exit 1) # requires bash -e

#
# The package name
#
NAME=nodetoy
ARCH=noarch

#
# Select the files to include
#
cd `dirname $0`/..
PROJECT_ROOT=`pwd`

#
# Copy files e.g.   cp --archive src/* ${PROJECT_ROOT}/deploy/root/opt/$NAME/
#
rm -rf deploy/root
mkdir -p deploy/root/opt/nodetoy
cp --archive app bin conf server deploy/root/opt/nodetoy

FILES=${PROJECT_ROOT}/deploy/root

#
# Create a temporary build directory
#
TMP_DIR=/tmp/${NAME}_debbuild
rm -rf ${TMP_DIR}
mkdir -p ${TMP_DIR}

#
# Setup DEBIAN/control
#
. ./version
cp --archive -R ${PROJECT_ROOT}/deploy/DEBIAN ${TMP_DIR}/
sed -e "s/@PACKAGE_VERSION@/${VERSION}/" ${TMP_DIR}/DEBIAN/control.in > ${TMP_DIR}/DEBIAN/control
cp --archive -R ${FILES}/* ${TMP_DIR}/

SIZE=$(du -sk ${TMP_DIR} | cut -f 1)
sed -i -e "s/@SIZE@/${SIZE}/" /tmp/${NAME}_debbuild/DEBIAN/control

#
# Setup the installation package ownership here if it needs root
#
chown -R root.root ${TMP_DIR}/opt

#
# Build the .deb
#
mkdir -p target
dpkg-deb --build ${TMP_DIR} target/${NAME}-${VERSION}-1.${ARCH}.deb

test -f target/${NAME}-${VERSION}-1.${ARCH}.deb

echo "built target/${NAME}-${VERSION}-1.${ARCH}.deb"
