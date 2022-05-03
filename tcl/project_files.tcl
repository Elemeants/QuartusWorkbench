load_package flow

set proj_name [lindex $argv 0]

project_open $proj_name

set file_asgn_col [get_all_global_assignments -name VHDL_FILE]

set output [open metadata/files.txt w]
foreach_in_collection file_asgn $file_asgn_col {

    ## Each element in the collection has the following
    ## format: {} {SOURCE_FILE} {<file_name>} {} {}
    set file [lindex $file_asgn 2]
    puts "Detected $file"
    puts $output $file
}
close $output

project_close
