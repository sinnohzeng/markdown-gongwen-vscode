import { readFileSync } from "fs";
import * as path from "path";
import { workspace } from "../../test/__mocks__/vscode";
import { config } from "../../config";

const mockGet = jest.fn();
const mockGetConfiguration = jest.fn().mockReturnValue({ get: mockGet });
(workspace as any).getConfiguration = mockGetConfiguration;

describe("config.docx.typography", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGetConfiguration.mockClear();
  });

  it("读取 DOCX 独立设置，不与编辑器 fonts.* 混用", () => {
    const values: Record<string, unknown> = {
      "docx.fonts": { body: { eastAsia: "Custom Body" } },
      "docx.fontSizesPt": { body: 18 },
      "docx.charsPerLine": 30,
      "docx.lineSpacingPt": 30,
      "docx.firstLineIndentChars": 0,
    };
    mockGet.mockImplementation((key: string, fallback: unknown) => values[key] ?? fallback);

    expect(config.docx.typography()).toEqual({
      fonts: { body: { eastAsia: "Custom Body" } },
      fontSizesPt: { body: 18 },
      charsPerLine: 30,
      lineSpacingPt: 30,
      firstLineIndentChars: 0,
    });
    expect(mockGetConfiguration).toHaveBeenCalledWith("markdownGongwen");
    expect(mockGet).not.toHaveBeenCalledWith("fonts.body", expect.anything());
  });

  it("未设置时使用 GB/T 9704 缺省值", () => {
    mockGet.mockImplementation((_key: string, fallback: unknown) => fallback);
    expect(config.docx.typography()).toEqual({
      fonts: {},
      fontSizesPt: {},
      charsPerLine: 28,
      lineSpacingPt: 28,
      firstLineIndentChars: 2,
    });
  });
});

describe("DOCX 设置的 VS Code schema", () => {
  const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../../package.json"), "utf8"),
  ) as {
    contributes: { configuration: { properties: Record<string, any> } };
  };
  const properties = packageJson.contributes.configuration.properties;

  it("公开五项设置并声明缺省值和数值约束", () => {
    expect(properties["markdownGongwen.docx.charsPerLine"]).toMatchObject({
      default: 28, minimum: 1, maximum: 100, multipleOf: 1,
    });
    expect(properties["markdownGongwen.docx.lineSpacingPt"]).toMatchObject({
      default: 28, minimum: 6, maximum: 144, multipleOf: 0.5,
    });
    expect(properties["markdownGongwen.docx.firstLineIndentChars"]).toMatchObject({
      default: 2, minimum: 0, maximum: 10, multipleOf: 0.5,
    });
    expect(properties["markdownGongwen.docx.fonts"].default).toEqual({});
    expect(properties["markdownGongwen.docx.fontSizesPt"].default).toEqual({});
  });

  it("字体角色和字体槽位均有 schema 约束", () => {
    const fonts = properties["markdownGongwen.docx.fonts"];
    const rolePattern = Object.keys(fonts.patternProperties)[0];
    expect(new RegExp(rolePattern).test("body")).toBe(true);
    expect(new RegExp(rolePattern).test("pageNumber")).toBe(true);
    expect(new RegExp(rolePattern).test("unknownRole")).toBe(false);
    expect(fonts.additionalProperties).toBe(false);
    expect(fonts.patternProperties[rolePattern].additionalProperties).toBe(false);
  });
});
