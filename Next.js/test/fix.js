const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'blockchain-study', 'contracts', 'LandDAO.sol');
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/"LandDAO: /g, 'unicode"LandDAO: ');
fs.writeFileSync(file, code);
console.log('Fixed LandDAO.sol');
