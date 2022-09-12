import fs from 'node:fs';

import type { ILayout } from 'src/features/form/layout';
import type { LayoutExpression } from 'src/features/form/layout/expressions/types';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

export interface SharedTest {
  name: string;
  layouts?: {
    [key: string]: {
      $schema: string;
      data: {
        layout: ILayout;
      };
    };
  };
  dataModel?: any;
  instanceContext?: IInstanceContext;
  frontendSettings?: IApplicationSettings;
}

export interface SharedTestContext {
  component?: string;
  rowIndices?: number[];
  currentLayout?: string;
}

export interface ContextTest extends SharedTest {
  expectedContexts: SharedTestContext[];
}

export interface FunctionTest extends SharedTest {
  expression: LayoutExpression;
  expects?: any;
  expectsFailure?: string;
  context?: SharedTestContext;
}

interface TestFolder<T> {
  folderName: string;
  content: T[];
}

interface TestFolders {
  'context-lists': TestFolder<TestFolder<ContextTest>>;
  functions: TestFolder<TestFolder<FunctionTest>>;
  invalid: TestFolder<FunctionTest>;
}

export function getSharedTests<Folder extends keyof TestFolders>(
  subPath: Folder,
  parentPath = '',
): TestFolders[Folder] {
  const out: TestFolder<any> = {
    folderName: subPath,
    content: [],
  };
  const fullPath = `${__dirname}/${parentPath}/${subPath}`;

  fs.readdirSync(fullPath).forEach((name) => {
    const isDir = fs.statSync(`${fullPath}/${name}`).isDirectory();
    if (isDir) {
      out.content.push(
        getSharedTests(name as keyof TestFolders, `${parentPath}/${subPath}`),
      );
    } else if (name.endsWith('.json')) {
      const testJson = fs.readFileSync(`${fullPath}/${name}`);
      const test = JSON.parse(testJson.toString());
      test.name += ` (${name})`;
      out.content.push(test);
    }
  });

  return out;
}
