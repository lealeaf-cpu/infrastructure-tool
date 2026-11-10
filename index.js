const readline = require('readline-sync');

const AWS_RESERVED = 5;

function askCidr(label) {
  while (true) {
    const raw = readline.question(`${label} (e.g., /16): `).trim();
    const match = raw.match(/^\/?(\d{1,2})$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n >= 16 && n <= 30) return n;
    }
    console.log('Invalid input. Enter a CIDR between /16 and /30.');
  }
}

function askPositiveInt(label) {
  while (true) {
    const raw = readline.question(label).trim();
    if (/^\d+$/.test(raw) && parseInt(raw, 10) > 0) return parseInt(raw, 10);
    console.log('Invalid input. Enter a positive whole number.');
  }
}

function askPositiveNumber(label) {
  while (true) {
    const raw = readline.question(label).trim().replace(/[$,]/g, '');
    const n = Number(raw);
    if (raw !== '' && Number.isFinite(n) && n > 0) return n;
    console.log('Invalid input. Enter a positive number.');
  }
}

function askYesNo(label) {
  while (true) {
    const raw = readline.question(label).trim().toLowerCase();
    if (raw === 'yes' || raw === 'y') return true;
    if (raw === 'no' || raw === 'n') return false;
    console.log('Invalid input. Enter yes or no.');
  }
}

function askNonEmpty(label) {
  while (true) {
    const raw = readline.question(label).trim();
    if (raw.length > 0) return raw;
    console.log('Invalid input. This cannot be blank.');
  }
}

function subnetHostChecker() {
  console.log('\n--- Subnet Host Checker ---');
  const vpc = askCidr('VPC CIDR');
  const subnet = askCidr('Subnet CIDR');
  const devices = askPositiveInt('Number of devices required: ');

  // A subnet must be the same size as or smaller than its VPC (prefix >= VPC prefix).
  const consistent = subnet >= vpc;
  const total = Math.pow(2, 32 - subnet);
  const usable = Math.max(0, total - AWS_RESERVED);

  console.log('\nResults:');
  if (consistent) {
    console.log(`- Consistent: /${subnet} subnet fits within the /${vpc} VPC.`);
  } else {
    console.log(`- NOT consistent: a /${subnet} subnet is larger than the /${vpc} VPC and cannot fit inside it.`);
  }

  console.log(`- Total addresses in /${subnet}: ${total}; usable after AWS reserves ${AWS_RESERVED}: ${usable}`);

  if (usable >= devices) {
    console.log(`- Sufficient: ${devices} devices fit. Unused IP addresses: ${usable - devices}`);
  } else {
    console.log(`- NOT sufficient for ${devices} devices. Additional IP addresses needed: ${devices - usable}`);
  }
}

function computeEnvironmentSelector() {
  console.log('\n--- Compute Environment Selector ---');
  const app = askNonEmpty('Application name: ');
  const users = askPositiveInt('Monthly users: ');
  const budget = askPositiveNumber('Monthly budget ($): ');
  const ha = askYesNo('High availability required? (yes/no): ');

  let level;
  let recommendation;
  if (users > 10000 || ha) {
    level = 3;
    recommendation = 'EC2 + Load Balancer + Auto Scaling';
  } else if (users >= 1000) {
    level = 2;
    recommendation = 'EC2 + Load Balancer';
  } else {
    level = 1;
    recommendation = 'Single EC2';
  }

  console.log(`\nApplication: ${app}`);
  console.log(`Recommended architecture: ${recommendation}`);

  if (budget < 1000 && level > 1) {
    console.log('WARNING: Budget under $1,000 may not support more than a single EC2 instance.');
  } else if (budget >= 1000 && budget <= 3000 && level === 3) {
    console.log('WARNING: Budget of $1,000-$3,000 may not support Auto Scaling.');
  }
}

function main() {
  console.log('=== Infrastructure Decision Tool ===');
  while (true) {
    console.log('\n1) Subnet Host Checker');
    console.log('2) Compute Environment Selector');
    console.log('3) Exit');
    const choice = readline.question('Choose an option (1-3): ').trim();

    if (choice === '1') {
      subnetHostChecker();
    } else if (choice === '2') {
      computeEnvironmentSelector();
    } else if (choice === '3') {
      break;
    } else {
      console.log('Invalid choice. Enter 1, 2, or 3.');
      continue;
    }

    if (!askYesNo('\nRun another tool? (yes/no): ')) break;
  }
  console.log('Goodbye!');
}

main();
