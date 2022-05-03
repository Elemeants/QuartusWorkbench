load_package flow

set proj_name [lindex $argv 0]
set vhdl_file [lindex $argv 1]

project_open $proj_name

# Project configuration
set_global_assignment -name VHDL_FILE $vhdl_file.vhd

project_close
