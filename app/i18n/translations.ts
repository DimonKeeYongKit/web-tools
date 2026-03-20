const zh = {
  common: {
    back: "← 返回",
  },
  home: {
    subtitle: "日常好用的小工具集合",
    tools: {
      "qr-code": {
        title: "QR Code 生成器",
        description: "将文本或链接即时转换为可下载的 QR Code",
      },
      "json-formatter": {
        title: "JSON 格式化",
        description: "美化或压缩 JSON，高亮错误提示",
      },
      cyberchef: {
        title: "CyberChef",
        description: "加密、编码、压缩和数据分析的网络瑞士军刀",
      },
      "password-generator": {
        title: "密码生成器",
        description: "生成自定义长度和规则的安全随机密码",
      },
      "word-counter": {
        title: "字数统计",
        description: "统计字符数、单词数、行数及阅读时间",
      },
      "uuid-generator": {
        title: "UUID 生成器",
        description: "批量生成 UUID v4 随机唯一标识",
      },
      ifixit: {
        title: "iFixit",
        description: "免费的维修手册，适用于任何物品",
      },
    },
  },
  qrCode: {
    inputLabel: "输入文本或链接",
    placeholder: "https://example.com 或任意文字...",
    size: "大小",
    bgColor: "背景色",
    fgColor: "前景色",
    formatLabel: "选择下载格式",
    download: "下载",
    empty: "输入内容后将在此显示 QR Code",
  },
  jsonFormatter: {
    indent: "缩进",
    twoSpaces: "2 空格",
    fourSpaces: "4 空格",
    oneTab: "1 Tab",
    format: "格式化",
    minify: "压缩",
    copyResult: "复制结果",
    inputLabel: "输入 JSON",
    outputLabel: "输出",
    outputPlaceholder: "格式化结果将显示在这里...",
  },
  passwordGenerator: {
    length: "密码长度",
    charSets: {
      uppercase: "大写字母 A-Z",
      lowercase: "小写字母 a-z",
      digits: "数字 0-9",
      symbols: "符号 !@#...",
    },
    count: "生成数量",
    countUnit: " 个",
    generate: "生成密码",
    copy: "复制",
    copied: "✓ 已复制",
  },
  wordCounter: {
    chars: "字符数（含空格）",
    charsNoSpace: "字符数（不含空格）",
    words: "单词数",
    lines: "行数",
    sentences: "句子数",
    readingTime: "阅读时长 (分钟)",
    inputLabel: "在此输入文本",
    clear: "清空",
    placeholder: "粘贴或输入任意文本，统计结果实时更新...",
  },
  uuidGenerator: {
    count: "生成数量",
    countUnit: " 个",
    generate: "生成 UUID",
    copyAll: "复制全部",
    copiedAll: "✓ 已全部复制",
    copy: "复制",
    copied: "✓",
    empty: "点击「生成 UUID」按钮开始",
  },
};

type Translations = typeof zh;

const en: Translations = {
  common: {
    back: "← Back",
  },
  home: {
    subtitle: "A collection of handy everyday utilities",
    tools: {
      "qr-code": {
        title: "QR Code Generator",
        description: "Convert text or URLs into a downloadable QR Code",
      },
      "json-formatter": {
        title: "JSON Formatter",
        description: "Prettify or minify JSON with error highlighting",
      },
      cyberchef: {
        title: "CyberChef",
        description: "The Cyber Swiss Army Knife for encryption, encoding, compression and data analysis",
      },
      "password-generator": {
        title: "Password Generator",
        description: "Generate secure random passwords with custom rules",
      },
      "word-counter": {
        title: "Word Counter",
        description: "Count characters, words, lines, and reading time",
      },
      "uuid-generator": {
        title: "UUID Generator",
        description: "Bulk generate UUID v4 unique identifiers",
      },
      ifixit: {
        title: "iFixit",
        description: "The free repair manual for everything",
      },
    },
  },
  qrCode: {
    inputLabel: "Enter text or URL",
    placeholder: "https://example.com or any text...",
    size: "Size",
    bgColor: "Background",
    fgColor: "Foreground",
    formatLabel: "Choose download format",
    download: "Download",
    empty: "Enter content to preview the QR Code",
  },
  jsonFormatter: {
    indent: "Indent",
    twoSpaces: "2 spaces",
    fourSpaces: "4 spaces",
    oneTab: "1 Tab",
    format: "Format",
    minify: "Minify",
    copyResult: "Copy result",
    inputLabel: "Input JSON",
    outputLabel: "Output",
    outputPlaceholder: "Formatted result will appear here...",
  },
  passwordGenerator: {
    length: "Length",
    charSets: {
      uppercase: "Uppercase A-Z",
      lowercase: "Lowercase a-z",
      digits: "Digits 0-9",
      symbols: "Symbols !@#...",
    },
    count: "Count",
    countUnit: "",
    generate: "Generate",
    copy: "Copy",
    copied: "✓ Copied",
  },
  wordCounter: {
    chars: "Characters (incl. spaces)",
    charsNoSpace: "Characters (excl. spaces)",
    words: "Words",
    lines: "Lines",
    sentences: "Sentences",
    readingTime: "Reading time (min)",
    inputLabel: "Type or paste text here",
    clear: "Clear",
    placeholder: "Paste or type any text, stats update in real time...",
  },
  uuidGenerator: {
    count: "Count",
    countUnit: "",
    generate: "Generate UUID",
    copyAll: "Copy all",
    copiedAll: "✓ All copied",
    copy: "Copy",
    copied: "✓",
    empty: 'Click "Generate UUID" to start',
  },
};

export const translations = { zh, en } as const;
export type Lang = keyof typeof translations;
