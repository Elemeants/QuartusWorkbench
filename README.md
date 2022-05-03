# Quartus Prime Workbench

Extension of Visual Studio code to create, build, simulate and upload to FPGA using Quartus Prime TCL engine.

>
> **NOTE**: Only supports 10M50DAF484C6GES FPGA at this moment.
>

-----------------------------------------------------------------------------------------------------------

## Features

- Create new projects.
- Build and simulate.
- Create test-bench for the project.
- See I/O of the top entity.
- See vhd files in the project.

## Requirements

- Quartus Prime 20.1
- Visual studio code >= 1.66

## Extension Settings

Only one setting is needed which is the path to the Quartus instalation (setting: `quartusprime.quartusInstallPath`). (ex: `C:\\intelFPGA_lite\\20.1`)

## Next objetives

- Upload to FPGA using USB-BLASTER.
- See available pins for the FPGA.
- Assign a pin to an IO port.

# Author

- [Juan D Polanco](https://github.com/Elemeants)
