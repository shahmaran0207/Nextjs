/**
 * compile.js
 * ─────────────────────────────────────────────────────────────────
 * .sol 파일(Solidity 소스코드)을 읽어서 ABI + 바이트코드로 컴파일합니다.
 *
 * [왜 컴파일이 필요한가?]
 * .sol 파일은 사람이 읽는 코드임. 블록체인(EVM)은 이걸 직접 못 읽음.
 * 컴파일러(solc)가 .sol → 바이트코드(기계어)로 변환해줌.
 *
 * [결과물]
 * - ABI: 컨트랙트의 함수 목록/파라미터 정의서. 프론트엔드가 사용.
 * - bytecode: 블록체인에 실제로 올라가는 기계어 코드.
 * ─────────────────────────────────────────────────────────────────
 */

const solc = require("solc");
const fs = require("fs");
const path = require("path");

// ── 컴파일할 계약서 파일들 경로 설정 ────────────────────────────
const contractsDir = path.join(__dirname, "..", "contracts");

/**
 * solc 컴파일러에게 import된 파일을 찾아주는 함수.
 * GasToken.sol 안에 import "./ERC20.sol" 이 있으면,
 * solc가 이 함수를 호출해서 ERC20.sol 내용을 가져감.
 */
function findImports(importPath) {
  try {
    const fullPath = path.join(contractsDir, importPath);
    return { contents: fs.readFileSync(fullPath, "utf8") };
  } catch (e) {
    return { error: "File not found: " + importPath };
  }
}

/**
 * 특정 .sol 파일을 컴파일해서 { abi, bytecode }를 반환하는 함수.
 * @param {string} fileName - 컴파일할 파일명 (예: "GasToken.sol")
 * @param {string} contractName - 파일 내 컨트랙트 이름 (예: "GasToken")
 */
function compile(fileName, contractName) {
  console.log(`\n🔨 컴파일 중: ${fileName}...`);

  const source = fs.readFileSync(path.join(contractsDir, fileName), "utf8");

  // solc 컴파일러에 넘길 입력 형식(JSON)
  const input = {
    language: "Solidity",
    sources: {
      [fileName]: { content: source },
    },
    settings: {
      // evmVersion: "paris" → PUSH0 opcode 미사용
      // Solidity 0.8.20+의 기본값은 "shanghai"인데 Ganache가 PUSH0를 지원 안 함
      evmVersion: "paris",
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode"] },
      },
    },
  };

  // solc.compile()은 JSON 문자열을 받아 JSON 문자열을 반환
  const outputJson = solc.compile(JSON.stringify(input), { import: findImports });
  const output = JSON.parse(outputJson);

  // 컴파일 에러 확인
  if (output.errors) {
    const errors = output.errors.filter((e) => e.severity === "error");
    if (errors.length > 0) {
      console.error("❌ 컴파일 에러:");
      errors.forEach((e) => console.error(e.formattedMessage));
      process.exit(1); // 에러 시 프로세스 종료
    }
    // severity가 'warning'인 것들은 무시
  }

  const compiled = output.contracts[fileName][contractName];

  if (!compiled) {
    console.error(`❌ "${contractName}" 컨트랙트를 찾을 수 없습니다.`);
    process.exit(1);
  }

  const abi = compiled.abi;
  const bytecode = "0x" + compiled.evm.bytecode.object;
  // bytecode 앞에 "0x"를 붙여야 ethers.js가 16진수로 인식함

  console.log(`✅ ${contractName} 컴파일 성공! (ABI 함수 수: ${abi.length}개)`);
  return { abi, bytecode };
}

module.exports = { compile };
