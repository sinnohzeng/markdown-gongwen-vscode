/**
 * export-command 单元测试：命令入口守卫与图片 URL 收集。
 */
import type { Root } from "mdast";
import { window } from "../../test/__mocks__/vscode";
import {
  createExportDocxCommand,
  createExportDocxQuickCommand,
  collectImageUrls,
} from "../export-command";

const fakeContext = {
  workspaceState: { get: () => undefined, update: jest.fn() },
} as never;

describe("导出命令入口守卫", () => {
  beforeEach(() => {
    (window.showWarningMessage as jest.Mock).mockClear();
  });

  it("Untitled 文档提示先保存再导出（对话框版）", async () => {
    window.activeTextEditor = {
      document: { languageId: "markdown", isUntitled: true },
    } as never;
    await createExportDocxCommand(fakeContext)();
    expect(window.showWarningMessage).toHaveBeenCalledWith(
      "未命名文档无法导出，请先保存文件再导出。",
    );
  });

  it("Untitled 文档提示先保存再导出（快速版）", async () => {
    window.activeTextEditor = {
      document: { languageId: "markdown", isUntitled: true, fileName: "Untitled-1" },
    } as never;
    await createExportDocxQuickCommand(fakeContext)();
    expect(window.showWarningMessage).toHaveBeenCalledWith(
      "未命名文档无法导出，请先保存文件再导出。",
    );
  });
});

describe("collectImageUrls", () => {
  it("收集图片 URL 并去重（同图多次引用只保留一次）", () => {
    const ast = {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "image", url: "a.png" }] },
        {
          type: "paragraph",
          children: [
            { type: "image", url: "a.png" },
            { type: "image", url: "b.png" },
          ],
        },
      ],
    } as unknown as Root;
    expect(collectImageUrls(ast)).toEqual(["a.png", "b.png"]);
  });
});
