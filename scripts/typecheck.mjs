import { spawnSync } from "node:child_process";
import {
  mkdir,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const appDir = path.join(rootDir, "src", "app");
const generatedAppTypesDir = path.join(rootDir, ".next", "types", "app");
const entryFilePattern =
  /^(page|layout|route)\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

const toPosix = (value) => value.split(path.sep).join("/");

const ensureRelativeImport = (value) => {
  const normalized = toPosix(value);
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
};

const createTypeGuardFile = ({ fullPath, importPath, type, slots }) => `// File: ${fullPath}
import * as entry from '${importPath}.js'
${type === "route" ? "import type { NextRequest } from 'next/server.js'" : "import type { ResolvingMetadata, ResolvingViewport } from 'next/dist/lib/metadata/types/metadata-interface.js'"}

type TEntry = typeof import('${importPath}.js')

type SegmentParams<T extends Object = any> = T extends Record<string, any>
  ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
  : T

// Check that the entry is a valid entry
checkFields<Diff<{
  ${
    type === "route"
      ? ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"]
          .map((method) => `${method}?: Function`)
          .join("\n  ")
      : "default: Function"
  }
  config?: {}
  generateStaticParams?: Function
  revalidate?: RevalidateRange<TEntry> | false
  dynamic?: 'auto' | 'force-dynamic' | 'error' | 'force-static'
  dynamicParams?: boolean
  fetchCache?: 'auto' | 'force-no-store' | 'only-no-store' | 'default-no-store' | 'default-cache' | 'only-cache' | 'force-cache'
  preferredRegion?: 'auto' | 'global' | 'home' | string | string[]
  runtime?: 'nodejs' | 'experimental-edge' | 'edge'
  maxDuration?: number
  ${
    type === "route"
      ? ""
      : `
  metadata?: any
  generateMetadata?: Function
  viewport?: any
  generateViewport?: Function
  experimental_ppr?: boolean
  `
  }
}, TEntry, ''>>()

${
  type === "route"
    ? `type RouteContext = { params: Promise<SegmentParams> }`
    : ""
}
${
  type === "route"
    ? ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"]
        .map(
          (method) => `// Check the prop type of the entry function
if ('${method}' in entry) {
  checkFields<
    Diff<
      ParamCheck<Request | NextRequest>,
      {
        __tag__: '${method}'
        __param_position__: 'first'
        __param_type__: FirstArg<MaybeField<TEntry, '${method}'>>
      },
      '${method}'
    >
  >()
  checkFields<
    Diff<
      ParamCheck<RouteContext>,
      {
        __tag__: '${method}'
        __param_position__: 'second'
        __param_type__: SecondArg<MaybeField<TEntry, '${method}'>>
      },
      '${method}'
    >
  >()
  checkFields<
    Diff<
      {
        __tag__: '${method}',
        __return_type__: Response | void | never | Promise<Response | void | never>
      },
      {
        __tag__: '${method}',
        __return_type__: ReturnType<MaybeField<TEntry, '${method}'>>
      },
      '${method}'
    >
  >()
}
`,
        )
        .join("")
    : `// Check the prop type of the entry function
checkFields<Diff<${type === "page" ? "PageProps" : "LayoutProps"}, FirstArg<TEntry['default']>, 'default'>>()

// Check the arguments and return type of the generateMetadata function
if ('generateMetadata' in entry) {
  checkFields<Diff<${type === "page" ? "PageProps" : "LayoutProps"}, FirstArg<MaybeField<TEntry, 'generateMetadata'>>, 'generateMetadata'>>()
  checkFields<Diff<ResolvingMetadata, SecondArg<MaybeField<TEntry, 'generateMetadata'>>, 'generateMetadata'>>()
}

// Check the arguments and return type of the generateViewport function
if ('generateViewport' in entry) {
  checkFields<Diff<${type === "page" ? "PageProps" : "LayoutProps"}, FirstArg<MaybeField<TEntry, 'generateViewport'>>, 'generateViewport'>>()
  checkFields<Diff<ResolvingViewport, SecondArg<MaybeField<TEntry, 'generateViewport'>>, 'generateViewport'>>()
}
`
}
// Check the arguments and return type of the generateStaticParams function
if ('generateStaticParams' in entry) {
  checkFields<Diff<{ params: SegmentParams }, FirstArg<MaybeField<TEntry, 'generateStaticParams'>>, 'generateStaticParams'>>()
  checkFields<Diff<{ __tag__: 'generateStaticParams', __return_type__: any[] | Promise<any[]> }, { __tag__: 'generateStaticParams', __return_type__: ReturnType<MaybeField<TEntry, 'generateStaticParams'>> }>>()
}

export interface PageProps {
  params?: Promise<SegmentParams>
  searchParams?: Promise<any>
}
export interface LayoutProps {
  children?: React.ReactNode
${slots.map((slot) => `  ${slot}: React.ReactNode`).join("\n")}
  params?: Promise<SegmentParams>
}

// =============
// Utility types
type RevalidateRange<T> = T extends { revalidate: any } ? NonNegative<T['revalidate']> : never

// If T is unknown or any, it will be an empty {} type. Otherwise, it will be the same as Omit<T, keyof Base>.
type OmitWithTag<T, K extends keyof any, _M> = Omit<T, K>
type Diff<Base, T extends Base, Message extends string = ''> = 0 extends (1 & T) ? {} : OmitWithTag<T, keyof Base, Message>

type FirstArg<T extends Function> = T extends (...args: [infer T, any]) => any ? unknown extends T ? any : T : never
type SecondArg<T extends Function> = T extends (...args: [any, infer T]) => any ? unknown extends T ? any : T : never
type MaybeField<T, K extends string> = T extends { [k in K]: infer G } ? G extends Function ? G : never : never

${type === "route" ? `type ParamCheck<T> = {
  __tag__: string
  __param_position__: string
  __param_type__: T
}` : ""}

function checkFields<_ extends { [k in keyof any]: never }>() {}

type Numeric = number | bigint
type Zero = 0 | 0n
type Negative<T extends Numeric> = T extends Zero ? never : \`\${T}\` extends \`-\${string}\` ? T : never
type NonNegative<T extends Numeric> = T extends Zero ? T : Negative<T> extends never ? T : '__invalid_negative_number__'
`;

const getSlots = async (layoutFilePath) => {
  const layoutDir = path.dirname(layoutFilePath);
  const entries = await readdir(layoutDir, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name.startsWith("@") &&
        entry.name !== "@children",
    )
    .map((entry) => entry.name.slice(1))
    .sort();
};

const collectAppEntries = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectAppEntries(absolutePath)));
      continue;
    }

    if (entry.isFile() && entryFilePattern.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files.sort();
};

