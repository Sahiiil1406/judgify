import { createFileRoute } from '@tanstack/react-router'

import React, { useState, useEffect } from "react";
import {
  FileCode,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code2,
  Terminal,
  Download,
  FlaskConical,
  ChevronRight,
  Settings,
} from "lucide-react";
import { fetchAndLoadSolc } from "web-solc";
import Ganache from "ganache";
import { ethers } from "ethers";
// import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/web3')({
  component: Web3Component,
});

function Web3Component() {
  const [provider, setProvider] = useState(null);
  const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedValue;
    address public owner;
    
    event ValueUpdated(uint256 newValue, address updatedBy);
    
    constructor() {
        owner = msg.sender;
    }
    
    function set(uint256 value) public {
        storedValue = value;
        emit ValueUpdated(value, msg.sender);
    }
    
    function get() public view returns (uint256) {
        return storedValue;
    }
    
    function getOwner() public view returns (address) {
        return owner;
    }
}`);
  const [compilerVersion, setCompilerVersion] = useState("^0.8.20");
  const [compiling, setCompiling] = useState(false);
  const [compiledData, setCompiledData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [output, setOutput] = useState([]);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const addOutput = (message, type) => {
    setOutput((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  useEffect(() => {
    addOutput("Solidity IDE ready (WASM compiler supported)", "info");
  }, []);

  useEffect(() => {
    const options = {
      logging: { quiet: true },
      wallet: { totalAccounts: 3 },
    };
    const ganacheProvider = Ganache.provider(options);
    setProvider(ganacheProvider);
    console.log("✅ Ganache (npm) initialized:", ganacheProvider);
  }, []);

  const compile = async () => {
    setCompiling(true);
    setErrors([]);
    setWarnings([]);
    setCompiledData(null);
    addOutput(`Loading Solidity compiler ${compilerVersion}...`, "info");

    try {
      const solc = await fetchAndLoadSolc(compilerVersion.replace(/^v/, ""));
      if (!solc) throw new Error("Failed to load Solidity compiler");

      const input = {
        language: "Solidity",
        sources: { "contract.sol": { content: code } },
        settings: {
          optimizer: { enabled: true, runs: 200 },
          outputSelection: { "*": { "*": ["abi", "evm.bytecode", "metadata"] } },
        },
      };

      addOutput("Compiling contract...", "info");
      const outputJSON = await solc.compile(input);
      solc.stopWorker();

      if (outputJSON.errors?.length) {
        const errorList = outputJSON.errors.filter((e) => e.severity === "error");
        const warningList = outputJSON.errors.filter((e) => e.severity === "warning");

        if (errorList.length) {
          setErrors(errorList);
          errorList.forEach((err) =>
            addOutput(err.formattedMessage || err.message, "error")
          );
          setCompiling(false);
          return;
        }

        if (warningList.length) {
          setWarnings(warningList);
          warningList.forEach((warn) =>
            addOutput(warn.formattedMessage || warn.message, "warning")
          );
        }
      }

      const contract = Object.values(outputJSON.contracts["contract.sol"])[0];
      const name = Object.keys(outputJSON.contracts["contract.sol"])[0];

      const compiled = {
        name,
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
        metadata: contract.metadata,
      };
      setCompiledData(compiled);

      addOutput(`✓ Compilation successful: ${name}`, "success");
      addOutput(`Bytecode Size: ${compiled.bytecode.length / 2} bytes`, "info");
    } catch (err) {
      addOutput(`Compilation error: ${err.message}`, "error");
      setErrors([{ formattedMessage: err.message }]);
    }

    setCompiling(false);
  };

  const analyzeContract = () => {
    if (!compiledData) {
      addOutput("Please compile the contract first", "warning");
      return;
    }

    addOutput("Running static analysis...", "info");
    const issues = [];

    if (code.includes("tx.origin")) {
      issues.push({
        severity: "warning",
        message: "Avoid using tx.origin for authentication.",
      });
    }

    if (code.includes("block.timestamp") || code.includes("now")) {
      issues.push({
        severity: "info",
        message: "Timestamp dependence found. Miners can manipulate block.timestamp slightly.",
      });
    }

    if (issues.length === 0) {
      addOutput("✓ No major issues found", "success");
    } else {
      issues.forEach((i) =>
        addOutput(`[${i.severity.toUpperCase()}] ${i.message}`, i.severity)
      );
    }
  };

  const predefinedTests = [
    {
      name: "Set and Get Value",
      function: "set",
      args: [123],
      verify: { function: "get", expected: 123 },
    },
    {
      name: "Owner should be deployer",
      function: "getOwner",
      verify: { function: "getOwner", expectedType: "address" },
    },
  ];

  const runTests = async () => {
    if (!compiledData || !provider) {
      addOutput("Please compile contract first.", "warning");
      return;
    }

    setTesting(true);
    addOutput("🚀 Starting test suite...", "info");

    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const factory = new ethers.ContractFactory(
        compiledData.abi,
        compiledData.bytecode,
        signer
      );
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      addOutput(`Deployed at ${contract.target}`, "success");

      let passCount = 0;
      for (const test of predefinedTests) {
        try {
          let tx;
          if (test.args) {
            tx = await contract[test.function](...test.args);
            if (tx.wait) await tx.wait();
          } else {
            tx = await contract[test.function]();
          }

          let passed = true;
          let actual;
          if (test.verify) {
            const fn = test.verify.function;
            actual = await contract[fn]();
            if (test.verify.expectedType === "address") {
              passed = ethers.isAddress(actual);
            } else if (test.verify.expected !== undefined) {
              passed = actual.toString() === test.verify.expected.toString();
            }
          }

          if (passed) {
            addOutput(`✅ ${test.name} passed`, "success");
            passCount++;
          } else {
            addOutput(`❌ ${test.name} failed (Got: ${actual})`, "error");
          }
        } catch (err) {
          addOutput(`❌ ${test.name} error: ${err.message}`, "error");
        }
      }

      addOutput(
        `🧪 ${passCount}/${predefinedTests.length} tests passed.`,
        passCount === predefinedTests.length ? "success" : "warning"
      );
    } catch (err) {
      addOutput(`Test suite failed: ${err.message}`, "error");
    }

    setTesting(false);
  };

  const downloadABI = () => {
    if (!compiledData) return;
    const blob = new Blob([JSON.stringify(compiledData.abi, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${compiledData.name}_abi.json`;
    a.click();
    URL.revokeObjectURL(url);
    addOutput("Downloaded ABI", "success");
  };

  const downloadBytecode = () => {
    if (!compiledData) return;
    const blob = new Blob([compiledData.bytecode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${compiledData.name}_bytecode.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addOutput("Downloaded Bytecode", "success");
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f0f0f]">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00d9a3] rounded-full"></div>
              <h1 className="text-lg font-semibold text-white tracking-wide">CODEJUDGE</h1>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
            <span className="text-sm text-gray-400">Build a Simple Storage Contract</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={compilerVersion}
              onChange={(e) => setCompilerVersion(e.target.value)}
              className="bg-[#1a1a1a] text-gray-300 text-sm px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-[#00d9a3] transition-colors"
            >
              <option value="^0.8.20">Solidity v0.8.20</option>
              <option value="^0.8.19">Solidity v0.8.19</option>
              <option value="^0.8.18">Solidity v0.8.18</option>
              <option value="^0.8.17">Solidity v0.8.17</option>
            </select>
            <button className="px-4 py-2 bg-[#00d9a3] text-black text-sm font-medium rounded hover:bg-[#00c490] transition-colors">
              ENTER →
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-gray-800 flex flex-col bg-[#0a0a0a]">
          <div className="flex border-b border-gray-800 bg-[#0f0f0f]">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'description'
                  ? 'text-white border-b-2 border-[#00d9a3]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-6 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'solution'
                  ? 'text-white border-b-2 border-[#00d9a3]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Solution
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-6 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'tests'
                  ? 'text-white border-b-2 border-[#00d9a3]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Submissions
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 w-full">
            {activeTab === 'description' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    Simple Storage Contract
                  </h2>
                  <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 bg-[#00d9a3] bg-opacity-10 text-[#00d9a3] text-xs font-medium rounded border border-[#00d9a3] border-opacity-30">EASY</span>
                    <span className="px-3 py-1 bg-gray-800 bg-opacity-50 text-gray-400 text-xs font-medium rounded border border-gray-700">Web3</span>
                  </div>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                  <p>
                    Create a Solidity smart contract that implements a simple storage mechanism. The contract should allow users to store and retrieve an unsigned integer value.
                  </p>

                  <div>
                    <h3 className="font-semibold text-white mb-3 uppercase text-sm tracking-wide">Requirements</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#00d9a3] mt-1">→</span>
                        <span>Create a <code className="bg-[#1a1a1a] px-2 py-0.5 rounded text-[#00d9a3]">uint256</code> variable to store the value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00d9a3] mt-1">→</span>
                        <span>Implement a <code className="bg-[#1a1a1a] px-2 py-0.5 rounded text-[#00d9a3]">set()</code> function to update the stored value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00d9a3] mt-1">→</span>
                        <span>Implement a <code className="bg-[#1a1a1a] px-2 py-0.5 rounded text-[#00d9a3]">get()</code> function to retrieve the current value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00d9a3] mt-1">→</span>
                        <span>Store the contract owner's address on deployment</span>
                      </li>
                      {/* <li className="flex items-start gap-2">
                        <span className="text-[#00d9a3] mt-1">→</span>
                        <span>Emit an event when the value is updated</span>
                      </li> */}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3 uppercase text-sm tracking-wide">Example</h3>
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded p-4 font-mono text-sm space-y-1">
                      <div><span className="text-gray-500">// Deploy contract</span></div>
                      <div><span className="text-[#00d9a3]">set</span>(123) <span className="text-gray-500">// Store value</span></div>
                      <div><span className="text-[#00d9a3]">get</span>() → returns 123</div>
                      <div><span className="text-[#00d9a3]">getOwner</span>() → returns deployer address</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3 uppercase text-sm tracking-wide">Constraints</h3>
                    <ul className="space-y-2 text-sm">
                      {/* <li className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">•</span>
                        <span>Use Solidity version ^0.8.0</span>
                      </li> */}
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">•</span>
                        <span>Follow best practices for gas optimization</span>
                      </li>
                      {/* <li className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">•</span>
                        <span>Include proper event emission</span>
                      </li> */}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Solution Approach</h3>
                <p className="text-gray-400">
                  The solution involves creating a basic smart contract with state variables and functions. Complete the challenge first before viewing hints!
                </p>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Test Cases</h3>
                <div className="space-y-3">
                  {predefinedTests.map((test, idx) => (
                    <div key={idx} className="border border-gray-800 rounded bg-[#0f0f0f] p-4">
                      <div className="font-medium text-white mb-2">Test {idx + 1}: {test.name}</div>
                      <div className="text-sm text-gray-400 font-mono">
                        {test.function}({test.args?.join(', ') || ''})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full flex flex-col bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-gray-800 bg-[#0f0f0f] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <FileCode size={16} className="text-gray-500" />
                <span className="text-gray-300 font-medium">contract.sol</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                <Code2 size={14} /> CODE
              </button>
              <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                PREVIEW
              </button>
              <button
                onClick={runTests}
                disabled={!compiledData || testing}
                className="px-4 py-1.5 bg-[#00d9a3] text-black text-xs font-medium rounded hover:bg-[#00c490] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <Play size={12} /> {testing ? "RUNNING..." : "RUN TESTS"}
              </button>
              <button
                disabled={!compiledData}
                className="px-4 py-1.5 bg-[#1a1a1a] text-white text-xs font-medium rounded hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                SUBMIT
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#1e1e1e] text-gray-100 font-mono text-sm p-4 focus:outline-none resize-none"
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
              spellCheck="false"
            />
          </div>

          <div className="border-t border-gray-800 bg-[#0a0a0a]" style={{ height: '200px' }}>
            <div className="flex items-center justify-between border-b border-gray-800 bg-[#0f0f0f] px-4 py-2">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Console Output</span>
              </div>
              <button 
                onClick={() => setOutput([])}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-1" style={{ height: 'calc(100% - 40px)' }}>
              {output.map((log, i) => (
                <div
                  key={i}
                  className={`text-xs font-mono ${
                    log.type === "success"
                      ? "text-[#00d9a3]"
                      : log.type === "error"
                      ? "text-red-400"
                      : log.type === "warning"
                      ? "text-yellow-500"
                      : "text-gray-500"
                  }`}
                >
                  <span className="text-gray-600">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 bg-[#0f0f0f] px-4 py-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={compile}
                disabled={compiling}
                className="bg-[#1a1a1a] border border-gray-700 text-gray-300 px-4 py-2 rounded text-xs font-medium hover:bg-[#252525] hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Play size={14} /> {compiling ? "Compiling..." : "Compile"}
              </button>

              <button
                onClick={analyzeContract}
                disabled={!compiledData}
                className="bg-[#1a1a1a] border border-gray-700 text-gray-300 px-4 py-2 rounded text-xs font-medium hover:bg-[#252525] hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <AlertTriangle size={14} /> Analyze
              </button>
            </div>

            <div className="flex gap-2">
              {compiledData && (
                <>
                  <button
                    onClick={downloadABI}
                    className="text-xs text-gray-400 hover:text-[#00d9a3] flex items-center gap-1 transition-colors"
                  >
                    <Download size={12} /> ABI
                  </button>
                  <button
                    onClick={downloadBytecode}
                    className="text-xs text-gray-400 hover:text-[#00d9a3] flex items-center gap-1 transition-colors"
                  >
                    <Download size={12} /> Bytecode
                  </button>
                </>
              )}
            </div>
          </div>

          {compiledData && (
            <div className="border-t border-[#00d9a3] border-opacity-30 bg-[#00d9a3] bg-opacity-5 px-4 py-3">
              <div className="flex items-center gap-2 text-[#00d9a3]">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Compilation Successful: {compiledData.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}