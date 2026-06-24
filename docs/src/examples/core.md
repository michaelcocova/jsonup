---
outline: [2, 3, 4]
---

# Core 使用示例

## API 参考

### 方法

| 方法名                              | 说明                       |
| ----------------------------------- | -------------------------- |
| `createDocument(input, options?)`   | 创建 `JsonDocument`        |
| `createJsonNodeId()`                | 创建新的节点 id            |
| `isJsonDocument(value)`             | 判断输入是否已经是文档对象 |
| `getDocumentIdentityTree(document)` | 读取内部 identity tree     |
| `getVisibleNodes(nodes)`            | 根据节点展开态计算可见节点 |

`createDocument(input, options?)` 中的 `options` 对象支持以下配置：

| 属性名                 | 类型               | 默认值      | 说明                                                             |
| ---------------------- | ------------------ | ----------- | ---------------------------------------------------------------- |
| `defaultExpandedRoot`  | `boolean`          | `true`      | 是否默认展开根节点。对于对象来说是顶层，对于数组来说是第一层元素 |
| `defaultExpandedAll`   | `boolean`          | `false`     | 是否默认展开所有节点                                             |
| `defaultExpandedDepth` | `number \| true`   | `undefined` | 默认展开到指定层级。传入 `true` 表示展开所有层级                 |
| `expandedPaths`        | `Iterable<string>` | `undefined` | 默认展开的路径集合                                               |
| `identityTree`         | `JsonNodeIdentity` | `undefined` | 标识树，用于在重新创建文档时进行状态恢复和 ID 复用               |
| `cloneRaw`             | `boolean`          | `false`     | 是否克隆原始输入数据，开启后可防止内部状态突变                   |

### 查询

| 方法名                                   | 说明                                   |
| ---------------------------------------- | -------------------------------------- |
| `document.getNode(id)`                   | 按 id 取节点                           |
| `document.getParent(id)`                 | 取父节点                               |
| `document.getChildren(id)`               | 取直接子节点                           |
| `document.getDescendants(id)`            | 取整棵子树                             |
| `document.getPath(id)`                   | 从 id 反查路径                         |
| `document.findByPath(path)`              | 从路径查节点                           |
| `document.search(query)`                 | 按 `key`、`path`、`value`、`type` 搜索 |
| `document.stringify(space?)`             | 输出 JSON 字符串                       |
| `document.toggleExpanded(id, expanded?)` | 切换展开状态                           |

### 类型

| 类型名         | 说明                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `JsonInput`    | 支持的原始 JSON 数据输入格式，可以是对象、数组、基本类型等                  |
| `JsonDocument` | 解析后生成的文档实例，包含内部节点树结构及操作/查询方法                     |
| `JsonNode`     | 扁平化后的单一节点对象，包含 `id`、`path`、`type`、`value` 及父子级关系映射 |
| `JsonNodeId`   | 节点的唯一标识符（字符串），用于各种 API 的查找与操作参数                   |

## 示例

### 基础用法

`createDocument()` 会返回一个真正的 `JsonDocument` 对象，文档本身就带查询、展开和 `stringify()` 能力。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument(
  {
    name: "jsonup",
    scripts: {
      dev: "vp dev",
    },
  },
  {
    defaultExpandedDepth: 1,
  },
);

console.log(document.type); // "object-json"
console.log(document.visibleNodes.map((node) => node.path));
console.log(document.stringify(2));
```

### 传入对象

对象会被构造成 `object-json`，每个字段都有稳定 `id` 和路径。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument({
  repository: {
    type: "git",
    url: "https://github.com/cocoa/jsonup",
  },
});

const repository = document.findByPath("repository");
const url = document.findByPath("repository.url");
```

### 传入数组

数组会被构造成 `array-json`，路径使用 `[]` 表示索引。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument([{ name: "jsonup" }, { name: "vitepress" }]);

const first = document.findByPath("[0]");
const secondName = document.findByPath("[1].name");
```

### 展开与收起

展开状态已经在 core 文档对象里，直接调用 `toggleExpanded()` 即可。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument({
  scripts: {
    dev: "vp dev",
    build: "vp build",
  },
});

const scriptsNode = document.findByPath("scripts");

if (scriptsNode) {
  document.toggleExpanded(scriptsNode.id, true);
  document.toggleExpanded(scriptsNode.id, false);
  document.toggleExpanded(scriptsNode.id);
}
```

