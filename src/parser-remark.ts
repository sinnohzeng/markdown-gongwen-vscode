// Helper module to handle ESM imports for remark
// This allows the parser to work in both CommonJS (VS Code) and ESM (Jest) contexts

let unified: any;
let remarkParse: any;
let remarkGfm: any;
let visit: any;

export async function getRemarkProcessor() {
  if (!unified) {
    // 单路径 CJS require：bundle 后为 CommonJS，Jest（Node 22+ require ESM）
    // 亦实测可 require 成功；原 ESM 回退分支从未走到，已删除。
    unified = require('unified').unified;
    remarkParse = require('remark-parse');
    remarkGfm = require('remark-gfm');
    visit = require('unist-util-visit').visit;
  }

  return {
    unified,
    remarkParse: remarkParse.default || remarkParse,
    remarkGfm: remarkGfm.default || remarkGfm,
    visit,
  };
}

// Synchronous version for VS Code extension (uses require)
export function getRemarkProcessorSync() {
  if (!unified) {
    // Use require - works in VS Code extension CommonJS context
    // For Jest, we need to ensure transformIgnorePatterns includes these modules
    unified = require('unified').unified;
    remarkParse = require('remark-parse');
    remarkGfm = require('remark-gfm');
    visit = require('unist-util-visit').visit;
  }

  return {
    unified,
    remarkParse: remarkParse.default || remarkParse,
    remarkGfm: remarkGfm.default || remarkGfm,
    visit,
  };
}