const generateAppTypes = async () => {
  const appStats = await stat(appDir).catch(() => null);
  if (!appStats?.isDirectory()) {
    return;
  }

  await rm(generatedAppTypesDir, { force: true, recursive: true });

  const appEntries = await collectAppEntries(appDir);

  for (const sourceFilePath of appEntries) {
    const parsedPath = path.parse(sourceFilePath);
    const relativeSourcePath = path.relative(appDir, sourceFilePath);
    const outputRelativePath = relativeSourcePath.replace(parsedPath.ext, ".ts");
    const outputFilePath = path.join(generatedAppTypesDir, outputRelativePath);
    const outputDir = path.dirname(outputFilePath);
    const importTarget = path.join(parsedPath.dir, parsedPath.name);
    const importPath = ensureRelativeImport(
      path.relative(outputDir, importTarget),
    );
    const type = parsedPath.name;
    const slots = type === "layout" ? await getSlots(sourceFilePath) : [];

    await mkdir(outputDir, { recursive: true });
    await writeFile(
      outputFilePath,
      createTypeGuardFile({
        fullPath: sourceFilePath,
        importPath,
        type,
        slots,
      }),
    );
  }
};

const pruneTypecheckArtifacts = async () => {
  await mkdir(path.join(rootDir, ".next", "types"), { recursive: true });
  await generateAppTypes();
};

const runTypeScript = () => {
  const result = spawnSync(
    process.execPath,
    [path.join(rootDir, "node_modules", "typescript", "bin", "tsc"), "--noEmit"],
    {
      cwd: rootDir,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

await pruneTypecheckArtifacts();
runTypeScript();
