#! /bin/bash

ldd /usr/bin/pdfinfo | sed -n -r 's/(.*)=>\s(.*?)\s(.*)/\2/p' | xargs -I % cp % api/bin/
