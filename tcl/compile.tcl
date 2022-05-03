load_package flow

set proj_name [lindex $argv 0]

project_open $proj_name

# Compile
execute_flow -compile

project_close
