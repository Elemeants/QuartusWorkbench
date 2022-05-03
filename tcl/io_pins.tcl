load_package flow

set proj_name [lindex $argv 0]

project_open $proj_name

set output [open metadata/pins.txt w]
# Dump pins
set pins [get_names -node_type pin -filter *]
foreach_in_collection name $pins {
    set target [get_name_info -info full_path $name]
    if ([string compare -length 1 $target ~]) {
        puts "Detected I/O $target"
        puts $output $target
    }
}
close $output

project_close
