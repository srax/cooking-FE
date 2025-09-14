#!/bin/sh

remove_if_directory_exists() {
    if [ -d "$1" ]; then rm -Rf "$1"; fi
}

create_if_directory_does_not_exists() {
    if [ ! -d "$1" ]; then mkdir "$1"; fi
}

create_if_directory_does_not_exists 'public'
create_if_directory_does_not_exists 'public/static'

remove_if_directory_exists "public/static/charting_library"
remove_if_directory_exists "public/static/datafeeds"

cp -r "charting_library/charting_library" public/static
cp -r "charting_library/datafeeds" public/static
