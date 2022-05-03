load_package flow

set proj_name [lindex $argv 0]

project_open $proj_name

# Project configuration
foreach_in_collection asgn_id [get_all_assignments -type parameter -name * -to *] {

    set dest  [get_assignment_info $asgn_id -to]
    set name  [get_assignment_info $asgn_id -name]
    set value [get_assignment_info $asgn_id -value]
    set tag    [get_assignment_info $asgn_id -tag]

    puts "$name (-> $dest) = $value"
}

project_close
