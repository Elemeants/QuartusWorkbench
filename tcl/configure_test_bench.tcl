load_package flow

set proj_name [lindex $argv 0]
set test_proj test_$proj_name
set test_file_path simulation/modelsim/$proj_name.vht

project_open $proj_name

# Test-bench configuration
set_global_assignment -name EDA_NATIVELINK_SIMULATION_TEST_BENCH $test_proj -section_id eda_simulation
set_global_assignment -name EDA_TEST_BENCH_NAME $test_proj -section_id eda_simulation
set_global_assignment -name EDA_DESIGN_INSTANCE_NAME NA -section_id $test_proj
set_global_assignment -name EDA_TEST_BENCH_MODULE_NAME $test_proj -section_id $test_proj
set_global_assignment -name EDA_TEST_BENCH_FILE $test_file_path -section_id $test_proj

# Save assignments
export_assignments

project_close