### 默认展开

默认展开由创建文档时的选项控制，`defaultExpandedDepth` 优先级高于 `defaultExpandedAll`。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument(
  {
    a: {
      b: {
        c: {
          value: true,
        },
      },
    },
  },
  {
    defaultExpandedAll: true,
    defaultExpandedDepth: 2,
  },
);
```

### 选择节点

最常见的做法是保存节点 `id`，再通过文档对象反查。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument({ scripts: { dev: "vp dev" } });
const selectedId = document.findByPath("scripts")?.id;

if (selectedId) {
  console.log(document.getNode(selectedId));
  console.log(document.getChildren(selectedId));
}
```

### 节点操作(增删改查)

结构修改使用 `@jsonup/operation`，返回的新文档会尽量复用已有节点 id 和展开路径。详情参考 [`操作示例`](./editing.md)。

### 增删改查示例

```ts twoslash
import { createDocument } from "@jsonup/core";
import { insert, remove, updateValue } from "@jsonup/operation";

let document = createDocument({
  scripts: {
    dev: "vp dev",
  },
});

const scriptsNode = document.findByPath("scripts");
const devNode = document.findByPath("scripts.dev");

if (scriptsNode) {
  document = insert(document, scriptsNode.id, {
    key: "preview",
    value: "vp preview",
  });
}

if (devNode) {
  document = updateValue(document, devNode.id, "npm run dev");
  document = remove(document, devNode.id);
}
```

### 重命名对象 Key

`renameKey()` 只对 object 子节点生效。

```ts twoslash
import { createDocument } from "@jsonup/core";
import { renameKey } from "@jsonup/operation";

let document = createDocument({
  scripts: {
    dev: "vp dev",
  },
});

const devNode = document.findByPath("scripts.dev");

if (devNode) {
  document = renameKey(document, devNode.id, "start");
}
```

### 移动节点

`move()` 支持把节点移动到新的 object 或 array 父节点下。

```ts twoslash
import { createDocument } from "@jsonup/core";
import { move } from "@jsonup/operation";

let document = createDocument({
  scripts: {
    dev: "vp dev",
  },
  commands: {},
});

const devNode = document.findByPath("scripts.dev");
const commandsNode = document.findByPath("commands");

if (devNode && commandsNode) {
  document = move(document, devNode.id, commandsNode.id);
}
```

### 搜索节点

可以按 `key`、`path`、`value`、`type` 做搜索。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument({
  scripts: {
    dev: "vp dev",
    build: "vp build",
  },
});

const result = document.search("dev");
```

### 路径查询

路径查询和 id 查询都可以直接走文档对象方法。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument({
  scripts: {
    dev: "vp dev",
  },
});

const node = document.findByPath("scripts.dev");

if (node) {
  console.log(document.getPath(node.id)); // "scripts.dev"
  console.log(document.getParent(node.id));
}
```

### Big Number

超出安全整数范围的数字和高精度小数会保留为 `Decimal`。

```ts twoslash
import { createDocument } from "@jsonup/core";
import { Decimal } from "decimal.js";

const document = createDocument({
  unsafe: 9007199254740993n,
  decimal: new Decimal("12345678901234567890.123456789"),
});

console.log(document.findByPath("unsafe")?.value);
console.log(document.findByPath("decimal")?.value);
```

### JSON 字符串解析

`createDocument()` 可以直接接收 JSON 字符串。

```ts twoslash
import { createDocument } from "@jsonup/core";

const document = createDocument(`{"name":"jsonup","version":"0.1.0"}`);
```

### 重复 Key

`jsonup` 面向 JavaScript 运行时对象工作。重复 key 在进入运行时后会被后一个值覆盖。

```ts twoslash
const raw = JSON.parse(`{"name":"jsonup","name":"vitepress"}`);

console.log(raw.name); // "vitepress"
```

### 虚拟滚动

core 只负责文档和节点计算，虚拟滚动属于渲染层能力。

- 大数据示例：[`/examples/10w`](./10w.md)
- 说明页：[`/virtual`](../virtual.md)
