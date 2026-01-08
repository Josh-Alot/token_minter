import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log('\n🔑 New private key generated:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Private Key:', privateKey);
console.log('Address:', account.address);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n⚠️  IMPORTANT:');
console.log('   1. Store this private key in a safe location');
console.log('   2. DO NOT share or commit to git');
console.log('   3. Get Sepolia ETH for this address:', account.address);
console.log('\n📝 To configure in Hardhat:');
console.log(`   npx hardhat keystore set SEPOLIA_PRIVATE_KEY`);
console.log(`   # Paste: ${privateKey}`);
console.log('\n💧 Sepolia Faucets:');
console.log('   - https://sepoliafaucet.com');
console.log('   - https://faucet.quicknode.com/ethereum/sepolia');
console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia');