Infrastructure Decision Tool
============================

Setup and run (requires Node.js):
  npm install
  node index.js

Menu: 1) Subnet Host Checker, 2) Compute Environment Selector, 3) Exit.
After each run you are asked whether to continue.

Note: AWS reserves 5 addresses in every subnet, so usable = 2^(32 - CIDR) - 5.

Example 1 - Subnet IS sufficient
  VPC CIDR: /16
  Subnet CIDR: /24
  Devices: 200
  Result: consistent; 256 total, 251 usable; sufficient, 51 unused IPs.

Example 2 - Subnet is NOT sufficient
  VPC CIDR: /16
  Subnet CIDR: /24
  Devices: 300
  Result: consistent; 251 usable; NOT sufficient, 49 additional IPs needed.
