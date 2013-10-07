##  _       _                     _   
## | |     | |                   | |  
## | | __ _| |__   ___ ___   __ _| |_               Labcoat (R)
## | |/ _` | '_ \ / __/ _ \ / _` | __|              Powerful development environment for Quirrel.
## | | (_| | |_) | (_| (_) | (_| | |_               Copyright (C) 2010 - 2013 SlamData, Inc.
## |_|\__,_|_.__/ \___\___/ \__,_|\__|              All Rights Reserved.
##
##
## This program is free software: you can redistribute it and/or modify it under the terms of the 
## GNU Affero General Public License as published by the Free Software Foundation, either version 
## 3 of the License, or (at your option) any later version.
##
## This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
## without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See 
## the GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License along with this 
## program. If not, see <http://www.gnu.org/licenses/>.
##

clear

# COPY PHP
cp -f ../download.php ../build/download.php
cp -f ../upload.php ../build/upload.php
cp -r -f ../php ../build

# COPY FILES
cp -f ../favicon.ico ../build/favicon.ico

cp -f ace/theme/textmate.css ../build/js/ace/theme/textmate.css

cp -f ace/theme/tomorrow.js ../build/js/ace/theme/tomorrow.js
cp -f ace/theme/tomorrow.css ../build/js/ace/theme/tomorrow.css
cp -f ace/theme/idle_fingers.js ../build/js/ace/theme/idle_fingers.js
cp -f ace/theme/idle_fingers.css ../build/js/ace/theme/idle_fingers.css
cp -f ace/theme/solarized_dark.js ../build/js/ace/theme/solarized_dark.js
cp -f ace/theme/solarized_dark.css ../build/js/ace/theme/solarized_dark.css
cp -f ace/theme/merbivore.js ../build/js/ace/theme/merbivore.js
cp -f ace/theme/merbivore.css ../build/js/ace/theme/merbivore.css

cp -r -f ../css/jquery/ui/gray/images ../build/css/jquery/ui/gray
cp -r -f ../css/jquery/ui/blue/images ../build/css/jquery/ui/blue
cp -r -f ../css/jquery/ui/dark/images ../build/css/jquery/ui/dark
cp -r -f ../css/jquery/ui/black/images ../build/css/jquery/ui/black

cp -r -f ../css/jquery/slickgrid/images ../build/css/jquery/slickgrid

cp -f ../css/images/progress-background.png ../build/css/images/progress-background.png
cp -f ../css/images/logo-precog-white.svg ../build/css/images/logo-precog-white.svg
cp -f ../css/images/logo-precog-black.svg ../build/css/images/logo-precog-black.svg
cp -f ../css/images/logo-gridgain-white.svg ../build/css/images/logo-gridgain-white.svg
cp -f ../css/images/logo-gridgain-black.svg ../build/css/images/logo-gridgain-black.svg
cp -f ../css/images/file.png ../build/css/images/file.png
cp -f ../css/images/more.png ../build/css/images/more.png
cp -f ../css/images/logo-dark-precog.png ../build/css/images/logo-dark-precog.png
cp -r -f libs/jquery/jstree/themes/default ../build/themes
mkdir ../build/css/images/arrows/
cp -f ../css/images/arrows/*.png ../build/css/images/arrows/
cp -f ../css/images/banner-labcoat-logo.png ../build/css/images/banner-labcoat-logo.png

cp -f libs/jquery/zclip/ZeroClipboard.swf ../build/js/libs/jquery/zclip/ZeroClipboard.swf

cp -f ../reference.json ../build/reference.json

# MINIFY CSS
node r.js -o cssIn=../css/main.css out=../build/css/precog-labcoat.css
node r.js -o cssIn=../css/generator.css out=../build/css/precog-link.css
node r.js -o cssIn=ace/css/editor.css out=../build/js/ace/css/editor.css
node r.js -o cssIn=../css/jquery/ui/black/jquery-ui.css out=../build/css/jquery/ui/black/jquery-ui.css
node r.js -o cssIn=../css/jquery/ui/blue/jquery-ui.css out=../build/css/jquery/ui/blue/jquery-ui.css
node r.js -o cssIn=../css/jquery/ui/dark/jquery-ui.css out=../build/css/jquery/ui/dark/jquery-ui.css
node r.js -o cssIn=../css/jquery/ui/gray/jquery-ui.css out=../build/css/jquery/ui/gray/jquery-ui.css

# MINIFY JS
~/bin/uglifyjs -o ../build/js/require-jquery.js require-jquery.js
node r.js -o app.build.js
node --stack_size=100000 /usr/local/lib/node_modules/uglify-js/bin/uglifyjs -o ../build/js/precog-labcoat.js ../build/js/precog-labcoat.js