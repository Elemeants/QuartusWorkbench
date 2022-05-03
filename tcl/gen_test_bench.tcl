load_package flow

set proj_name [lindex $argv 0]

project_open $proj_name

qexec "quartus_eda --read_settings_files=on --write_settings_files=off $proj_name -c $proj_name --gen_testbench"

project_close
