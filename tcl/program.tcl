load_package flow

set proj_name [lindex $argv 0]

project_open $proj_name

set operation "P;output_files/$proj_name.pof"
qexec "quartus_pgm -z --mode=JTAG --operation=$operation"

project_close
