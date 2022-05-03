load_package flow

set quartus_install_path [lindex $argv 0]
set proj_name [lindex $argv 1]

project_open $proj_name

set tcl_script_sim_path [file join [file join $quartus_install_path] "quartus/common/tcl/internal/nativelink/qnativesim.tcl"]

qexec "quartus_sh -t $tcl_script_sim_path --rtl_sim $proj_name $proj_name"

project_close
